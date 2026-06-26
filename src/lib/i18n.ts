/**
 * i18n — Çok dilli UI desteği
 * Diller: Türkçe (tr), English (en), Русский (ru), Deutsch (de), العربية (ar)
 */

export type Locale = 'tr' | 'en' | 'ru' | 'de' | 'ar';

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LOCALES: LocaleConfig[] = [
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
];

export function getLocaleConfig(code: Locale): LocaleConfig {
  return LOCALES.find((l) => l.code === code) || LOCALES[0];
}

// ---------- Translation dictionaries ----------

type TranslationKey =
  | 'app.name'
  | 'app.tagline'
  | 'nav.dashboard'
  | 'nav.projects'
  | 'nav.editor'
  | 'nav.agentTree'
  | 'nav.missionControl'
  | 'nav.agentTemplates'
  | 'nav.reactAgent'
  | 'nav.sandbox'
  | 'nav.skills'
  | 'nav.devPrompts'
  | 'nav.connectors'
  | 'nav.snippets'
  | 'nav.projectTemplates'
  | 'nav.policies'
  | 'nav.standards'
  | 'nav.history'
  | 'nav.analytics'
  | 'nav.docs'
  | 'nav.deploy'
  | 'nav.settings'
  | 'nav.dbExplorer'
  | 'nav.apiTester'
  | 'nav.securityScanner'
  | 'common.search'
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.create'
  | 'common.edit'
  | 'common.close'
  | 'common.send'
  | 'common.run'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'chat.placeholder'
  | 'chat.title'
  | 'chat.preview'
  | 'chat.diff'
  | 'editor.saveFile'
  | 'editor.newFile'
  | 'settings.apiKey'
  | 'settings.model'
  | 'settings.theme'
  | 'settings.language';

type Translations = Record<TranslationKey, string>;

const translations: Record<Locale, Translations> = {
  tr: {
    'app.name': 'DeepSeek App Studio',
    'app.tagline': 'AI Kod Üretici',
    'nav.dashboard': 'Dashboard',
    'nav.projects': 'Projeler',
    'nav.editor': 'Editör',
    'nav.agentTree': 'Agent Tree Studio',
    'nav.missionControl': 'Mission Control',
    'nav.agentTemplates': 'Agent Şablonları',
    'nav.reactAgent': 'ReAct Agent',
    'nav.sandbox': 'Sandbox',
    'nav.skills': 'Skiller',
    'nav.devPrompts': 'Dev Prompts',
    'nav.connectors': 'Connector & MCP',
    'nav.snippets': "Snippet'lar",
    'nav.projectTemplates': 'Proje Şablonları',
    'nav.policies': 'Politikalar',
    'nav.standards': 'Standartlar',
    'nav.history': 'Sürüm Geçmişi',
    'nav.analytics': 'Analitik',
    'nav.docs': 'API Dokümantasyon',
    'nav.deploy': 'Deploy & Export',
    'nav.settings': 'Ayarlar',
    'nav.dbExplorer': 'Veritabanı Gezgini',
    'nav.apiTester': 'API Tester',
    'nav.securityScanner': 'Security Scanner',
    'common.search': 'Ara',
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.delete': 'Sil',
    'common.create': 'Oluştur',
    'common.edit': 'Düzenle',
    'common.close': 'Kapat',
    'common.send': 'Gönder',
    'common.run': 'Çalıştır',
    'common.loading': 'Yükleniyor...',
    'common.error': 'Hata',
    'common.success': 'Başarılı',
    'chat.placeholder': "AI'a bir prompt yazın...",
    'chat.title': 'AI Sohbet',
    'chat.preview': 'Önizleme',
    'chat.diff': 'Diff',
    'editor.saveFile': 'Dosyayı Kaydet',
    'editor.newFile': 'Yeni Dosya',
    'settings.apiKey': 'DeepSeek API Key',
    'settings.model': 'Varsayılan Model',
    'settings.theme': 'Tema',
    'settings.language': 'Dil',
  },
  en: {
    'app.name': 'DeepSeek App Studio',
    'app.tagline': 'AI Code Generator',
    'nav.dashboard': 'Dashboard',
    'nav.projects': 'Projects',
    'nav.editor': 'Editor',
    'nav.agentTree': 'Agent Tree Studio',
    'nav.missionControl': 'Mission Control',
    'nav.agentTemplates': 'Agent Templates',
    'nav.reactAgent': 'ReAct Agent',
    'nav.sandbox': 'Sandbox',
    'nav.skills': 'Skills',
    'nav.devPrompts': 'Dev Prompts',
    'nav.connectors': 'Connectors & MCP',
    'nav.snippets': 'Snippets',
    'nav.projectTemplates': 'Project Templates',
    'nav.policies': 'Policies',
    'nav.standards': 'Standards',
    'nav.history': 'Version History',
    'nav.analytics': 'Analytics',
    'nav.docs': 'API Documentation',
    'nav.deploy': 'Deploy & Export',
    'nav.settings': 'Settings',
    'nav.dbExplorer': 'Database Explorer',
    'nav.apiTester': 'API Tester',
    'nav.securityScanner': 'Security Scanner',
    'common.search': 'Search',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.create': 'Create',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.send': 'Send',
    'common.run': 'Run',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'chat.placeholder': 'Type a prompt to AI...',
    'chat.title': 'AI Chat',
    'chat.preview': 'Preview',
    'chat.diff': 'Diff',
    'editor.saveFile': 'Save File',
    'editor.newFile': 'New File',
    'settings.apiKey': 'DeepSeek API Key',
    'settings.model': 'Default Model',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
  },
  ru: {
    'app.name': 'DeepSeek App Studio',
    'app.tagline': 'AI генератор кода',
    'nav.dashboard': 'Панель',
    'nav.projects': 'Проекты',
    'nav.editor': 'Редактор',
    'nav.agentTree': 'Agent Tree Studio',
    'nav.missionControl': 'Mission Control',
    'nav.agentTemplates': 'Шаблоны агентов',
    'nav.reactAgent': 'ReAct агент',
    'nav.sandbox': 'Песочница',
    'nav.skills': 'Навыки',
    'nav.devPrompts': 'Dev Prompts',
    'nav.connectors': 'Коннекторы и MCP',
    'nav.snippets': 'Сниппеты',
    'nav.projectTemplates': 'Шаблоны проектов',
    'nav.policies': 'Политики',
    'nav.standards': 'Стандарты',
    'nav.history': 'История версий',
    'nav.analytics': 'Аналитика',
    'nav.docs': 'API документация',
    'nav.deploy': 'Деплой и экспорт',
    'nav.settings': 'Настройки',
    'nav.dbExplorer': 'Браузер БД',
    'nav.apiTester': 'API тестер',
    'nav.securityScanner': 'Сканер безопасности',
    'common.search': 'Поиск',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.create': 'Создать',
    'common.edit': 'Изменить',
    'common.close': 'Закрыть',
    'common.send': 'Отправить',
    'common.run': 'Запуск',
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.success': 'Успешно',
    'chat.placeholder': 'Введите промпт для AI...',
    'chat.title': 'AI чат',
    'chat.preview': 'Предпросмотр',
    'chat.diff': 'Diff',
    'editor.saveFile': 'Сохранить файл',
    'editor.newFile': 'Новый файл',
    'settings.apiKey': 'DeepSeek API ключ',
    'settings.model': 'Модель по умолчанию',
    'settings.theme': 'Тема',
    'settings.language': 'Язык',
  },
  de: {
    'app.name': 'DeepSeek App Studio',
    'app.tagline': 'KI-Code-Generator',
    'nav.dashboard': 'Übersicht',
    'nav.projects': 'Projekte',
    'nav.editor': 'Editor',
    'nav.agentTree': 'Agent Tree Studio',
    'nav.missionControl': 'Mission Control',
    'nav.agentTemplates': 'Agent-Vorlagen',
    'nav.reactAgent': 'ReAct Agent',
    'nav.sandbox': 'Sandbox',
    'nav.skills': 'Fähigkeiten',
    'nav.devPrompts': 'Dev Prompts',
    'nav.connectors': 'Connectors & MCP',
    'nav.snippets': 'Snippets',
    'nav.projectTemplates': 'Projektvorlagen',
    'nav.policies': 'Richtlinien',
    'nav.standards': 'Standards',
    'nav.history': 'Versionsverlauf',
    'nav.analytics': 'Analytik',
    'nav.docs': 'API-Dokumentation',
    'nav.deploy': 'Deploy & Export',
    'nav.settings': 'Einstellungen',
    'nav.dbExplorer': 'Datenbank-Explorer',
    'nav.apiTester': 'API-Tester',
    'nav.securityScanner': 'Security Scanner',
    'common.search': 'Suchen',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.create': 'Erstellen',
    'common.edit': 'Bearbeiten',
    'common.close': 'Schließen',
    'common.send': 'Senden',
    'common.run': 'Ausführen',
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'chat.placeholder': 'Prompt an AI eingeben...',
    'chat.title': 'KI-Chat',
    'chat.preview': 'Vorschau',
    'chat.diff': 'Diff',
    'editor.saveFile': 'Datei speichern',
    'editor.newFile': 'Neue Datei',
    'settings.apiKey': 'DeepSeek API-Schlüssel',
    'settings.model': 'Standardmodell',
    'settings.theme': 'Design',
    'settings.language': 'Sprache',
  },
  ar: {
    'app.name': 'DeepSeek App Studio',
    'app.tagline': 'مولد أكواد AI',
    'nav.dashboard': 'لوحة التحكم',
    'nav.projects': 'المشاريع',
    'nav.editor': 'المحرر',
    'nav.agentTree': 'استوديو شجرة الوكلاء',
    'nav.missionControl': 'مركز التحكم',
    'nav.agentTemplates': 'قوالب الوكلاء',
    'nav.reactAgent': 'وكيل ReAct',
    'nav.sandbox': 'بيئة الاختبار',
    'nav.skills': 'المهارات',
    'nav.devPrompts': 'Dev Prompts',
    'nav.connectors': 'الموصلات و MCP',
    'nav.snippets': 'مقتطفات',
    'nav.projectTemplates': 'قوالب المشاريع',
    'nav.policies': 'السياسات',
    'nav.standards': 'المعايير',
    'nav.history': 'سجل الإصدارات',
    'nav.analytics': 'التحليلات',
    'nav.docs': 'توثيق API',
    'nav.deploy': 'النشر والتصدير',
    'nav.settings': 'الإعدادات',
    'nav.dbExplorer': 'مستكشف قاعدة البيانات',
    'nav.apiTester': 'مختبر API',
    'nav.securityScanner': 'فاحص الأمان',
    'common.search': 'بحث',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.create': 'إنشاء',
    'common.edit': 'تحرير',
    'common.close': 'إغلاق',
    'common.send': 'إرسال',
    'common.run': 'تشغيل',
    'common.loading': 'جار التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجاح',
    'chat.placeholder': 'اكتب طلباً للـ AI...',
    'chat.title': 'دردشة AI',
    'chat.preview': 'معاينة',
    'chat.diff': 'فرق',
    'editor.saveFile': 'حفظ الملف',
    'editor.newFile': 'ملف جديد',
    'settings.apiKey': 'مفتاح DeepSeek API',
    'settings.model': 'النموذج الافتراضي',
    'settings.theme': 'السمة',
    'settings.language': 'اللغة',
  },
};

export function translate(locale: Locale, key: TranslationKey): string {
  return translations[locale]?.[key] || translations.tr[key] || key;
}

export function getStoredLocale(): Locale {
  try {
    return (localStorage.getItem('locale') as Locale) || 'tr';
  } catch {
    return 'tr';
  }
}

export function storeLocale(locale: Locale): void {
  try {
    localStorage.setItem('locale', locale);
  } catch {}
}
