"use client";

import { createDemoStore } from "../shared/createDemoStore";
import { buildSeed, SEED_VERSION } from "./data/seed";
import type { ErpState } from "./types";

/** Estado de NexusERP, guardado en el navegador. «Restablecer demo» vuelve a la semilla. */
export const { Provider: ErpStoreProvider, useDemoStore: useErp } = createDemoStore<ErpState>({
  storageKey: "norabyte-demo:nexuserp",
  version: SEED_VERSION,
  buildSeed: () => buildSeed(),
});
