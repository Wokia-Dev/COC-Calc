import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';

function walk(dir) {
  let res = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) res = res.concat(walk(full));
    else res.push(full);
  }
  return res;
}

const cacacheIndex = path.join(os.homedir(), '.npm/_cacache/index-v5');
const cacacheContent = path.join(os.homedir(), '.npm/_cacache/content-v2/sha512');
const targetNodeModules = path.join(process.cwd(), 'node_modules');
const binDir = path.join(targetNodeModules, '.bin');

fs.mkdirSync(binDir, { recursive: true });

const indexFiles = walk(cacacheIndex);
const tarballs = new Map();

for (const f of indexFiles) {
  const raw = fs.readFileSync(f, 'utf8');
  for (const line of raw.split('\n')) {
    const idx = line.indexOf('\t');
    if (idx !== -1) {
      try {
        const parsed = JSON.parse(line.slice(idx + 1));
        if (parsed.key && parsed.integrity && parsed.key.endsWith('.tgz')) {
          const hex = Buffer.from(parsed.integrity.replace('sha512-', ''), 'base64').toString('hex');
          const contentPath = path.join(cacacheContent, hex.slice(0, 2), hex.slice(2, 4), hex.slice(4));
          if (fs.existsSync(contentPath)) {
            tarballs.set(parsed.key, contentPath);
          }
        }
      } catch (e) {}
    }
  }
}

console.log(`Found ${tarballs.size} unique tarballs.`);

const binsToLink = [];
let extractedCount = 0;

for (const [key, contentPath] of tarballs) {
  try {
    // List files to find package.json path (e.g. package/package.json or react/package.json)
    const listRaw = execSync(`tar -tzf "${contentPath}" 2>/dev/null`, { maxBuffer: 10 * 1024 * 1024 }).toString('utf8');
    const lines = listRaw.split('\n');
    const pkgJsonEntry = lines.find(l => l.endsWith('/package.json') || l === 'package.json');
    if (!pkgJsonEntry) continue;

    const pkgJsonRaw = execSync(`tar -xzf "${contentPath}" "${pkgJsonEntry}" -O 2>/dev/null`, { maxBuffer: 10 * 1024 * 1024 }).toString('utf8');
    const pkg = JSON.parse(pkgJsonRaw);
    const pkgName = pkg.name;
    if (!pkgName) continue;

    const pkgTargetDir = path.join(targetNodeModules, ...pkgName.split('/'));
    fs.mkdirSync(pkgTargetDir, { recursive: true });

    // Extract all files into pkgTargetDir
    execSync(`tar -xzf "${contentPath}" -C "${pkgTargetDir}" --strip-components=1 2>/dev/null`);
    extractedCount++;

    if (pkg.bin) {
      if (typeof pkg.bin === 'string') {
        binsToLink.push({ name: pkgName.split('/').pop(), targetPath: path.join(pkgTargetDir, pkg.bin) });
      } else if (typeof pkg.bin === 'object') {
        for (const [binName, binRelPath] of Object.entries(pkg.bin)) {
          binsToLink.push({ name: binName, targetPath: path.join(pkgTargetDir, binRelPath) });
        }
      }
    }
  } catch (err) {
    // Ignore individual extraction failures
  }
}

console.log(`Extracted ${extractedCount} packages. Now creating binaries...`);

for (const { name, targetPath } of binsToLink) {
  if (fs.existsSync(targetPath)) {
    try {
      fs.chmodSync(targetPath, 0o755);
      const linkPath = path.join(binDir, name);
      try { fs.unlinkSync(linkPath); } catch (e) {}
      const relPath = path.relative(binDir, targetPath);
      fs.symlinkSync(relPath, linkPath);
    } catch (err) {
      console.warn(`Failed to link bin ${name}:`, err.message);
    }
  }
}

console.log('Unpacking complete!');
