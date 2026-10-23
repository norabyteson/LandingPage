"use client";

import { createDemoStore } from "../shared/createDemoStore";
import { buildSeed, SEED_VERSION } from "./data/seed";
import type { ArqState } from "./types";

/** Estado de ArquitectOS, guardado en el navegador. «Restablecer demo» vuelve a la semilla. */
export const { Provider: ArqStoreProvider, useDemoStore: useArq } = createDemoStore<ArqState>({
  storageKey: "norabyte-demo:arquitectos",
  version: SEED_VERSION,
  buildSeed: () => buildSeed(),
});
