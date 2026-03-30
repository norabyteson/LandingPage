import puppeteer from "puppeteer";
import { existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(ROOT, "public/dashboard-assets");
const TEMPLATE_PATH = resolve(ROOT, "scripts/templates/dashboard-capture.html");
const TEMPLATE_URL = pathToFileURL(TEMPLATE_PATH).href;

const VIEWPORT = { width: 1700, height: 1100 };

const TARGETS = [
  { lang: "en", out: "dashboard-en.webp" },
  { lang: "es", out: "dashboard-es.webp" },
];

const translateToEs = () => {
  const set = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };

  const setMenu = (index, value) => {
    const items = document.querySelectorAll(".menu .menu-item");
    const item = items[index];
    if (!item) return;
    item.innerHTML = `<span class="dot"></span>${value}`;
  };

  set(".subtitle", "Consola de administración");
  setMenu(0, "Tablero");
  setMenu(1, "Analíticas");
  setMenu(2, "Pedidos");
  setMenu(3, "Inventario");
  setMenu(4, "Clientes");
  setMenu(5, "Configuración");
  set(".cta", "+ Nuevo Reporte");
  set(".profile .role", "Administrador del sistema");
  set(".topbar h2", "Resumen del tablero");
  set(".search", "Buscar datos...");

  set(".kpi-grid .card:nth-child(1) .kpi-title", "Ingresos Totales");
  set(".kpi-grid .card:nth-child(1) .kpi-trend", "+12.5% vs mes anterior");
  set(".kpi-grid .card:nth-child(2) .kpi-title", "Pedidos Activos");
  set(".kpi-grid .card:nth-child(2) .kpi-trend", "-2.4% vs ayer");
  set(".kpi-grid .card:nth-child(3) .kpi-title", "Nuevos Clientes");
  set(".kpi-grid .card:nth-child(3) .kpi-trend", "+18.1% vs promedio");
  set(".kpi-grid .card:nth-child(4) .kpi-title", "Valor Prom. Pedido");
  set(".kpi-grid .card:nth-child(4) .kpi-trend", "+4.2% de crecimiento");

  set(".middle-grid .card:nth-child(1) .chart-title", "Crecimiento semanal de ventas");
  set(".middle-grid .card:nth-child(1) .chart-subtitle", "Seguimiento de rendimiento del ciclo actual");
  set(".middle-grid .card:nth-child(1) .tab.active", "Semana");
  set(".middle-grid .card:nth-child(1) .tab:not(.active)", "Mes");

  set(".middle-grid .card:nth-child(2) .chart-title", "Insights en tiempo real");
  set(".middle-grid .card:nth-child(2) .spark-row:nth-of-type(1) span", "Ventas directas");
  set(".middle-grid .card:nth-child(2) .spark-row:nth-of-type(2) span", "Marketplace");
  set(".goal div div:nth-child(1)", "Meta alcanzada");
  set(".goal div div:nth-child(2)", "Objetivo mensual casi cumplido");

  set(".table-head h3", "Seguimiento de pedidos activos");
  set(".table-link", "Ver todos los pedidos");
};

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  for (const target of TARGETS) {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    try {
      await page.goto(TEMPLATE_URL, { waitUntil: "networkidle2", timeout: 30000 });
      await page.evaluate(async () => {
        if (document.fonts?.ready) await document.fonts.ready;
      });

      if (target.lang === "es") {
        await page.evaluate(translateToEs);
      }

      const frame = await page.$(".capture-frame");
      if (!frame) throw new Error("No se encontró .capture-frame");

      const outPath = resolve(OUT_DIR, target.out);
      await frame.screenshot({ path: outPath, type: "webp", quality: 88 });
      console.log(`✅ Captura generada: public/dashboard-assets/${target.out}`);
    } catch (err) {
      console.error(`❌ Error con ${target.out}: ${err.message}`);
      process.exitCode = 1;
    } finally {
      await page.close();
    }
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
