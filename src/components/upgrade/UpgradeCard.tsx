import React, { useState } from 'react';
import { Edit2, Trash2, CheckCircle, Calendar, Check, X } from 'lucide-react';
import { Upgrade, BoostState, CategoryType } from '../../types/index.ts';
import {
  computeProgressPercentage,
  formatExactDate,
  formatRelativeFinish,
} from '../../lib/timeEngine.ts';
import { useTranslation } from '../../lib/i18n.ts';
import { ProgressBar } from '../ui/ProgressBar.tsx';
import { CountdownDisplay } from '../ui/CountdownDisplay.tsx';

interface UpgradeCardProps {
  upgrade: Upgrade;
  boost: BoostState;
  now: number;
  onUpdateName: (id: string, newName: string) => void;
  onEdit: (upgrade: Upgrade) => void;
  onFinishNow: (id: string) => void;
  onDelete: (id: string) => void;
}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({
  upgrade,
  boost,
  now,
  onUpdateName,
  onEdit,
  onFinishNow,
  onDelete,
}) => {
  const { language, t } = useTranslation();
  const [isEditingNameInline, setIsEditingNameInline] = useState(false);
  const [inlineName, setInlineName] = useState(upgrade.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isFinished = now >= upgrade.finishesAt;
  const remainingRealMs = Math.max(0, upgrade.finishesAt - now);

  const progress = computeProgressPercentage(
    now,
    upgrade.finishesAt,
    upgrade.totalDurationMs,
    boost.expiresAt,
    boost.multiplier
  );

  const handleSaveInlineName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inlineName.trim()) {
      onUpdateName(upgrade.id, inlineName.trim());
    } else {
      setInlineName(upgrade.name);
    }
    setIsEditingNameInline(false);
  };

  const categoryBadges: Record<CategoryType, { label: string; style: string }> = {
    builders: {
      label: t.tabs.builders,
      style: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    laboratory: {
      label: t.tabs.laboratory,
      style: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    },
    petHouse: {
      label: t.tabs.petHouse,
      style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
  };

  const badge = categoryBadges[upgrade.category];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-md ${
        isFinished
          ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/50 shadow-emerald-950/30'
          : 'bg-slate-900/90 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Card Bar: Name & Actions */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Editable Name & Badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.style}`}
              >
                {badge.label}
              </span>
              {isFinished && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  {t.cards.finished}
                </span>
              )}
            </div>

            {isEditingNameInline ? (
              <form onSubmit={handleSaveInlineName} className="flex items-center gap-1.5 mt-1">
                <input
                  type="text"
                  value={inlineName}
                  onChange={(e) => setInlineName(e.target.value)}
                  autoFocus
                  className="px-2 py-1 bg-slate-950 border border-amber-500 rounded-lg text-slate-100 text-sm font-bold focus:outline-none w-full max-w-xs"
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInlineName(upgrade.name);
                    setIsEditingNameInline(false);
                  }}
                  className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div
                className="group flex items-center gap-2 cursor-pointer"
                onClick={() => setIsEditingNameInline(true)}
              >
                <h3 className="font-bold text-base sm:text-lg text-slate-100 truncate group-hover:text-amber-400 transition-colors">
                  {upgrade.name}
                </h3>
                <Edit2 className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            )}
          </div>

          {/* Card Top Actions: Edit, Finish Now, Delete */}
          <div className="flex items-center gap-1 shrink-0">
            {!isFinished && (
              <button
                onClick={() => onFinishNow(upgrade.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                title={t.cards.finishNowAction}
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onEdit(upgrade)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
              title={t.cards.editDuration}
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {showDeleteConfirm ? (
              <div className="flex items-center gap-1 bg-slate-950 border border-rose-500/50 rounded-lg p-0.5 animate-in zoom-in-95">
                <button
                  onClick={() => onDelete(upgrade.id)}
                  className="px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
                >
                  {t.cards.deleteItem}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title={t.cards.deleteItem}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Live Countdown Display */}
        <div className="mt-3 flex items-baseline justify-between flex-wrap gap-2">
          <CountdownDisplay
            remainingMs={remainingRealMs}
            isFinished={isFinished}
            language={language}
            size="md"
          />

          {/* Exact completion date & relative info */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-slate-300">
              {formatRelativeFinish(upgrade.finishesAt, now, language)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Footer */}
      <div className="px-4 sm:px-5 pb-3 pt-1">
        <ProgressBar
          progress={progress}
          isFinished={isFinished}
          category={upgrade.category}
          showLabel={true}
        />

        <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-sans">
          <span>{isFinished ? t.cards.finishedAt : t.cards.finishesAt}</span>
          <span className="font-mono text-slate-400">
            {formatExactDate(upgrade.finishesAt, language)}
          </span>
        </div>
      </div>
    </div>
  );
};
