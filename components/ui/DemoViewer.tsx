"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Monitor,
  Menu,
} from "lucide-react";
import { smoothScrollTo } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/i18n";

interface Demo {
  name: string;
  desc: { es: string; en: string };
  url: string;
}

const DEMOS: Record<string, Demo[]> = {
  ecommerce: [
    { name: "LuxeMode", desc: { es: "Tienda de moda y accesorios de lujo", en: "Luxury fashion and accessories store" }, url: "/demos/ecommerce/luxemode.html" },
    { name: "CasaMarket", desc: { es: "Catálogo de decoración y hogar", en: "Home décor and furnishings catalog" }, url: "/demos/ecommerce/casamarket.html" },
    { name: "TUESTE", desc: { es: "Tienda de café de especialidad", en: "Specialty coffee shop" }, url: "/demos/ecommerce/tueste.html" },
  ],
  landing: [
    { name: "El Gastrónomo", desc: { es: "Restaurante de alta cocina", en: "Fine dining restaurant" }, url: "/demos/landing/gastronomo.html" },
    { name: "AURA", desc: { es: "Marca de maquillaje y belleza", en: "Makeup and beauty brand" }, url: "/demos/landing/aura.html" },
    { name: "DentaLux", desc: { es: "Clínica dental profesional", en: "Professional dental clinic" }, url: "/demos/landing/dentalux.html" },
  ],
  custom: [
    { name: "NexusERP", desc: { es: "Sistema ERP empresarial completo", en: "Full business ERP system" }, url: "/demos/custom/nexuserp.html" },
    { name: "FluxPOS", desc: { es: "Sistema punto de venta moderno", en: "Modern point of sale system" }, url: "/demos/custom/fluxpos.html" },
    { name: "ArquitectOS", desc: { es: "Gestión de personal y proyectos", en: "Staff and project management" }, url: "/demos/custom/arquitectos.html" },
  ],
};

const CATEGORY_LABELS: Record<string, { es: string; en: string }> = {
  ecommerce: { es: "Tienda en línea", en: "Online Store" },
  landing:   { es: "Sitio web y landing page", en: "Website & Landing Page" },
  custom:    { es: "Sistema personalizado", en: "Custom System" },
};

export type DemoViewerCopy = {
  loading: string;
  closeAria: string;
  examplesHeading: string;
  prev: string;
  next: string;
  prevAria: string;
  nextAria: string;
  ctaBody: string;
  ctaButton: string;
  ctaFootnote: string;
  dialogPreview: string;
  openMenuAria: string;
  closeMenuAria: string;
};

export interface DemoViewerProps {
  serviceId: string;
  initialIndex?: number;
  lang: Locale;
  onClose: () => void;
  copy: DemoViewerCopy;
  /** Label that matches `contact.form.services` for form prefill */
  serviceFormLabel: string;
}

export default function DemoViewer({
  serviceId,
  initialIndex = 0,
  lang,
  onClose,
  copy,
  serviceFormLabel,
}: DemoViewerProps) {
  const demos = DEMOS[serviceId] ?? [];
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isES = lang === "es";

  const currentDemo = demos[activeIndex];
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
        detail: { service: serviceFormLabel },
      })
    );
    onClose();
    setTimeout(() => {
      const el = document.getElementById("contact");
      if (el) smoothScrollTo(el, 370);
    }, 300);
  }, [serviceFormLabel, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mobileSidebarOpen) {
          setMobileSidebarOpen(false);
          return;
        }
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, handlePrev, handleNext, mobileSidebarOpen]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setMobileSidebarOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (!currentDemo) return null;

  const dialogLabel = copy.dialogPreview.replace("{name}", currentDemo.name);
  const demoDesc = currentDemo.desc[isES ? "es" : "en"];

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
        aria-label={dialogLabel}
      >
        <motion.div
          key="demo-panel"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative flex w-full h-full min-h-0 flex-col md:flex-row"
        >
          <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden min-h-0 min-w-0">
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-[#111]/90 backdrop-blur border-b border-white/5">
              <div className="hidden sm:flex gap-1.5 shrink-0" aria-hidden="true">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 min-w-0 bg-white/5 rounded-md px-2 sm:px-3 py-1 text-[11px] sm:text-xs text-white/40 truncate select-none">
                norabyte.com · demo · {currentDemo.name.toLowerCase()}
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen((o) => !o)}
                  className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-white/55 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label={mobileSidebarOpen ? copy.closeMenuAria : copy.openMenuAria}
                  aria-expanded={mobileSidebarOpen}
                >
                  {mobileSidebarOpen ? <ChevronRight size={18} /> : <Menu size={18} />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label={copy.closeAria}
                >
                  <X size={17} />
                </button>
                <Monitor size={14} className="text-white/30 hidden md:block" aria-hidden />
              </div>
            </div>

            <AnimatePresence>
              {iframeLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 top-10 z-10 flex flex-col items-center justify-center gap-4 bg-[#0a0a0a]"
                >
                  <div className="w-8 h-8 border-2 border-[#266DD3]/30 border-t-[#266DD3] rounded-full animate-spin" />
                  <p className="text-white/30 text-sm">{copy.loading}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <iframe
              key={currentDemo.url}
              src={currentDemo.url}
              title={currentDemo.name}
              className="w-full h-full pt-10 border-0"
              onLoad={() => setIframeLoading(false)}
            />
          </div>

          {mobileSidebarOpen && (
            <div
              className="fixed inset-0 z-[1005] bg-black/55 backdrop-blur-[2px] md:hidden"
              aria-hidden
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}

          <aside
            className={cn(
              "bg-[#0f0f0f] border-l border-white/8 flex flex-col overflow-y-auto overscroll-y-contain",
              "fixed inset-y-0 right-0 z-[1010] w-full max-w-sm pb-[env(safe-area-inset-bottom)]",
              "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] md:transition-none",
              mobileSidebarOpen ? "translate-x-0" : "translate-x-full",
              "md:relative md:z-auto md:inset-auto md:max-w-none md:translate-x-0 md:w-72 md:shrink-0 md:h-full md:overflow-hidden md:pb-0"
            )}
          >
            <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-white/8 gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#266DD3] min-w-0 break-words">
                {categoryLabel}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-colors"
                aria-label={copy.closeAria}
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-4 sm:px-5 py-4 sm:py-5 border-b border-white/8">
              <h2 className="text-white font-bold text-lg sm:text-xl leading-tight mb-1 break-words">
                {currentDemo.name}
              </h2>
              <p className="text-white/65 text-sm leading-relaxed">
                {demoDesc}
              </p>
            </div>

            <div className="px-4 sm:px-5 py-4 border-b border-white/8">
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3 font-semibold">
                {copy.examplesHeading}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {demos.map((demo, i) => (
                  <button
                    key={demo.name}
                    type="button"
                    onClick={() => {
                      if (i !== activeIndex) {
                        setIframeLoading(true);
                        setActiveIndex(i);
                      }
                      setMobileSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full min-h-[44px] text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-2",
                      i === activeIndex
                        ? "bg-[#266DD3]/15 text-white font-semibold border border-[#266DD3]/25"
                        : "text-white/65 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <span className="text-[10px] text-white/25 font-mono tabular-nums shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="break-words leading-snug">{demo.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3 border-b border-white/8">
              <button
                type="button"
                onClick={handlePrev}
                disabled={demos.length <= 1}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-xl border border-white/10 text-white/65 hover:text-white hover:border-white/25 transition-colors disabled:opacity-30 text-sm"
                aria-label={copy.prevAria}
              >
                <ChevronLeft size={15} />
                {copy.prev}
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={demos.length <= 1}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-xl border border-white/10 text-white/65 hover:text-white hover:border-white/25 transition-colors disabled:opacity-30 text-sm"
                aria-label={copy.nextAria}
              >
                {copy.next}
                <ChevronRight size={15} />
              </button>
            </div>

            <div className="hidden md:block flex-1 min-h-0" />

            <div className="px-4 sm:px-5 py-5 border-t border-white/8 bg-[#266DD3]/5 mt-auto">
              <p className="text-white/60 text-xs leading-relaxed mb-4">
                {copy.ctaBody}
              </p>
              <button
                type="button"
                onClick={handleRequestService}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#266DD3] hover:bg-[#1a5bbf] text-white text-sm font-semibold transition-colors shadow-lg shadow-[#266DD3]/20"
              >
                {copy.ctaButton}
                <ArrowRight size={15} />
              </button>
              <p className="text-white/25 text-[10px] text-center mt-3 leading-relaxed">
                {copy.ctaFootnote}
              </p>
            </div>
          </aside>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
