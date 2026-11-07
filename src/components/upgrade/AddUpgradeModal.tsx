import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, Calendar, AlertCircle } from 'lucide-react';
import { CategoryType, BoostState, Upgrade } from '../../types/index.ts';
import { durationToMs, msToParts, computeFinishAt, computeRemainingUpgradeMs, formatRelativeFinish, formatExactDate } from '../../lib/timeEngine.ts';
import { useTranslation } from '../../lib/i18n.ts';
import { Button } from '../ui/Button.tsx';

interface AddUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryType;
  boost: BoostState;
  existingUpgradeCount: number;
  now: number;
  editingUpgrade?: Upgrade | null;
  onSave: (name: string, durationMs: number, durationChanged?: boolean) => void;
}

export const AddUpgradeModal: React.FC<AddUpgradeModalProps> = ({
  isOpen,
  onClose,
  category,
  boost,
  existingUpgradeCount,
  now,
  editingUpgrade,
  onSave,
}) => {
  const { language, t, formatString } = useTranslation();

  const [name, setName] = useState('');
  const [days, setDays] = useState<string>('0');
  const [hours, setHours] = useState<string>('0');
  const [minutes, setMinutes] = useState<string>('0');
  const [initialRemainingMs, setInitialRemainingMs] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset state when modal opens or editingUpgrade changes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (editingUpgrade) {
        setName(editingUpgrade.name);
        // Pre-fill with the CURRENT remaining duration of the upgrade
        const remainingNominalMs = computeRemainingUpgradeMs(
          now,
          editingUpgrade.finishesAt,
          boost.expiresAt,
          boost.multiplier
        );
        const roundedMinutes = Math.max(0, Math.ceil(remainingNominalMs / (60 * 1000)));
        const roundedMs = roundedMinutes * 60 * 1000;
        setInitialRemainingMs(roundedMs);
        const parts = msToParts(roundedMs);
        setDays(parts.days.toString());
        setHours(parts.hours.toString());
        setMinutes(parts.minutes.toString());
      } else {
        const defaultName = formatString(t.categoryDefaults[category], {
          index: existingUpgradeCount + 1,
        });
        setName(defaultName);
        setInitialRemainingMs(0);
        setDays('0');
        setHours('0');
        setMinutes('0');
      }
    }
  }, [isOpen, editingUpgrade, category, existingUpgradeCount, t]);

  if (!isOpen) return null;

  const currentDurationMs = durationToMs({
    days: parseInt(days, 10) || 0,
    hours: parseInt(hours, 10) || 0,
    minutes: parseInt(minutes, 10) || 0,
  });

  const isBoostActive = Boolean(boost.expiresAt && boost.expiresAt > now);

  // Dynamic live finish preview taking active boost into account
  const previewFinishAt = currentDurationMs > 0
    ? computeFinishAt(now, currentDurationMs, boost.expiresAt, boost.multiplier)
    : null;

  const sanitizeNumber = (val: string, max: number): string => {
    const digits = val.replace(/\D/g, '');
    if (!digits) return '0';
    const num = Math.min(max, parseInt(digits, 10));
    return num.toString();
  };

  // Preset button actions
  const addTime = (addDays: number, addHours: number, addMinutes: number) => {
    const currentMs = currentDurationMs;
    const additionalMs = durationToMs({ days: addDays, hours: addHours, minutes: addMinutes });
    const newTotalMs = currentMs + additionalMs;
    const parts = msToParts(newTotalMs);
    setDays(parts.days.toString());
    setHours(parts.hours.toString());
    setMinutes(parts.minutes.toString());
    setError(null);
  };

  const clearTime = () => {
    setDays('0');
    setHours('0');
    setMinutes('0');
    setError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentDurationMs <= 0) {
      setError(t.modal.durationRequired);
      return;
    }

    const finalName = name.trim() || formatString(t.categoryDefaults[category], { index: existingUpgradeCount + 1 });
    const durationChanged = !editingUpgrade || Math.abs(currentDurationMs - initialRemainingMs) >= 60000;
    onSave(finalName, currentDurationMs, durationChanged);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card / Bottom Sheet */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl z-10 max-h-[92vh] overflow-y-auto">
        {/* Mobile handle drag bar */}
        <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {editingUpgrade ? t.modal.editTitle : t.modal.addTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Name input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {t.modal.nameLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.modal.namePlaceholder}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Numerical Duration inputs (Days, Hours, Minutes) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {t.modal.durationLabel}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Days */}
              <div className="bg-slate-950 border border-slate-700/80 rounded-xl p-2 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">
                  {t.modal.days}
                </span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={days}
                  onChange={(e) => {
                    setDays(sanitizeNumber(e.target.value, 99));
                    setError(null);
                  }}
                  className="w-full bg-transparent font-mono font-bold text-xl text-slate-100 focus:outline-none"
                />
              </div>

              {/* Hours */}
              <div className="bg-slate-950 border border-slate-700/80 rounded-xl p-2 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">
                  {t.modal.hours}
                </span>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => {
                    setHours(sanitizeNumber(e.target.value, 23));
                    setError(null);
                  }}
                  className="w-full bg-transparent font-mono font-bold text-xl text-slate-100 focus:outline-none"
                />
              </div>

              {/* Minutes */}
              <div className="bg-slate-950 border border-slate-700/80 rounded-xl p-2 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">
                  {t.modal.minutes}
                </span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => {
                    setMinutes(sanitizeNumber(e.target.value, 59));
                    setError(null);
                  }}
                  className="w-full bg-transparent font-mono font-bold text-xl text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>{t.modal.presets}</span>
              <button
                type="button"
                onClick={clearTime}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                {t.modal.clear}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => addTime(1, 0, 0)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                +1d
              </button>
              <button
                type="button"
                onClick={() => addTime(0, 6, 0)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                +6h
              </button>
              <button
                type="button"
                onClick={() => addTime(0, 1, 0)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                +1h
              </button>
              <button
                type="button"
                onClick={() => addTime(0, 0, 30)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                +30m
              </button>
              <button
                type="button"
                onClick={() => addTime(7, 0, 0)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                +7d
              </button>
              <button
                type="button"
                onClick={() => addTime(14, 0, 0)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                +14d
              </button>
            </div>
          </div>

          {/* DYNAMIC LIVE FINISH PREVIEW */}
          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {t.modal.previewHeading}
              </span>
              {isBoostActive && (
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {formatString(t.modal.boostNotice, { multiplier: boost.multiplier })}
                </span>
              )}
            </div>

            {previewFinishAt ? (
              <div>
                <div className="text-base sm:text-lg font-bold text-amber-400 font-mono tracking-tight flex items-baseline gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm text-slate-300 font-sans font-semibold">
                    {t.modal.finishesOn}
                  </span>
                  <span>{formatRelativeFinish(previewFinishAt, now, language)}</span>
                </div>
                <div className="text-xs text-slate-400 font-sans mt-0.5">
                  ({formatExactDate(previewFinishAt, language)})
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">
                {t.modal.durationRequired}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
            >
              {t.modal.close}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="px-6"
            >
              {editingUpgrade ? t.modal.submitEdit : t.modal.submitAdd}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
