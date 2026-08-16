import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: [
    'en', 'es', 'pt', 'de', 'fr', 'it',
    'hi', 'ar', 'he', 'ja', 'ko', 'zh',
    'ru', 'nl', 'pl', 'tr', 'vi', 'th',
    'id', 'ms', 'sv', 'no', 'da', 'fi',
    'cs', 'el', 'ro', 'hu', 'uk', 'bn', 'ta'
  ],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

export const localeNames: Record<string, string> = {
  en: 'English', es: 'Español', pt: 'Português', de: 'Deutsch',
  fr: 'Français', it: 'Italiano', hi: 'हिन्दी', ar: 'العربية',
  he: 'עברית', ja: '日本語', ko: '한국어', zh: '中文',
  ru: 'Русский', nl: 'Nederlands', pl: 'Polski', tr: 'Türkçe',
  vi: 'Tiếng Việt', th: 'ไทย', id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu', sv: 'Svenska', no: 'Norsk', da: 'Dansk',
  fi: 'Suomi', cs: 'Čeština', el: 'Ελληνικά', ro: 'Română',
  hu: 'Magyar', uk: 'Українська', bn: 'বাংলা', ta: 'தமிழ்'
};

export const rtlLocales = ['ar', 'he'];
