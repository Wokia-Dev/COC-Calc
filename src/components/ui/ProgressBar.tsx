import React from 'react';
import { CategoryType } from '../../types/index.ts';
import { useTranslation } from '../../lib/i18n.ts';

interface ProgressBarProps {
  progress: number; // 0 to 100
  isFinished: boolean;
  category: CategoryType;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  isFinished,
  category,
  showLabel = true,
}) => {
  const { t } = useTranslation();
  const clamped = Math.min(100, Math.max(0, progress));

  const getGradient = () => {
    if (isFinished) {
      return 'from-emerald-400 via-teal-300 to-emerald-500 shadow-emerald-500/50';
    }
    switch (category) {
      case 'builders':
        return 'from-amber-500 via-yellow-400 to-amber-600 shadow-amber-500/40';
      case 'laboratory':
        return 'from-purple-500 via-pink-400 to-purple-600 shadow-purple-500/40';
      case 'petHouse':
        return 'from-emerald-500 via-teal-400 to-emerald-600 shadow-emerald-500/40';
    }
  };

  return (
    <div className="w-full space-y-1.5">
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400 font-sans text-[11px] uppercase tracking-wider">
            {isFinished ? t.cards.finishedProgress : t.cards.progressLabel}
          </span>
          <span className={isFinished ? 'text-emerald-400 font-bold' : 'text-slate-300 font-semibold'}>
            {clamped.toFixed(1)}%
          </span>
        </div>
      )}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-700/60 p-[1px]">
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-300 ease-out shadow-sm ${getGradient()} ${
            isFinished ? 'animate-pulse' : ''
          }`}
          style={{ width: `${clamped}%` }}
        />
        {/* Subtle glossy highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-full" />
      </div>
    </div>
  );
};
