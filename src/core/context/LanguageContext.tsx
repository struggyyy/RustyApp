/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2025, @struggyyy                    *
 *                                                                         *
 *                             Project: Rusty                              *
 *                                                                         *
 *                         All Rights Reserved                             *
 *                                                                         *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *                                                                         *
 ************************************************************************** */
// React-specific imports
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Internal imports
import { useAuth } from "./AuthContext";
import i18n from "@/core/i18n/i18n";

type Language = "en" | "pl";

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => Promise<void>;
  isChanging: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

interface LanguageProviderProps {
  children: ReactNode;
}

// Language provider component for managing app language state
export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const { profile, updateUserProfile } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");
  const [isChanging, setIsChanging] = useState(false);

  // Initialize language from storage or user profile
  useEffect(() => {
    const initLanguage = async () => {
      try {
        // 1. Check profile first (highest priority if logged in)
        if (profile?.language) {
          const profileLang = profile.language as Language;
          if (profileLang === "en" || profileLang === "pl") {
            setCurrentLanguage(profileLang);
            await i18n.changeLanguage(profileLang);
            // Sync to storage
            await AsyncStorage.setItem("appLanguage", profileLang);
            return;
          }
        }

        // 2. Check AsyncStorage (if no profile or not logged in)
        const storedLang = await AsyncStorage.getItem("appLanguage");
        if (storedLang === "en" || storedLang === "pl") {
          setCurrentLanguage(storedLang as Language);
          await i18n.changeLanguage(storedLang);
        } else {
          // 3. Default to English
          setCurrentLanguage("en");
          await i18n.changeLanguage("en");
        }
      } catch (error) {
        console.error("Failed to initialize language:", error);
      }
    };

    initLanguage();
  }, [profile?.language]);

  // Change language and persist to storage and user profile
  const changeLanguage = async (language: Language) => {
    if (language === currentLanguage) return;

    setIsChanging(true);
    try {
      // Update i18next
      await i18n.changeLanguage(language);

      // Update local state
      setCurrentLanguage(language);

      // Update AsyncStorage
      await AsyncStorage.setItem("appLanguage", language);

      // Update Firebase profile (if logged in)
      if (profile) {
        try {
          await updateUserProfile({ language });
        } catch (profileError) {
          console.warn(
            "Failed to update profile language (user might be offline or unauthenticated):",
            profileError,
          );
          // Don't throw here, as changing language locally is successful
        }
      }
    } catch (error) {
      console.error("Failed to change language:", error);
      // Revert i18next if critical failure
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

// Custom hook to access language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
