import { useState, useEffect } from 'react';

/**
 * Provides a synchronized, live Unix millisecond timestamp updating every second.
 * Heartbeat runs via requestAnimationFrame for drift-free precision,
 * with visibilitychange/focus handlers to immediately recover from browser throttling.
 */
export function useClock(intervalMs: number = 1000): number {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    let animId: number;
    let lastTickMs = Date.now();

    const tick = () => {
      const current = Date.now();
      if (current - lastTickMs >= intervalMs) {
        lastTickMs = current;
        setNow(current);
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    const handleSync = () => {
      const current = Date.now();
      lastTickMs = current;
      setNow(current);
    };

    // Background interval to keep clock progressing if tab is hidden and rAF is paused
    const bgInterval = setInterval(handleSync, intervalMs);

    window.addEventListener('visibilitychange', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(bgInterval);
      window.removeEventListener('visibilitychange', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [intervalMs]);

  return now;
}
