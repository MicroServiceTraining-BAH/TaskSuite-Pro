"use client";

import { useEffect } from "react";
import { Button } from "@tasksuite/ui";
import { useLanguage } from "@/components/language-provider";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  function toggleLanguage() {
    const newLang = language === "en" ? "es" : "en";
    setLanguage(newLang);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="min-w-[60px]"
    >
      {language === "en" ? "ES" : "EN"}
    </Button>
  );
}

