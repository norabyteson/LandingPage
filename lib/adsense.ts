/**
 * Identificador de editor de AdSense.
 *
 * Va como constante y no como variable de entorno a propósito: viaja en el HTML de todas
 * las páginas, así que no es un secreto, y una variable más en Vercel es una variable que
 * alguien olvida configurar y deja el sitio sin verificar sin que nadie lo note.
 *
 * Cubre norabyte.com y sus subdominios, carshing.norabyte.com incluido.
 */
export const ADSENSE_CLIENT = "ca-pub-3906973122529608";

/** Identificador de Google en el sistema TAG. Es el mismo para todos los editores. */
export const ADSENSE_TAG_ID = "f08c47fec0942fa0";
