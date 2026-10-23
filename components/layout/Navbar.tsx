"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { lockPageScroll, smoothScrollTo } from "@/lib/smooth-scroll";
import { buttonClasses } from "@/lib/ui";
import { useInView } from "@/components/ui/Reveal";
import type { Locale } from "@/types/i18n";

interface NavbarProps {
  dict: {
    nav: {
      services: string;
      portfolio?: string;
      about: string;
      contact: string;
      cta: string;
      whatsapp: string;
    };
    contact: {
      whatsapp: { href: string; shortLabel: string };
    };
    language: {
      switch: string;
      current: string;
    };
  };
  lang: Locale;
}

/** Logo claro u oscuro según la clase del tema, por CSS: no espera a hidratar. */
function Logo({ className }: { className?: string }) {
  return (
    <>
      <Image
        src="/norabyte_logo_transparente.png"
        alt="NORABYTE"
        width={160}
        height={40}
        priority
        className={cn("w-auto object-contain dark:hidden", className)}
      />
      <Image
        src="/norabyte_logo_transparente_blanco.webp"
        alt="NORABYTE"
        width={160}
        height={40}
        className={cn("hidden w-auto object-contain dark:block", className)}
      />
    </>
  );
}

export default function Navbar({ dict, lang }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  // Marca invisible en lo alto del documento: mientras se ve, la cabecera va sin borde ni sombra.
  const [topRef, atTop] = useInView<HTMLDivElement>({ once: false });

  const navItems = [
    { label: dict.nav.services, href: `/${lang}#services`, id: "services" },
    { label: dict.nav.about, href: `/${lang}#about`, id: "about" },
    { label: dict.nav.contact, href: `/${lang}#contact`, id: "contact" },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      smoothScrollTo(element, 370);
      window.history.pushState(null, "", href);
    } else if (pathname !== `/${lang}`) {
      window.location.href = href;
    }
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    return lockPageScroll();
  }, [isMenuOpen]);

  const otherLang: Locale = lang === "es" ? "en" : "es";
  const langSwitchHref = pathname.replace(`/${lang}`, `/${otherLang}`) || `/${otherLang}`;

  // Prefetch de la ruta del otro idioma al montar para acelerar el cambio
  useEffect(() => {
    router.prefetch(`/${otherLang}`);
  }, [router, otherLang]);

  // scroll: false mantiene la posición al cambiar de idioma
  const handleLangSwitch = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsMenuOpen(false);
      router.push(langSwitchHref, { scroll: false });
    },
    [router, langSwitchHref]
  );

  const isDark = mounted && theme === "dark";
  const themeLabel = isDark ? "Activar modo claro" : "Activar modo oscuro";

  /** ES | EN: el idioma actual marcado, el otro como enlace. */
  const langSwitch = (
    <div className="flex items-center rounded-xl border border-line p-0.5 text-xs font-semibold">
      {(["es", "en"] as const).map((code) =>
        code === lang ? (
          <span
            key={code}
            aria-current="true"
            aria-label={`Idioma actual: ${code.toUpperCase()}`}
            className="rounded-[10px] bg-surface-hover px-2.5 py-1.5 text-ink"
          >
            {code.toUpperCase()}
          </span>
        ) : (
          <a
            key={code}
            href={langSwitchHref}
            onClick={handleLangSwitch}
            hrefLang={code}
            className="rounded-[10px] px-2.5 py-1.5 text-ink-subtle transition-colors hover:text-ink"
          >
            {code.toUpperCase()}
          </a>
        )
      )}
    </div>
  );

  return (
    <>
      <div ref={topRef} aria-hidden="true" className="pointer-events-none absolute top-0 h-px w-px" />

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[100] border-b bg-surface/85 backdrop-blur-md",
          "transition-[border-color,box-shadow] duration-300 ease-standard",
          atTop
            ? "border-transparent"
            : "border-line/70 shadow-[0_8px_24px_-16px_rgb(var(--ui-shadow-tint)/0.25)]"
        )}
      >
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 md:h-[72px]"
          aria-label="Navegación principal"
        >
          <Link
            href={`/${lang}`}
            onClick={() => {
              const lenis = (window as typeof window & { __lenis?: { scrollTo(t: number): void } }).__lenis;
              if (lenis) lenis.scrollTo(0);
              else window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex min-h-11 items-center rounded-lg transition-opacity hover:opacity-80"
            aria-label="NORABYTE - Inicio"
          >
            <Logo className="h-9 md:h-10" />
          </Link>

          <ul className="hidden items-center gap-1 md:flex" role="list">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.id, item.href)}
                  className={buttonClasses("ghost")}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeLabel}
              className="flex size-10 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
            >
              {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>
            {langSwitch}
            <a
              href={dict.contact.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("ghost")}
            >
              {dict.nav.whatsapp}
            </a>
            <a
              href={`/${lang}#contact`}
              onClick={(e) => handleNavClick(e, "contact", `/${lang}#contact`)}
              className={buttonClasses("primary")}
            >
              {dict.nav.cta}
            </a>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex size-11 items-center justify-center rounded-xl border border-line text-ink md:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </nav>
      </header>

      {/* ——— Menú móvil ——— */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[110] bg-ink/40 backdrop-blur-[2px]"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              key="menu-panel"
              id="mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }}
              className="fixed inset-y-0 right-0 z-[120] flex w-80 max-w-[85vw] flex-col border-l border-line bg-surface"
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
            >
              <div className="flex h-16 items-center justify-between border-b border-line px-5">
                <Logo className="h-8" />
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex size-11 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-hover hover:text-ink"
                  aria-label="Cerrar menú"
                  autoFocus
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4" aria-label="Menú móvil">
                <ul className="space-y-1" role="list">
                  {navItems.map((item, i) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.05, duration: 0.3, ease: [0.2, 0, 0, 1] }}
                    >
                      <a
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.id, item.href)}
                        className="flex min-h-12 items-center rounded-xl px-4 text-lg font-semibold text-ink hover:bg-surface-hover"
                      >
                        {item.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <div className="space-y-3 border-t border-line p-5">
                <div className="flex items-center justify-between gap-3">
                  {langSwitch}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={themeLabel}
                    className="flex size-11 items-center justify-center rounded-xl border border-line text-ink-muted hover:text-ink"
                  >
                    {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
                  </button>
                </div>
                <a
                  href={dict.contact.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonClasses("secondary", "lg"), "w-full")}
                >
                  {dict.nav.whatsapp}
                </a>
                <a
                  href={`/${lang}#contact`}
                  onClick={(e) => handleNavClick(e, "contact", `/${lang}#contact`)}
                  className={cn(buttonClasses("primary", "lg"), "w-full")}
                >
                  {dict.nav.cta}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
