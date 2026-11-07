import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types/index.ts';
import { storage } from './storage.ts';

export const translations = {
  fr: {
    app: {
      title: 'ClashTimer',
      subtitle: 'Calculateur & Suivi d\'améliorations Clash of Clans',
      installPwa: 'Installer l\'app',
      installPrompt: 'Installer ClashTimer sur votre appareil pour un accès hors-ligne instantané',
      offlineReady: 'Prêt pour une utilisation hors-ligne',
    },
    tabs: {
      overview: 'Vue d\'ensemble',
      builders: 'Ouvriers',
      laboratory: 'Laboratoire',
      petHouse: 'Animalerie',
    },
    overview: {
      title: 'Vue d\'ensemble',
      categories: 'Aperçu par catégorie',
      statsTotalUpgrades: 'Améliorations',
      statsActiveBoosts: 'Boosts actifs',
      statsNextFinish: 'Prochaine fin',
      activeCount: '{count} en cours',
      finishedCount: '{count} terminée(s)',
      noActiveUpgrades: 'Aucune amélioration en cours',
      noFinishedUpgrades: 'Aucune terminée',
      noBoostActive: 'Aucune potion active',
      allUpgradesTitle: 'Toutes les améliorations',
      noUpgradesRecorded: 'Aucune amélioration enregistrée.',
      addButton: '+ Ajouter',
      activatePotion: 'Activer potion',
      categoryCardTitle: 'Voir la catégorie',
    },
    potionPreview: {
      title: 'Aperçu de la potion',
      subtitle: 'Impact simulé sur les améliorations de la catégorie',
      currentFinish: 'Fin actuelle',
      projectedFinish: 'Nouvelle fin',
      timeSaved: 'Gain : {time}',
      noActiveUpgradesNotice: 'Aucune amélioration en cours — la potion sera active mais ne réduira pas de timer actif.',
      confirmActivation: 'Confirmer l\'activation',
      cancel: 'Annuler',
    },
    boost: {
      builderPotion: 'Potion d\'ouvrier',
      researchPotion: 'Potion de recherche',
      petPotion: 'Potion pour animaux',
      activeStatus: 'active',
      speedMultiplier: '{multiplier}x Vitesse',
      remaining: 'restant',
      addPotion: '+1h (Cumuler)',
      cancelBoost: 'Annuler le boost',
      cancelConfirm: 'Voulez-vous vraiment annuler le boost en cours ?',
      confirmCancel: 'Annuler le boost',
      keepBoost: 'Garder',
      boostTimeSaved: 'Gain : {saved}h par ouvrier',
      activateNow: 'Activer une potion (1h)',
    },
    cards: {
      finished: 'Terminé !',
      finishesAt: 'Fin prévue :',
      finishedAt: 'Terminé le :',
      remainingTime: 'Temps restant',
      elapsed: 'Progression :',
      progressLabel: 'Progression',
      finishedProgress: '100% Terminé',
      editName: 'Modifier le nom',
      editDuration: 'Modifier la durée',
      finishNow: 'Terminer',
      finishNowAction: 'Terminer maintenant',
      finishNowConfirm: 'Marquer cette amélioration comme terminée ?',
      deleteItem: 'Supprimer',
      deleteConfirm: 'Supprimer définitivement cette amélioration ?',
      add: 'Ajouter',
      save: 'Enregistrer',
      cancel: 'Annuler',
    },
    modal: {
      addTitle: 'Ajouter une amélioration',
      editTitle: 'Modifier l\'amélioration',
      nameLabel: 'Nom',
      namePlaceholder: 'ex: Canon Niv. 21, Sorcier, L.A.S.S.I...',
      durationLabel: 'Durée restante',
      days: 'Jours',
      hours: 'Heures',
      minutes: 'Minutes',
      presets: 'Raccourcis :',
      clear: 'Effacer',
      previewHeading: 'Aperçu de la fin :',
      finishesOn: 'Terminer le :',
      boostNotice: '⚡ Calculé avec le boost actif ({multiplier}x)',
      submitAdd: 'Ajouter',
      submitEdit: 'Enregistrer',
      close: 'Fermer',
      durationRequired: 'Veuillez renseigner une durée supérieure à 0.',
    },
    emptyState: {
      builders: 'Aucun ouvrier occupé.',
      laboratory: 'Le laboratoire est inactif.',
      petHouse: 'L\'animalerie est au repos.',
      instruction: 'Cliquez sur « Ajouter » pour lancer un suivi de temps.',
      addButton: 'Ajouter une amélioration',
    },
    stats: {
      activeCount: '{count} en cours',
      nextFinished: 'Prochaine fin :',
      noneFinished: 'Aucune en cours',
    },
    categoryDefaults: {
      builders: 'Ouvrier #{index}',
      laboratory: 'Recherche Labo #{index}',
      petHouse: 'Amélioration Familier #{index}',
    }
  },
  en: {
    app: {
      title: 'ClashTimer',
      subtitle: 'Clash of Clans Upgrade Tracker & Calculator',
      installPwa: 'Install App',
      installPrompt: 'Install ClashTimer on your device for instant offline access',
      offlineReady: 'Ready for full offline usage',
    },
    tabs: {
      overview: 'Overview',
      builders: 'Builders',
      laboratory: 'Laboratory',
      petHouse: 'Pet House',
    },
    overview: {
      title: 'Overview',
      categories: 'Category Summary',
      statsTotalUpgrades: 'Upgrades',
      statsActiveBoosts: 'Active Boosts',
      statsNextFinish: 'Next Finish',
      activeCount: '{count} ongoing',
      finishedCount: '{count} finished',
      noActiveUpgrades: 'No ongoing upgrades',
      noFinishedUpgrades: 'None finished',
      noBoostActive: 'No active potion',
      allUpgradesTitle: 'All Upgrades',
      noUpgradesRecorded: 'No upgrades recorded yet.',
      addButton: '+ Add',
      activatePotion: 'Activate Potion',
      categoryCardTitle: 'View category',
    },
    potionPreview: {
      title: 'Potion Preview',
      subtitle: 'Simulated impact on category upgrades',
      currentFinish: 'Current finish',
      projectedFinish: 'New finish',
      timeSaved: 'Saved: {time}',
      noActiveUpgradesNotice: 'No ongoing upgrades — the potion will be active but won\'t reduce any current timer.',
      confirmActivation: 'Confirm Activation',
      cancel: 'Cancel',
    },
    boost: {
      builderPotion: 'Builder Potion',
      researchPotion: 'Research Potion',
      petPotion: 'Pet Potion',
      activeStatus: 'active',
      speedMultiplier: '{multiplier}x Speed',
      remaining: 'remaining',
      addPotion: '+1h (Stack)',
      cancelBoost: 'Cancel Boost',
      cancelConfirm: 'Are you sure you want to cancel the active boost?',
      confirmCancel: 'Cancel Boost',
      keepBoost: 'Keep',
      boostTimeSaved: 'Time saved: {saved}h per item',
      activateNow: 'Activate Potion (1h)',
    },
    cards: {
      finished: 'Finished!',
      finishesAt: 'Finishes at:',
      finishedAt: 'Finished at:',
      remainingTime: 'Remaining Time',
      elapsed: 'Progress:',
      progressLabel: 'Progress',
      finishedProgress: '100% Finished',
      editName: 'Edit Name',
      editDuration: 'Edit Duration',
      finishNow: 'Complete',
      finishNowAction: 'Complete Now',
      finishNowConfirm: 'Mark this upgrade as completed immediately?',
      deleteItem: 'Delete',
      deleteConfirm: 'Delete this upgrade permanently?',
      add: 'Add',
      save: 'Save',
      cancel: 'Cancel',
    },
    modal: {
      addTitle: 'Add an Upgrade',
      editTitle: 'Edit Upgrade',
      nameLabel: 'Name',
      namePlaceholder: 'e.g. Cannon Lv 21, Wizard, L.A.S.S.I...',
      durationLabel: 'Remaining duration',
      days: 'Days',
      hours: 'Hours',
      minutes: 'Minutes',
      presets: 'Quick Presets:',
      clear: 'Clear',
      previewHeading: 'Completion Preview:',
      finishesOn: 'Finishes:',
      boostNotice: '⚡ Calculated with active boost ({multiplier}x)',
      submitAdd: 'Add',
      submitEdit: 'Save',
      close: 'Close',
      durationRequired: 'Please enter a duration greater than 0 minutes.',
    },
    emptyState: {
      builders: 'No builders currently assigned.',
      laboratory: 'The laboratory is currently idle.',
      petHouse: 'The pet house is currently idle.',
      instruction: 'Click "Add" to start tracking an upgrade.',
      addButton: 'Add an Upgrade',
    },
    stats: {
      activeCount: '{count} ongoing',
      nextFinished: 'Next finish:',
      noneFinished: 'None active',
    },
    categoryDefaults: {
      builders: 'Builder #{index}',
      laboratory: 'Lab Research #{index}',
      petHouse: 'Pet Upgrade #{index}',
    }
  }
} as const;

export type TranslationKey = typeof translations.fr;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKey;
  formatString: (template: string, vars: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => storage.getLanguage());

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    storage.saveLanguage(lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = translations[language] as TranslationKey;

  const formatString = (template: string, vars: Record<string, string | number>): string => {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
    return result;
  };

  return React.createElement(
    I18nContext.Provider,
    { value: { language, setLanguage, t, formatString } },
    children
  );
};

export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
