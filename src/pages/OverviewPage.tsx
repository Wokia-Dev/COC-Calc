import React, { useState } from 'react';
import {
  Layers,
  Zap,
  Timer,
  Hammer,
  FlaskConical,
  PawPrint,
  Plus,
  Clock,
  Calendar,
  CheckCircle,
  ChevronRight,
  ListOrdered,
} from 'lucide-react';
import { CategoryType, BoostState, Upgrade, TabType } from '../types/index.ts';
import {
  formatRelativeFinish,
  formatExactDate,
  formatCountdown,
  formatBoostCountdown,
} from '../lib/timeEngine.ts';
import { useTranslation } from '../lib/i18n.ts';
import { Button } from '../components/ui/Button.tsx';
import { AddUpgradeModal } from '../components/upgrade/AddUpgradeModal.tsx';
import { PotionPreviewModal } from '../components/upgrade/PotionPreviewModal.tsx';

interface OverviewPageProps {
  upgrades: Upgrade[];
  boosts: Record<CategoryType, BoostState>;
  now: number;
  onActivatePotion: (category: CategoryType) => void;
  onAddUpgrade: (category: CategoryType, name: string, durationMs: number) => void;
  onSelectTab?: (tab: TabType) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  upgrades,
  boosts,
  now,
  onActivatePotion,
  onAddUpgrade,
  onSelectTab,
}) => {
  const { language, t, formatString } = useTranslation();

  const [addingCategory, setAddingCategory] = useState<CategoryType | null>(null);
  const [previewPotionCategory, setPreviewPotionCategory] = useState<CategoryType | null>(null);

  // Global Stats calculations
  const allActiveUpgrades = upgrades.filter((u) => u.finishesAt > now);
  const allFinishedUpgrades = upgrades.filter((u) => u.finishesAt <= now);

  const activeCategories: CategoryType[] = ['builders', 'laboratory', 'petHouse'];
  const activeBoostsCount = activeCategories.filter(
    (cat) => boosts[cat]?.expiresAt && boosts[cat].expiresAt! > now
  ).length;

  const nextFinishingUpgrade =
    allActiveUpgrades.length > 0
      ? allActiveUpgrades.reduce((earliest, u) =>
          u.finishesAt < earliest.finishesAt ? u : earliest
        )
      : null;

  // Sorted list for Recent / All Upgrades
  const sortedActive = [...allActiveUpgrades].sort((a, b) => a.finishesAt - b.finishesAt);
  const sortedFinished = [...allFinishedUpgrades].sort((a, b) => b.finishesAt - a.finishesAt);
  const allSortedUpgrades = [...sortedActive, ...sortedFinished];

  const categoryConfigs: {
    id: CategoryType;
    name: string;
    icon: React.ReactNode;
    borderClass: string;
    badgeStyle: string;
  }[] = [
    {
      id: 'builders',
      name: t.tabs.builders,
      icon: <Hammer className="w-5 h-5 text-amber-400 shrink-0" />,
      borderClass: 'border-amber-500/30 hover:border-amber-500/50',
      badgeStyle: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    {
      id: 'laboratory',
      name: t.tabs.laboratory,
      icon: <FlaskConical className="w-5 h-5 text-purple-400 shrink-0" />,
      borderClass: 'border-purple-500/30 hover:border-purple-500/50',
      badgeStyle: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    },
    {
      id: 'petHouse',
      name: t.tabs.petHouse,
      icon: <PawPrint className="w-5 h-5 text-emerald-400 shrink-0" />,
      borderClass: 'border-emerald-500/30 hover:border-emerald-500/50',
      badgeStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Global Stats Bar */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Upgrades */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.overview.statsTotalUpgrades}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-extrabold text-white">
                {upgrades.length}
              </span>
              <span className="text-xs text-slate-400 truncate">
                {formatString(t.overview.activeCount, { count: allActiveUpgrades.length })}
              </span>
            </div>
          </div>
        </div>

        {/* Active Boosts */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-purple-400 fill-purple-400/20" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.overview.statsActiveBoosts}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-extrabold text-purple-300">
                {activeBoostsCount}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 3</span>
            </div>
          </div>
        </div>

        {/* Next Finishing Upgrade */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Timer className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.overview.statsNextFinish}
            </span>
            {nextFinishingUpgrade ? (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  {(() => {
                    const nextCat = categoryConfigs.find((c) => c.id === nextFinishingUpgrade.category);
                    return nextCat ? (
                      <span className={`inline-block px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0 ${nextCat.badgeStyle}`}>
                        {nextCat.name}
                      </span>
                    ) : null;
                  })()}
                  <span className="text-sm font-bold text-slate-100 truncate">
                    {nextFinishingUpgrade.name}
                  </span>
                </div>
                <div className="text-xs text-amber-400 font-medium truncate mt-0.5">
                  {formatRelativeFinish(nextFinishingUpgrade.finishesAt, now, language)}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic mt-0.5">
                {t.overview.noActiveUpgrades}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Category Summary Cards */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          {t.overview.categories}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryConfigs.map((cat) => {
            const catUpgrades = upgrades.filter((u) => u.category === cat.id);
            const catActive = catUpgrades.filter((u) => u.finishesAt > now);
            const catFinished = catUpgrades.filter((u) => u.finishesAt <= now);
            const catNext =
              catActive.length > 0
                ? catActive.reduce((earliest, u) =>
                    u.finishesAt < earliest.finishesAt ? u : earliest
                  )
                : null;
            const boost = boosts[cat.id];
            const isBoostActive = Boolean(boost?.expiresAt && boost.expiresAt > now);
            const boostRemainingMs =
              isBoostActive && boost.expiresAt ? boost.expiresAt - now : 0;

            return (
              <div
                key={cat.id}
                className={`flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-slate-900/90 border shadow-lg backdrop-blur-sm transition-all ${cat.borderClass}`}
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => onSelectTab?.(cat.id)}
                      className="group flex items-center gap-2.5 text-left cursor-pointer focus:outline-none"
                      title={t.overview.categoryCardTitle}
                    >
                      <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                        {cat.icon}
                      </div>
                      <span className="font-bold text-base text-slate-100 group-hover:text-amber-400 transition-colors">
                        {cat.name}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border ${cat.badgeStyle}`}
                      >
                        {formatString(t.overview.activeCount, { count: catActive.length })}
                      </span>
                    </div>
                  </div>

                  {/* Body: Next upgrade and Finished count */}
                  <div className="py-3.5 space-y-2.5">
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        {t.overview.statsNextFinish} :
                      </span>
                      {catNext ? (
                        <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                          <span className="text-white">{catNext.name}</span>
                          <span className="text-slate-500 mx-1">—</span>
                          <span className="text-amber-400 font-mono">
                            {formatRelativeFinish(catNext.finishesAt, now, language)}
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 italic">
                          {t.overview.noActiveUpgrades}
                        </p>
                      )}
                    </div>

                    {catFinished.length > 0 ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>
                          {formatString(t.overview.finishedCount, { count: catFinished.length })}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800/40 text-slate-400 border border-slate-700/50">
                        <CheckCircle className="w-3 h-3 text-slate-500" />
                        <span>{t.overview.noFinishedUpgrades}</span>
                      </div>
                    )}

                    {/* Boost status */}
                    <div className="pt-1">
                      {isBoostActive ? (
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs">
                          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
                          <span className="font-mono font-bold text-purple-200">
                            {boost.multiplier}x
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="font-mono text-purple-300 font-medium">
                            {formatBoostCountdown(boostRemainingMs)} {t.boost.remaining}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic px-0.5">
                          {t.overview.noBoostActive}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => setAddingCategory(cat.id)}
                    icon={<Plus className="w-3.5 h-3.5" />}
                    className="flex-1"
                  >
                    {t.overview.addButton}
                  </Button>
                  <Button
                    variant="potion"
                    size="xs"
                    onClick={() => setPreviewPotionCategory(cat.id)}
                    icon={<Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />}
                    className="flex-1"
                  >
                    {isBoostActive ? t.boost.addPotion : t.overview.activatePotion}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Recent / All Upgrades List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.overview.allUpgradesTitle}
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
            {allSortedUpgrades.length}
          </span>
        </div>

        {allSortedUpgrades.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-500 text-xs sm:text-sm italic">
            {t.overview.noUpgradesRecorded}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {allSortedUpgrades.map((upgrade) => {
              const isFinished = now >= upgrade.finishesAt;
              const remainingRealMs = Math.max(0, upgrade.finishesAt - now);
              const catConfig = categoryConfigs.find((c) => c.id === upgrade.category);

              return (
                <div
                  key={upgrade.id}
                  className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 ${
                    isFinished
                      ? 'bg-slate-950/70 border-emerald-500/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-750'
                  }`}
                >
                  {/* Left: Name and Category Badge */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {catConfig && (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${catConfig.badgeStyle}`}
                      >
                        {catConfig.name}
                      </span>
                    )}
                    <span className="font-bold text-sm sm:text-base text-slate-100 truncate">
                      {upgrade.name}
                    </span>
                    {isFinished && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        {t.cards.finished}
                      </span>
                    )}
                  </div>

                  {/* Right: Countdown and Exact Finish Time */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 text-xs">
                    {!isFinished && (
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{formatCountdown(remainingRealMs, language)}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:items-end text-slate-400 text-[11px] sm:text-xs">
                      <div className="flex items-center gap-1 text-slate-300 font-medium">
                        <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{formatExactDate(upgrade.finishesAt, language)}</span>
                      </div>
                      {formatRelativeFinish(upgrade.finishesAt, now, language) !== formatExactDate(upgrade.finishesAt, language) && (
                        <span className="text-[10px] text-amber-400/90 font-mono">
                          {formatRelativeFinish(upgrade.finishesAt, now, language)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add Upgrade Modal */}
      {addingCategory && (
        <AddUpgradeModal
          isOpen={Boolean(addingCategory)}
          onClose={() => setAddingCategory(null)}
          category={addingCategory}
          boost={boosts[addingCategory]}
          existingUpgradeCount={upgrades.filter((u) => u.category === addingCategory).length}
          now={now}
          onSave={(name, durationMs) => {
            onAddUpgrade(addingCategory, name, durationMs);
            setAddingCategory(null);
          }}
        />
      )}

      {/* Potion Preview Modal */}
      {previewPotionCategory && (
        <PotionPreviewModal
          isOpen={Boolean(previewPotionCategory)}
          onClose={() => setPreviewPotionCategory(null)}
          onConfirm={() => {
            onActivatePotion(previewPotionCategory);
            setPreviewPotionCategory(null);
          }}
          category={previewPotionCategory}
          upgrades={upgrades.filter((u) => u.category === previewPotionCategory)}
          boost={boosts[previewPotionCategory]}
          now={now}
        />
      )}
    </div>
  );
};
