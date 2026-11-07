import React, { useState } from 'react';
import { Zap, Plus, X, Sparkles } from 'lucide-react';
import { CategoryType, BoostState, Upgrade } from '../../types/index.ts';
import { formatBoostCountdown } from '../../lib/timeEngine.ts';
import { useTranslation } from '../../lib/i18n.ts';
import { Button } from '../ui/Button.tsx';
import { PotionPreviewModal } from '../upgrade/PotionPreviewModal.tsx';

interface BoostBannerProps {
  category: CategoryType;
  boost: BoostState;
  now: number;
  upgrades?: Upgrade[];
  onActivatePotion: () => void;
  onCancelPotion: () => void;
}

export const BoostBanner: React.FC<BoostBannerProps> = ({
  category,
  boost,
  now,
  upgrades = [],
  onActivatePotion,
  onCancelPotion,
}) => {
  const { t, formatString } = useTranslation();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const isActive = Boolean(boost.expiresAt && boost.expiresAt > now);
  const remainingMs = isActive && boost.expiresAt ? boost.expiresAt - now : 0;

  const potionNames: Record<CategoryType, string> = {
    builders: t.boost.builderPotion,
    laboratory: t.boost.researchPotion,
    petHouse: t.boost.petPotion,
  };

  const potionName = potionNames[category];
  const multiplier = boost.multiplier;
  const hoursSaved = multiplier - 1; // 1 real hour gains multiplier hours, saving (multiplier - 1) hours

  if (!isActive) {
    return (
      <>
        <div className="bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-700/60 rounded-2xl p-3 sm:p-4 shadow-md backdrop-blur-sm transition-all hover:border-slate-600">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-slate-100">
                    {potionName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {formatString(t.boost.speedMultiplier, { multiplier })}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatString(t.boost.boostTimeSaved, { saved: hoursSaved })}
                </p>
              </div>
            </div>

            <Button
              variant="potion"
              size="sm"
              onClick={() => setShowPreviewModal(true)}
              icon={<Zap className="w-4 h-4 fill-amber-300 text-amber-300" />}
              className="w-full sm:w-auto"
            >
              {t.boost.activateNow}
            </Button>
          </div>
        </div>

        <PotionPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          onConfirm={onActivatePotion}
          category={category}
          upgrades={upgrades}
          boost={boost}
          now={now}
        />
      </>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-indigo-950/80 border border-purple-500/50 rounded-2xl p-3 sm:p-4 shadow-lg shadow-purple-950/30 backdrop-blur-sm animate-in fade-in duration-200">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20 animate-pulse">
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-purple-200">
                  ⚡ {potionName} {t.boost.activeStatus}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  {formatString(t.boost.speedMultiplier, { multiplier })}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-mono text-purple-300/90 mt-0.5 flex items-center gap-1.5">
                <span className="font-bold text-slate-100">{formatBoostCountdown(remainingMs)}</span>
                <span className="text-purple-400/80 font-sans">{t.boost.remaining}</span>
              </p>
            </div>
          </div>

          {/* Action buttons: Stack +1h or Cancel */}
          <div className="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto justify-end">
            {showCancelConfirm ? (
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-rose-500/50 rounded-xl p-1 animate-in zoom-in-95">
                <span className="text-[11px] text-rose-300 px-2 font-medium">
                  {t.boost.cancelConfirm}
                </span>
                <Button
                  variant="danger"
                  size="xs"
                  onClick={() => {
                    setShowCancelConfirm(false);
                    onCancelPotion();
                  }}
                >
                  {t.boost.confirmCancel}
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  {t.boost.keepBoost}
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="potion"
                  size="sm"
                  onClick={() => setShowPreviewModal(true)}
                  icon={<Plus className="w-4 h-4" />}
                  className="flex-1 sm:flex-initial"
                >
                  {t.boost.addPotion}
                </Button>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                  title={t.boost.cancelBoost}
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <PotionPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onConfirm={onActivatePotion}
        category={category}
        upgrades={upgrades}
        boost={boost}
        now={now}
      />
    </>
  );
};
