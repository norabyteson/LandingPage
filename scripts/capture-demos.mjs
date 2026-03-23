/**
 * capture-demos.mjs
 * Genera capturas de los 9 demos y las guarda en public/demos/previews/
 *
 * Requiere que el servidor esté corriendo: npm run dev
 * Uso: npm run capture-demos
 */

import puppeteer from "puppeteer";
import { existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT     = resolve(__dirname, "..");
const OUT_DIR  = resolve(ROOT, "public/demos/previews");

const BASE_URL = "http://localhost:3000";
const VIEWPORT = { width: 1280, height: 960 }; // 4:3 — igual que las cards

const DEMOS = [
  { url: "/demos/ecommerce/luxemode.html",   out: "ecommerce-1.jpg", name: "LuxeMode"      },
  { url: "/demos/ecommerce/casamarket.html",  out: "ecommerce-2.jpg", name: "CasaMarket"    },
  { url: "/demos/ecommerce/tueste.html",      out: "ecommerce-3.jpg", name: "TUESTE"        },
  { url: "/demos/landing/gastronomo.html",    out: "landing-1.jpg",   name: "El Gastrónomo" },
  { url: "/demos/landing/aura.html",          out: "landing-2.jpg",   name: "AURA"          },
  { url: "/demos/landing/dentalux.html",      out: "landing-3.jpg",   name: "DentaLux"      },
  { url: "/demos/custom/nexuserp.html",       out: "custom-1.jpg",    name: "NexusERP"      },
  { url: "/demos/custom/fluxpos.html",        out: "custom-2.jpg",    name: "FluxPOS"       },
  { url: "/demos/custom/arquitectos.html",    out: "custom-3.jpg",    name: "ArquitectOS"   },
];

async function main() {
  // Verificar servidor
  try {
    const res = await fetch(`${BASE_URL}/demos/ecommerce/luxemode.html`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error(
      "\n❌  No se puede conectar a localhost:3000\n" +
      "    Asegúrate de que el servidor esté corriendo: npm run dev\n"
    );
    process.exit(1);
  }

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  console.log(`\n📸  Capturando ${DEMOS.length} demos...\n`);

  for (const demo of DEMOS) {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    try {
      await page.goto(`${BASE_URL}${demo.url}`, {
        waitUntil: "networkidle2",
        timeout: 30_000,
      });

      // Espera extra para fuentes y animaciones
      await new Promise((r) => setTimeout(r, 1000));

      const outPath = resolve(OUT_DIR, demo.out);
      await page.screenshot({ path: outPath, type: "jpeg", quality: 90 });

      console.log(`  ✅  ${demo.name.padEnd(15)}  →  public/demos/previews/${demo.out}`);
    } catch (err) {
      console.error(`  ❌  ${demo.name}  →  ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log(`\n✨  Listo. Recarga el sitio para ver las previews actualizadas.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
