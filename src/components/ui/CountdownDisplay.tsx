import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { formatCountdown } from '../../lib/timeEngine.ts';
import { Language } from '../../types/index.ts';
import { useTranslation } from '../../lib/i18n.ts';

interface CountdownDisplayProps {
  remainingMs: number;
  isFinished: boolean;
  language: Language;
  size?: 'sm' | 'md' | 'lg';
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  remainingMs,
  isFinished,
  language,
  size = 'md',
}) => {
  const { t } = useTranslation();
  const formatted = formatCountdown(remainingMs, language);

  const sizeStyles = {
    sm: 'text-sm font-semibold tracking-tight',
    md: 'text-lg sm:text-xl font-bold tracking-tight',
    lg: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
  }[size];

  if (isFinished) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-sm sm:text-base animate-pulse">
        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
        <span>{t.cards.finished}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Clock className="w-4 h-4 text-amber-400/80 shrink-0" />
      <span className={`font-mono text-slate-100 ${sizeStyles}`}>
        {formatted}
      </span>
    </div>
  );
};
