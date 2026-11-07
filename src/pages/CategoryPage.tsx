import React, { useState } from 'react';
import { CategoryType, BoostState, Upgrade } from '../types/index.ts';
import { BoostBanner } from '../components/layout/BoostBanner.tsx';
import { UpgradeList } from '../components/upgrade/UpgradeList.tsx';
import { AddUpgradeModal } from '../components/upgrade/AddUpgradeModal.tsx';

interface CategoryPageProps {
  category: CategoryType;
  upgrades: Upgrade[];
  boost: BoostState;
  now: number;
  onActivatePotion: () => void;
  onCancelPotion: () => void;
  onAddUpgrade: (category: CategoryType, name: string, durationMs: number) => void;
  onUpdateDuration: (id: string, durationMs: number) => void;
  onUpdateName: (id: string, newName: string) => void;
  onFinishNow: (id: string) => void;
  onDeleteUpgrade: (id: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  upgrades,
  boost,
  now,
  onActivatePotion,
  onCancelPotion,
  onAddUpgrade,
  onUpdateDuration,
  onUpdateName,
  onFinishNow,
  onDeleteUpgrade,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUpgrade, setEditingUpgrade] = useState<Upgrade | null>(null);

  const handleOpenAdd = () => {
    setEditingUpgrade(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (upgrade: Upgrade) => {
    setEditingUpgrade(upgrade);
    setIsModalOpen(true);
  };

  const handleSaveModal = (name: string, durationMs: number, durationChanged: boolean = true) => {
    if (editingUpgrade) {
      onUpdateName(editingUpgrade.id, name);
      if (durationChanged) {
        onUpdateDuration(editingUpgrade.id, durationMs);
      }
    } else {
      onAddUpgrade(category, name, durationMs);
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Category Boost Banner */}
      <BoostBanner
        category={category}
        boost={boost}
        upgrades={upgrades}
        now={now}
        onActivatePotion={onActivatePotion}
        onCancelPotion={onCancelPotion}
      />

      {/* Upgrades List */}
      <UpgradeList
        category={category}
        upgrades={upgrades}
        boost={boost}
        now={now}
        onOpenAddModal={handleOpenAdd}
        onEditUpgrade={handleOpenEdit}
        onUpdateName={onUpdateName}
        onFinishNow={onFinishNow}
        onDeleteUpgrade={onDeleteUpgrade}
      />

      {/* Add / Edit Upgrade Modal */}
      <AddUpgradeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUpgrade(null);
        }}
        category={category}
        boost={boost}
        existingUpgradeCount={upgrades.length}
        now={now}
        editingUpgrade={editingUpgrade}
        onSave={handleSaveModal}
      />
    </div>
  );
};
