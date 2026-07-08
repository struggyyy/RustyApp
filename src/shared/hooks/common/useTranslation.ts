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
import { useCallback, useState, useEffect } from "react";

// Internal imports
import i18n from "@/core/i18n/i18n";

export const useTranslation = () => {
  // Track language changes to trigger re-renders
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
    };

    i18n.on("languageChanged", handleLanguageChange);

    // Cleanup listener
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);

  // Translation function with type safety
  const t = useCallback(
    (key: string, options?: any): string => {
      const result = i18n.t(key, options);
      return typeof result === "string" ? result : String(result);
    },
    [currentLanguage],
  );

  return {
    t,
    i18n,
  };
};
