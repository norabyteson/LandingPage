import Script from "next/script";
import { GA_MEASUREMENT_ID, isGaEnabled } from "@/lib/analytics/gtag";

/**
 * Carga gtag.js una sola vez y ejecuta la configuración inicial.
 * Usar en el layout raíz; `strategy="afterInteractive"` es el equivalente recomendado
 * a colocar el snippet después de &lt;head&gt; sin bloquear el primer render.
 */
export default function GoogleAnalytics() {
  if (!isGaEnabled()) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
