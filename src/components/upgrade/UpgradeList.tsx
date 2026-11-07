import React from 'react';
import { Plus, Hammer, FlaskConical, PawPrint } from 'lucide-react';
import { Upgrade, BoostState, CategoryType } from '../../types/index.ts';
import { useTranslation } from '../../lib/i18n.ts';
import { UpgradeCard } from './UpgradeCard.tsx';
import { Button } from '../ui/Button.tsx';

interface UpgradeListProps {
  category: CategoryType;
  upgrades: Upgrade[];
  boost: BoostState;
  now: number;
  onOpenAddModal: () => void;
  onEditUpgrade: (upgrade: Upgrade) => void;
  onUpdateName: (id: string, newName: string) => void;
  onFinishNow: (id: string) => void;
  onDeleteUpgrade: (id: string) => void;
}

export const UpgradeList: React.FC<UpgradeListProps> = ({
  category,
  upgrades,
  boost,
  now,
  onOpenAddModal,
  onEditUpgrade,
  onUpdateName,
  onFinishNow,
  onDeleteUpgrade,
}) => {
  const { t, formatString } = useTranslation();

  const getEmptyStateIcon = () => {
    switch (category) {
      case 'builders':
        return <Hammer className="w-10 h-10 text-amber-500/50" />;
      case 'laboratory':
        return <FlaskConical className="w-10 h-10 text-purple-500/50" />;
      case 'petHouse':
        return <PawPrint className="w-10 h-10 text-emerald-500/50" />;
    }
  };

  const emptyDescriptions: Record<CategoryType, string> = {
    builders: t.emptyState.builders,
    laboratory: t.emptyState.laboratory,
    petHouse: t.emptyState.petHouse,
  };

  return (
    <div className="space-y-4">
      {/* List Header & Quick Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {formatString(t.stats.activeCount, { count: upgrades.length })}
          </span>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAddModal}
          icon={<Plus className="w-4 h-4 text-slate-950 font-bold" />}
        >
          {t.emptyState.addButton}
        </Button>
      </div>

      {/* Upgrades List or Empty State */}
      {upgrades.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
            {getEmptyStateIcon()}
          </div>
          <h4 className="font-bold text-slate-200 text-base mb-1">
            {emptyDescriptions[category]}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            {t.emptyState.instruction}
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={onOpenAddModal}
            icon={<Plus className="w-4 h-4 text-slate-950" />}
          >
            {t.emptyState.addButton}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {upgrades.map((upgrade) => (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              boost={boost}
              now={now}
              onUpdateName={onUpdateName}
              onEdit={onEditUpgrade}
              onFinishNow={onFinishNow}
              onDelete={onDeleteUpgrade}
            />
          ))}
        </div>
      )}
    </div>
  );
};
