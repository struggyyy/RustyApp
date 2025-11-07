import i18n from 'i18next';

// Import language resources
import en from '../locales/en.json';
import pl from '../locales/pl.json';

const resources = {
  en: {
    translation: en,
  },
  pl: {
    translation: pl,
  },
};

// Initialize i18next
i18n.init({
  resources,
  lng: 'en', // default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
