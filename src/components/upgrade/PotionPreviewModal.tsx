import React, { useEffect } from 'react';
import { X, Zap, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { CategoryType, BoostState, Upgrade } from '../../types/index.ts';
import {
  simulatePotionImpact,
  formatTimeSaved,
  formatRelativeFinish,
  formatExactDate,
} from '../../lib/timeEngine.ts';
import { useTranslation } from '../../lib/i18n.ts';
import { Button } from '../ui/Button.tsx';

interface PotionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  category: CategoryType;
  upgrades: Upgrade[];
  boost: BoostState;
  now: number;
}

export const PotionPreviewModal: React.FC<PotionPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  category,
  upgrades,
  boost,
  now,
}) => {
  const { language, t, formatString } = useTranslation();

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { activeItems } = simulatePotionImpact(upgrades, boost, now);

  const potionNames: Record<CategoryType, string> = {
    builders: t.boost.builderPotion,
    laboratory: t.boost.researchPotion,
    petHouse: t.boost.petPotion,
  };

  const potionName = potionNames[category];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl z-10 max-h-[92vh] flex flex-col">
        {/* Mobile handle drag bar */}
        <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {t.potionPreview.title}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-purple-300 font-medium">
                  {potionName}
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {formatString(t.boost.speedMultiplier, { multiplier: boost.multiplier })}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-4 space-y-3 flex-1 scrollbar-thin">
          {activeItems.length === 0 ? (
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-5 text-center space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto text-slate-400">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                {t.potionPreview.noActiveUpgradesNotice}
              </p>
            </div>
          ) : (
            <>
              <div className="text-xs text-slate-400 font-medium">
                {t.potionPreview.subtitle} :
              </div>
              <div className="space-y-2.5">
                {activeItems.map(({ upgrade, currentFinishAt, projectedFinishAt, timeSavedMs }) => {
                  const currentRel = formatRelativeFinish(currentFinishAt, now, language);
                  const currentExact = formatExactDate(currentFinishAt, language);
                  const projRel = formatRelativeFinish(projectedFinishAt, now, language);
                  const projExact = formatExactDate(projectedFinishAt, language);

                  return (
                    <div
                      key={upgrade.id}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-750 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-sm text-slate-100 truncate">
                          {upgrade.name}
                        </div>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0"
                          title={formatString(t.potionPreview.timeSaved, { time: formatTimeSaved(timeSavedMs) })}
                        >
                          {formatTimeSaved(timeSavedMs)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 gap-2">
                        {/* Current finish */}
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
                            {t.potionPreview.currentFinish}
                          </span>
                          <span className="line-through decoration-slate-500 text-slate-400 font-mono text-xs">
                            {currentRel}
                          </span>
                          {currentRel !== currentExact && (
                            <span className="text-[10px] text-slate-400 font-sans">
                              ({currentExact})
                            </span>
                          )}
                        </div>

                        {/* Transition Arrow */}
                        <div className="flex items-center justify-center px-1 text-amber-400 shrink-0">
                          <ArrowRight className="w-4 h-4 text-amber-400" />
                        </div>

                        {/* New projected finish */}
                        <div className="flex flex-col items-end min-w-0">
                          <span className="text-[10px] text-amber-400/90 font-semibold uppercase tracking-wider mb-0.5">
                            {t.potionPreview.projectedFinish}
                          </span>
                          <span className="text-amber-400 font-bold font-mono text-xs">
                            {projRel}
                          </span>
                          {projRel !== projExact && (
                            <span className="text-[10px] text-slate-400 font-sans">
                              ({projExact})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
          >
            {t.potionPreview.cancel}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleConfirm}
            icon={<Sparkles className="w-4 h-4 text-slate-950" />}
          >
            {t.potionPreview.confirmActivation}
          </Button>
        </div>
      </div>
    </div>
  );
};
