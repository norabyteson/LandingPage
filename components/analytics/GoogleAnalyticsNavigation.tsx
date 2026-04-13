"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_MEASUREMENT_ID, isGaEnabled } from "@/lib/analytics/gtag";

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, string | boolean | number>
    ) => void;
  }
}

/**
 * Envía page_view en navegaciones cliente (App Router).
 * La carga inicial la cubre gtag('config') del script global; aquí evitamos duplicar el primer hit.
 */
export default function GoogleAnalyticsNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstNavigation = useRef(true);

  useEffect(() => {
    if (!isGaEnabled() || typeof window.gtag !== "function") return;

    if (isFirstNavigation.current) {
      isFirstNavigation.current = false;
      return;
    }

    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: pagePath,
    });
  }, [pathname, searchParams]);

  return null;
}
