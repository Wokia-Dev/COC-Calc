import React, { useState, useEffect } from 'react';
import { CategoryType, TabType, BoostState } from './types/index.ts';
import { I18nProvider } from './lib/i18n.ts';
import { useClock } from './hooks/useClock.ts';
import { useBoost } from './hooks/useBoost.ts';
import { useUpgrades } from './hooks/useUpgrades.ts';
import { TabNav } from './components/layout/TabNav.tsx';
import { CategoryPage } from './pages/CategoryPage.tsx';
import { OverviewPage } from './pages/OverviewPage.tsx';

// BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const now = useClock(1000);
  const { boosts, activatePotion, cancelPotion } = useBoost();
  const {
    upgrades,
    getUpgradesByCategory,
    addUpgrade,
    updateUpgradeName,
    updateUpgradeDuration,
    completeUpgradeNow,
    deleteUpgrade,
    handleBoostChange,
  } = useUpgrades();

  // Listen for PWA installation prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleActivatePotionForCategory = (cat: CategoryType) => {
    activatePotion(cat, now, (category: CategoryType, oldBoost: BoostState, newBoost: BoostState) => {
      handleBoostChange(category, oldBoost, newBoost, now);
    });
  };

  const handleCancelPotionForCategory = (cat: CategoryType) => {
    cancelPotion(cat, now, (category: CategoryType, oldBoost: BoostState, newBoost: BoostState) => {
      handleBoostChange(category, oldBoost, newBoost, now);
    });
  };

  const categoryCounts: Record<CategoryType, number> = {
    builders: getUpgradesByCategory('builders').length,
    laboratory: getUpgradesByCategory('laboratory').length,
    petHouse: getUpgradesByCategory('petHouse').length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/20">
      {/* Sticky Top Header & Tabs */}
      <TabNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        categoryCounts={categoryCounts}
        deferredPrompt={deferredPrompt}
        onInstallPwa={handleInstallPwa}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        {activeTab === 'overview' ? (
          <OverviewPage
            upgrades={upgrades}
            boosts={boosts}
            now={now}
            onActivatePotion={handleActivatePotionForCategory}
            onAddUpgrade={(cat: CategoryType, name: string, durationMs: number) =>
              addUpgrade(cat, name, durationMs, boosts[cat], now)
            }
            onSelectTab={setActiveTab}
          />
        ) : (
          <CategoryPage
            category={activeTab}
            upgrades={getUpgradesByCategory(activeTab)}
            boost={boosts[activeTab]}
            now={now}
            onActivatePotion={() => handleActivatePotionForCategory(activeTab)}
            onCancelPotion={() => handleCancelPotionForCategory(activeTab)}
            onAddUpgrade={(cat: CategoryType, name: string, durationMs: number) =>
              addUpgrade(cat, name, durationMs, boosts[cat], now)
            }
            onUpdateDuration={(id: string, durationMs: number) =>
              updateUpgradeDuration(id, durationMs, boosts[activeTab], now)
            }
            onUpdateName={updateUpgradeName}
            onFinishNow={(id) => completeUpgradeNow(id, now)}
            onDeleteUpgrade={deleteUpgrade}
          />
        )}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <MainApp />
    </I18nProvider>
  );
};

export default App;
