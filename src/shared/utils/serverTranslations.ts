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
// Internal imports
import en from "../../core/i18n/locales/en.json";
import pl from "../../core/i18n/locales/pl.json";
import { ReportStatus } from "../types/reports";

const translations = {
  en,
  pl,
};

type Language = "en" | "pl";

// Simple translation function for server-side use (notifications, etc.)
export function translate(
  key: string,
  language: Language = "en",
  interpolations?: Record<string, string>
): string {
  const fallbackLang: Language = "en";
  const lang = translations[language] ? language : fallbackLang;

  const keys = key.split(".");
  let value: any = translations[lang];

  for (const k of keys) {
    value = value?.[k];
  }

  if (typeof value !== "string") {
    // Fallback to English if key not found
    value = translations[fallbackLang];
    for (const k of keys) {
      value = value?.[k];
    }
    if (typeof value !== "string") {
      return key; // Return key if no translation found
    }
  }

  // Handle interpolations
  if (interpolations) {
    return value.replace(/\{\{(\w+)\}\}/g, (match: string, varName: string) => {
      return interpolations[varName] || match;
    });
  }

  return value;
}

// Translates a report status to the user's language
export function translateStatus(
  status: ReportStatus | string,
  language: Language = "en"
): string {
  const statusKey = (() => {
    switch (status) {
      case "Submitted":
        return "reports.statusSubmitted";
      case "Accepted":
        return "reports.statusAccepted";
      case "Completed":
        return "reports.statusCompleted";
      case "Canceled":
        return "reports.statusCanceled";
      default:
        return "reports.statusSubmitted";
    }
  })();

  return translate(statusKey, language);
}
