import React from 'react';
import { LayoutDashboard, Hammer, FlaskConical, PawPrint, Download } from 'lucide-react';
import { CategoryType, TabType } from '../../types/index.ts';
import { useTranslation } from '../../lib/i18n.ts';

interface TabNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  categoryCounts: Record<CategoryType, number>;
  deferredPrompt: any;
  onInstallPwa: () => void;
}

export const TabNav: React.FC<TabNavProps> = ({
  activeTab,
  onSelectTab,
  categoryCounts,
  deferredPrompt,
  onInstallPwa,
}) => {
  const { language, setLanguage, t } = useTranslation();

  const tabs: { id: TabType; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'overview',
      label: t.tabs.overview,
      icon: <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />,
      color: 'from-amber-400 to-amber-500',
    },
    {
      id: 'builders',
      label: t.tabs.builders,
      icon: <Hammer className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />,
      color: 'from-amber-500 to-amber-600',
    },
    {
      id: 'laboratory',
      label: t.tabs.laboratory,
      icon: <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />,
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'petHouse',
      label: t.tabs.petHouse,
      icon: <PawPrint className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />,
      color: 'from-emerald-500 to-emerald-600',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        {/* Top bar with Logo, PWA install, and Language toggle */}
        <div className="flex items-center justify-between py-2.5 border-b border-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-[1.5px] shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-amber-400 text-lg tracking-tighter">⚡</span>
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Clash<span className="text-amber-400">Timer</span>
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                {t.app.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* PWA Install Button (shown when installable) */}
            {deferredPrompt && (
              <button
                onClick={onInstallPwa}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-all cursor-pointer"
                title={t.app.installPrompt}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{t.app.installPwa}</span>
              </button>
            )}

            {/* Language Switcher Pill */}
            <div className="inline-flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-bold">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  language === 'fr'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* Categories Tab Navigation */}
        <nav className="flex justify-between items-center gap-1 sm:gap-2 pt-1 pb-1.5 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tab.id !== 'overview' ? (categoryCounts[tab.id as CategoryType] || 0) : 0;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex-1 min-w-[68px] sm:min-w-[100px] flex items-center justify-center gap-1 sm:gap-2 py-2 px-1.5 sm:px-3 rounded-xl transition-all cursor-pointer select-none text-[11px] sm:text-sm font-semibold relative ${
                  isActive
                    ? 'bg-slate-900 text-white border border-slate-700 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-amber-400' : 'text-slate-400'}>
                  {tab.icon}
                </span>
                <span className="truncate">{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
                {/* Active glow indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-2 right-2 sm:left-3 sm:right-3 h-[2px] bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
