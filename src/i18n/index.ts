/**
 * Internationalization (i18n) Support
 * Provides translation and localization utilities
 */

// Import React for the hook
import React from 'react';

type TranslationKey = 
  | 'app.name'
  | 'app.description'
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.close'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'impulse.title'
  | 'impulse.category'
  | 'impulse.price'
  | 'impulse.urgency'
  | 'impulse.create'
  | 'impulse.cancel'
  | 'impulse.execute'
  | 'stats.total_saved'
  | 'stats.regret_rate'
  | 'stats.current_streak'
  | 'settings.title'
  | 'settings.theme'
  | 'settings.currency'
  | 'settings.cloud_sync';

type SupportedLocale = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'ja';

interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<SupportedLocale, Translations> = {
  en: {
    'app.name': 'ImpulseVault',
    'app.description': 'Lock your impulses. Free your future.',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'impulse.title': 'Title',
    'impulse.category': 'Category',
    'impulse.price': 'Price',
    'impulse.urgency': 'Urgency',
    'impulse.create': 'Create Impulse',
    'impulse.cancel': 'Cancel Impulse',
    'impulse.execute': 'Execute',
    'stats.total_saved': 'Total Saved',
    'stats.regret_rate': 'Regret Rate',
    'stats.current_streak': 'Current Streak',
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.currency': 'Currency',
    'settings.cloud_sync': 'Cloud Sync',
  },
  es: {
    'app.name': 'ImpulseVault',
    'app.description': 'Bloquea tus impulsos. Libera tu futuro.',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.close': 'Cerrar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'impulse.title': 'Título',
    'impulse.category': 'Categoría',
    'impulse.price': 'Precio',
    'impulse.urgency': 'Urgencia',
    'impulse.create': 'Crear Impulso',
    'impulse.cancel': 'Cancelar Impulso',
    'impulse.execute': 'Ejecutar',
    'stats.total_saved': 'Total Ahorrado',
    'stats.regret_rate': 'Tasa de Arrepentimiento',
    'stats.current_streak': 'Racha Actual',
    'settings.title': 'Configuración',
    'settings.theme': 'Tema',
    'settings.currency': 'Moneda',
    'settings.cloud_sync': 'Sincronización en la Nube',
  },
  fr: {
    'app.name': 'ImpulseVault',
    'app.description': 'Bloquez vos impulsions. Libérez votre avenir.',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.close': 'Fermer',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'impulse.title': 'Titre',
    'impulse.category': 'Catégorie',
    'impulse.price': 'Prix',
    'impulse.urgency': 'Urgence',
    'impulse.create': 'Créer une Impulsion',
    'impulse.cancel': 'Annuler l\'Impulsion',
    'impulse.execute': 'Exécuter',
    'stats.total_saved': 'Total Économisé',
    'stats.regret_rate': 'Taux de Regret',
    'stats.current_streak': 'Série Actuelle',
    'settings.title': 'Paramètres',
    'settings.theme': 'Thème',
    'settings.currency': 'Devise',
    'settings.cloud_sync': 'Synchronisation Cloud',
  },
  de: {
    'app.name': 'ImpulseVault',
    'app.description': 'Sperre deine Impulse. Befreie deine Zukunft.',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.close': 'Schließen',
    'common.loading': 'Lädt...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'impulse.title': 'Titel',
    'impulse.category': 'Kategorie',
    'impulse.price': 'Preis',
    'impulse.urgency': 'Dringlichkeit',
    'impulse.create': 'Impuls Erstellen',
    'impulse.cancel': 'Impuls Abbrechen',
    'impulse.execute': 'Ausführen',
    'stats.total_saved': 'Gespart Gesamt',
    'stats.regret_rate': 'Bereuungsrate',
    'stats.current_streak': 'Aktuelle Serie',
    'settings.title': 'Einstellungen',
    'settings.theme': 'Design',
    'settings.currency': 'Währung',
    'settings.cloud_sync': 'Cloud-Synchronisation',
  },
  hi: {
    'app.name': 'ImpulseVault',
    'app.description': 'अपने आवेगों को लॉक करें। अपने भविष्य को मुक्त करें।',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.close': 'बंद करें',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'impulse.title': 'शीर्षक',
    'impulse.category': 'श्रेणी',
    'impulse.price': 'मूल्य',
    'impulse.urgency': 'जरूरत',
    'impulse.create': 'आवेग बनाएं',
    'impulse.cancel': 'आवेग रद्द करें',
    'impulse.execute': 'निष्पादित करें',
    'stats.total_saved': 'कुल बचत',
    'stats.regret_rate': 'पछतावा दर',
    'stats.current_streak': 'वर्तमान स्ट्रीक',
    'settings.title': 'सेटिंग्स',
    'settings.theme': 'थीम',
    'settings.currency': 'मुद्रा',
    'settings.cloud_sync': 'क्लाउड सिंक',
  },
  ja: {
    'app.name': 'ImpulseVault',
    'app.description': '衝動をロック。未来を解放。',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.close': '閉じる',
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.success': '成功',
    'impulse.title': 'タイトル',
    'impulse.category': 'カテゴリ',
    'impulse.price': '価格',
    'impulse.urgency': '緊急度',
    'impulse.create': '衝動を作成',
    'impulse.cancel': '衝動をキャンセル',
    'impulse.execute': '実行',
    'stats.total_saved': '合計節約額',
    'stats.regret_rate': '後悔率',
    'stats.current_streak': '現在の連続記録',
    'settings.title': '設定',
    'settings.theme': 'テーマ',
    'settings.currency': '通貨',
    'settings.cloud_sync': 'クラウド同期',
  },
};

class I18nService {
  private locale: SupportedLocale = 'en';

  /**
   * Set locale
   */
  setLocale(locale: SupportedLocale): void {
    this.locale = locale;
  }

  /**
   * Get current locale
   */
  getLocale(): SupportedLocale {
    return this.locale;
  }

  /**
   * Translate a key
   */
  t(key: TranslationKey, params?: Record<string, string | number>): string {
    const translation = translations[this.locale][key] || translations.en[key] || key;
    
    if (params) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) => str.replace(`{{${paramKey}}}`, String(paramValue)),
        String(translation)
      );
    }
    
    return String(translation);
  }

  /**
   * Get all translations for a locale
   */
  getTranslations(locale?: SupportedLocale): Translations {
    return translations[locale || this.locale];
  }
}

export const i18n = new I18nService();

/**
 * Translation hook for React components
 */
export function useTranslation() {
  const t = React.useCallback((key: TranslationKey, params?: Record<string, string | number>) => {
    return i18n.t(key, params);
  }, []);

  return { t, locale: i18n.getLocale(), setLocale: i18n.setLocale.bind(i18n) };
}

