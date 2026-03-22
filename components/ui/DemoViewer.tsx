"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Monitor,
} from "lucide-react";
import { smoothScrollTo } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";

interface Demo {
  name: string;
  desc: string;
  url: string;
}

const DEMOS: Record<string, Demo[]> = {
  ecommerce: [
    { name: "LuxeMode", desc: "Tienda de moda y accesorios de lujo", url: "/demos/ecommerce/luxemode.html" },
    { name: "CasaMarket", desc: "Catálogo de decoración y hogar", url: "/demos/ecommerce/casamarket.html" },
    { name: "TUESTE", desc: "Tienda de café de especialidad", url: "/demos/ecommerce/tueste.html" },
  ],
  landing: [
    { name: "El Gastrónomo", desc: "Restaurante de alta cocina", url: "/demos/landing/gastronomo.html" },
    { name: "AURA", desc: "Marca de maquillaje y belleza", url: "/demos/landing/aura.html" },
    { name: "DentaLux", desc: "Clínica dental profesional", url: "/demos/landing/dentalux.html" },
  ],
  custom: [
    { name: "NexusERP", desc: "Sistema ERP empresarial completo", url: "/demos/custom/nexuserp.html" },
    { name: "FluxPOS", desc: "Sistema punto de venta moderno", url: "/demos/custom/fluxpos.html" },
    { name: "ArquitectOS", desc: "Gestión de personal y proyectos", url: "/demos/custom/arquitectos.html" },
  ],
};

const SERVICE_LABELS: Record<string, { es: string; en: string }> = {
  ecommerce: { es: "Tienda en Línea", en: "Online Store" },
  landing:   { es: "Sitio Web o Landing Page", en: "Website or Landing Page" },
  custom:    { es: "Sistema Personalizado", en: "Custom System" },
};

const CATEGORY_LABELS: Record<string, { es: string; en: string }> = {
  ecommerce: { es: "Tienda en Línea", en: "Online Store" },
  landing:   { es: "Sitio Web y Landing Page", en: "Website & Landing Page" },
  custom:    { es: "Sistema Personalizado", en: "Custom System" },
};

export interface DemoViewerProps {
  serviceId: string;
  initialIndex?: number;
  lang: string;
  onClose: () => void;
}

export default function DemoViewer({
  serviceId,
  initialIndex = 0,
  lang,
  onClose,
}: DemoViewerProps) {
  const demos = DEMOS[serviceId] ?? [];
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [iframeLoading, setIframeLoading] = useState(true);
  const isES = lang === "es";

  const currentDemo = demos[activeIndex];
  const serviceLabel = SERVICE_LABELS[serviceId]?.[isES ? "es" : "en"] ?? "";
  const categoryLabel = CATEGORY_LABELS[serviceId]?.[isES ? "es" : "en"] ?? "";

  const handlePrev = useCallback(() => {
    setIframeLoading(true);
    setActiveIndex((i) => (i - 1 + demos.length) % demos.length);
  }, [demos.length]);

  const handleNext = useCallback(() => {
    setIframeLoading(true);
    setActiveIndex((i) => (i + 1) % demos.length);
  }, [demos.length]);

  const handleRequestService = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent("norabyte:prefill-service", {
        detail: { service: serviceLabel },
      })
    );
    onClose();
    setTimeout(() => {
      const el = document.getElementById("contact");
      if (el) smoothScrollTo(el, 370);
    }, 300);
  }, [serviceLabel, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, handlePrev, handleNext]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!currentDemo) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="demo-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-stretch"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label={`Vista previa: ${currentDemo.name}`}
      >
        <motion.div
          key="demo-panel"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative flex w-full h-full"
        >
          {/* ── Iframe area ─────────────────────────────────────── */}
          <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden">
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-2.5 bg-[#111]/90 backdrop-blur border-b border-white/5">
              <div className="flex gap-1.5" aria-hidden="true">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 bg-white/5 rounded-md px-3 py-1 text-xs text-white/40 truncate select-none">
                norabyte.com · demo · {currentDemo.name.toLowerCase()}
              </div>
              <Monitor size={14} className="text-white/30" />
            </div>

            {/* Loading skeleton */}
            <AnimatePresence>
              {iframeLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 top-10 z-10 flex flex-col items-center justify-center gap-4 bg-[#0a0a0a]"
                >
                  <div className="w-8 h-8 border-2 border-[#266DD3]/30 border-t-[#266DD3] rounded-full animate-spin" />
                  <p className="text-white/30 text-sm">Cargando demo...</p>
                </motion.div>
              )}
            </AnimatePresence>

            <iframe
              key={currentDemo.url}
              src={currentDemo.url}
              title={currentDemo.name}
              className="w-full h-full pt-10 border-0"
              onLoad={() => setIframeLoading(false)}
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          </div>

          {/* ── Side control panel ───────────────────────────────── */}
          <aside className="w-72 shrink-0 bg-[#0f0f0f] border-l border-white/8 flex flex-col h-full overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#266DD3]">
                {categoryLabel}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-colors"
                aria-label="Cerrar vista previa"
              >
                <X size={16} />
              </button>
            </div>

            {/* Demo info */}
            <div className="px-5 py-5 border-b border-white/8">
              <h2 className="text-white font-bold text-xl leading-tight mb-1">
                {currentDemo.name}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                {currentDemo.desc}
              </p>
            </div>

            {/* Demo navigation */}
            <div className="px-5 py-4 border-b border-white/8">
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3 font-semibold">
                {isES ? "Ejemplos en esta categoría" : "Examples in this category"}
              </p>
              <div className="flex flex-col gap-2">
                {demos.map((demo, i) => (
                  <button
                    key={demo.name}
                    onClick={() => { if (i !== activeIndex) { setIframeLoading(true); setActiveIndex(i); } }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                      i === activeIndex
                        ? "bg-[#266DD3]/15 text-white font-semibold border border-[#266DD3]/25"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span className="text-[10px] text-white/25 mr-2 font-mono tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {demo.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Prev / Next arrows */}
            <div className="px-5 py-4 flex items-center gap-3 border-b border-white/8">
              <button
                onClick={handlePrev}
                disabled={demos.length <= 1}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-colors disabled:opacity-30 text-sm"
                aria-label="Demo anterior"
              >
                <ChevronLeft size={15} />
                {isES ? "Anterior" : "Previous"}
              </button>
              <button
                onClick={handleNext}
                disabled={demos.length <= 1}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-colors disabled:opacity-30 text-sm"
                aria-label="Siguiente demo"
              >
                {isES ? "Siguiente" : "Next"}
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* CTA */}
            <div className="px-5 py-5 border-t border-white/8 bg-[#266DD3]/5">
              <p className="text-white/60 text-xs leading-relaxed mb-4">
                {isES
                  ? "¿Te gustó este diseño? Cuéntanos tu idea y construimos algo así para tu negocio."
                  : "Like this design? Tell us your idea and we'll build something like this for your business."}
              </p>
              <button
                onClick={handleRequestService}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#266DD3] hover:bg-[#1a5bbf] text-white text-sm font-semibold transition-colors shadow-lg shadow-[#266DD3]/20"
              >
                {isES ? "Quiero algo así" : "I want something like this"}
                <ArrowRight size={15} />
              </button>
              <p className="text-white/25 text-[10px] text-center mt-3 leading-relaxed">
                {isES
                  ? "Respuesta en menos de 24 h · Sin compromiso"
                  : "Response in under 24h · No commitment"}
              </p>
            </div>
          </aside>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
