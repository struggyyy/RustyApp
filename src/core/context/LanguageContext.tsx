import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import i18n from '../i18n/i18n';

type Language = 'en' | 'pl';

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => Promise<void>;
  isChanging: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { profile, updateUserProfile } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isChanging, setIsChanging] = useState(false);

  // Initialize language from profile or default to 'en'
  useEffect(() => {
    if (profile?.language) {
      const profileLang = profile.language as Language;
      if (profileLang === 'en' || profileLang === 'pl') {
        setCurrentLanguage(profileLang);
        i18n.changeLanguage(profileLang);
      }
    } else {
      // Default to English if no language in profile
      setCurrentLanguage('en');
      i18n.changeLanguage('en');
    }
  }, [profile?.language]);

  const changeLanguage = async (language: Language) => {
    if (language === currentLanguage) return;

    setIsChanging(true);
    try {
      // Update i18next
      await i18n.changeLanguage(language);

      // Update local state
      setCurrentLanguage(language);

      // Update Firebase profile
      await updateUserProfile({ language });
    } catch (error) {
      console.error('Failed to change language:', error);
      // Revert i18next if Firebase update failed
      await i18n.changeLanguage(currentLanguage);
      throw error;
    } finally {
      setIsChanging(false);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    isChanging,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
