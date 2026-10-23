"use client";

import { createDemoStore } from "../shared/createDemoStore";
import { buildSeed, SEED_VERSION } from "./data/seed";
import type { PosState } from "./types";

/** Estado de FluxPOS, guardado en el navegador. «Restablecer demo» vuelve a la semilla. */
export const { Provider: PosStoreProvider, useDemoStore: usePos } = createDemoStore<PosState>({
  storageKey: "norabyte-demo:fluxpos",
  version: SEED_VERSION,
  buildSeed: () => buildSeed(),
});
