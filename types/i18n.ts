export type Locale = "es" | "en";

export type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n").getDictionary>>;
