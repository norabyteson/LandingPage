"use client";

import { useEffect } from "react";
import type { Locale } from "@/types/i18n";

export default function LangUpdater({ lang }: { lang: Locale }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
