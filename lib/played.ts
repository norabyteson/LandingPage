/**
 * Animaciones de entrada que ya se vieron en esta pestaña (`sessionStorage`). Al recargar, volver
 * a la portada o cambiar de idioma, lo ya visto aparece en su sitio sin repetir la animación.
 *
 * Cada elemento animado lleva `data-reveal="<clave>"`. Lo ya visto se fija con CSS (una hoja en
 * `document.adoptedStyleSheets`), no con estado de React: así el HTML del servidor y el del
 * cliente son idénticos y no hay error de hidratación. El script previo al pintado de
 * `app/layout.tsx` crea esa hoja al cargar; `markPlayed` la actualiza durante la sesión.
 */

export const PLAYED_STORAGE_KEY = "nb-played";

/**
 * CSS que deja en su estado final los elementos ya vistos. Función pura y autocontenida: el
 * layout la incrusta tal cual en su script bloqueante (`playedCss.toString()`).
 * - El contenedor `data-reveal`: visible y sin transición.
 * - Entradas CSS (`.landing-rise` / `.landing-pop`) en él o dentro: sin animación.
 * - Detalles encadenados (`.reveal-detail`, p. ej. la línea de cada paso): sin transición.
 * Las transiciones de hover y las animaciones de interacción no se tocan.
 */
export function playedCss(keys: string[]): string {
  return keys
    .filter((key) => /^[a-z0-9:-]+$/.test(key))
    .map((key) => {
      const sel = '[data-reveal="' + key + '"]';
      return (
        sel + "{opacity:1!important;translate:none!important;transition:none!important}" +
        sel + ":is(.landing-rise,.landing-pop)," + sel + " :is(.landing-rise,.landing-pop){animation:none!important}" +
        sel + " .reveal-detail{transition:none!important}"
      );
    })
    .join("");
}

function readPlayed(): string[] {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(PLAYED_STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

const played = new Set<string>(typeof window === "undefined" ? [] : readPlayed());
let sheet: CSSStyleSheet | null = null;

/**
 * Registra la animación como vista. La regla CSS se aplica cuando ya terminó (`settleMs`):
 * aplicarla antes cortaría la animación en curso. Desde entonces, si el elemento se vuelve a
 * montar (navegación del cliente, cambio de idioma), aparece ya en su sitio.
 */
export function markPlayed(key: string, settleMs = 1400) {
  if (played.has(key)) return;
  played.add(key);
  try {
    sessionStorage.setItem(PLAYED_STORAGE_KEY, JSON.stringify([...played]));
  } catch {
    // Sin almacenamiento (modo privado estricto): solo se recuerda mientras la página siga abierta.
  }
  window.setTimeout(() => {
    if (!("adoptedStyleSheets" in document)) return;
    if (!sheet) {
      sheet = new CSSStyleSheet();
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    }
    sheet.replaceSync(playedCss([...played]));
  }, settleMs);
}
