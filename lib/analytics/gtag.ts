/**
 * Google Analytics 4 (gtag.js) — helpers.
 * El ID se expone solo vía NEXT_PUBLIC_GA_MEASUREMENT_ID (nunca secretos en el cliente).
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

export function isGaEnabled(): boolean {
  return GA_MEASUREMENT_ID.length > 0 && GA_MEASUREMENT_ID.startsWith("G-");
}
