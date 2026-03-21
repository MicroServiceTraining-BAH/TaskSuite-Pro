"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getLanguage, setLanguage as setLang, t as translate, subscribeToLanguageChanges, getCurrentLanguage, type Language } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start with "en" during SSR to prevent hydration mismatch
  // Will update to saved language after client-side hydration
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = getLanguage();
    setLanguageState(savedLang);
    // Update HTML lang attribute
    if (typeof document !== "undefined") {
      document.documentElement.lang = savedLang;
    }

    // Subscribe to language changes
    const unsubscribe = subscribeToLanguageChanges((newLang) => {
      setLanguageState(newLang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLang;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setLang(lang);
    // Update HTML lang attribute
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string) => {
    // Use current language state to force re-render
    return translate(key, language);
  };

  // Always provide the context, even during SSR
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

