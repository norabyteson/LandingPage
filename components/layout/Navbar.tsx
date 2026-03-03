"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import type { Locale } from "@/types/i18n";

interface NavbarProps {
  dict: {
    nav: {
      services: string;
      portfolio: string;
      about: string;
      contact: string;
      cta: string;
    };
    language: {
      switch: string;
      current: string;
    };
  };
  lang: Locale;
}

export default function Navbar({ dict, lang }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: dict.nav.services, href: `/${lang}#services`, id: "services" },
    { label: dict.nav.about, href: `/${lang}#about`, id: "about" },
    { label: dict.nav.contact, href: `/${lang}#contact`, id: "contact" },
  ];

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    handleScroll(); // Verifica posición actual al montar (evita navbar transparente en refresh)
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Manejador estricto de scroll suave para Links (Evita clicks vacíos mientras se hace scroll)
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      // 1. Eliminar momentum scroll inmediatamente
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(window.scrollX, window.scrollY);
      
      // 2. Restaurar y hacer scroll suave forzado al elemento
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Calcular la posición exacta restando el padding de la navbar
        const headerOffset = 96; // 6rem para cuadrar con globals.css scroll-padding-top
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
        window.scrollTo({
           top: offsetPosition,
           behavior: "smooth"
        });
      }, 10);

      // Actualizar URL sin recargar para mantener compatibilidad
      window.history.pushState(null, "", href);
    } else if (pathname !== `/${lang}`) {
      // Si estamos en otra página que no es el home, forzar navegación normal
      window.location.href = href;
    }
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const otherLang: Locale = lang === "es" ? "en" : "es";
  const langSwitchHref = pathname.replace(`/${lang}`, `/${otherLang}`) || `/${otherLang}`;

  // Prefetch de la ruta del otro idioma al montar para acelerar el cambio
  useEffect(() => {
    router.prefetch(`/${otherLang}`);
  }, [router, otherLang]);

  // Cambio de idioma rápido sin animación de recarga global
  const handleLangSwitch = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsMenuOpen(false);
      // scroll: false mantiene la posición de scroll al cambiar idioma
      router.push(langSwitchHref, { scroll: false });
    },
    [router, langSwitchHref]
  );

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] outline-none",
          "transition-[background-color,border-color,box-shadow,padding] duration-300 ease-in-out",
          isScrolled
            ? [
                "py-3",
                "backdrop-blur-xl",
                "bg-[var(--nb-dark)]/92",
                "shadow-[0_4px_30px_rgba(0,0,0,0.35)]",
              ]
            : "bg-transparent py-5"
        )}
        role="banner"
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between"
          aria-label="Navegación principal"
        >
          {/* Logo */}
          <Link
            href={`/${lang}`}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 group"
            aria-label="NORABYTE - Inicio"
          >
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-[var(--nb-primary)] opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0.5 rounded-md bg-[var(--nb-dark)] flex items-center justify-center">
                <span className="text-[var(--nb-primary)] font-bold text-xs tracking-tighter">NB</span>
              </div>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[var(--nb-light)]">
              NORA<span className="text-[var(--nb-primary)]">BYTE</span>
            </span>
          </Link>

          {/* Nav links — Desktop */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.id, item.href)}
                  className="relative px-4 py-2 text-sm font-medium text-[var(--nb-light)]/70 hover:text-[var(--nb-light)] transition-colors duration-200 rounded-full hover:bg-[var(--nb-light)]/5 group"
                >
                  {item.label}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[var(--nb-primary)] rounded-full transition-all duration-300 group-hover:w-4" />
                </a>
              </li>
            ))}
          </ul>

          {/* Acciones — Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {/* Toggle de tema */}
            <button
              onClick={toggleTheme}
              aria-label={!mounted || theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--nb-light)]/50 hover:text-[var(--nb-primary)] hover:bg-[var(--nb-light)]/8 transition-all duration-200"
            >
              <AnimatePresence mode="wait" initial={false}>
                {!mounted || theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun size={17} aria-hidden="true" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon size={17} aria-hidden="true" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Switch de idioma Mejorado con Flags */}
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border border-[var(--nb-light)]/15 text-[var(--nb-light)]/70 hover:text-[var(--nb-light)] hover:border-[var(--nb-light)]/30 hover:bg-[var(--nb-light)]/5 transition-all duration-200 cursor-pointer"
                aria-label={`Idioma actual: ${lang.toUpperCase()}`}
              >
                <Image 
                  src={lang === "es" ? "https://flagcdn.com/w20/mx.png" : "https://flagcdn.com/w20/us.png"}
                  width={16}
                  height={12}
                  style={{ width: "auto", height: "auto" }}
                  alt={lang === "es" ? "Bandera MX" : "US Flag"}
                  className="rounded-[2px] object-cover"
                />
                <span className="tracking-widest">{lang.toUpperCase()}</span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full right-0 mt-2 w-32 rounded-xl bg-[var(--nb-dark-surface)] border border-[var(--nb-light)]/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden z-50 transform origin-top-right scale-95 group-hover:scale-100">
                <a
                  href={langSwitchHref}
                  onClick={handleLangSwitch}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--nb-light)]/70 hover:text-[var(--nb-light)] hover:bg-[var(--nb-primary)]/10 transition-colors w-full text-left"
                >
                  <Image 
                    src={otherLang === "es" ? "https://flagcdn.com/w20/mx.png" : "https://flagcdn.com/w20/us.png"}
                    width={18}
                    height={13}
                    style={{ width: "auto", height: "auto" }}
                    alt={otherLang === "es" ? "Bandera MX" : "US Flag"}
                    className="rounded-[2px] object-cover"
                  />
                  <span className="font-medium">{dict.language.switch}</span>
                </a>
              </div>
            </div>

            {/* CTA */}
            <a
              href={`/${lang}#contact`}
              onClick={(e) => handleNavClick(e, "contact", `/${lang}#contact`)}
              className="btn-primary text-sm py-2.5 px-5 ml-1"
            >
              {dict.nav.cta}
            </a>
          </div>

          {/* Botón hamburguesa — Mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--nb-light)]/8 border border-[var(--nb-light)]/10 text-[var(--nb-light)]"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={18} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </nav>
      </motion.header>

      {/* ——— Menú móvil ——— */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm shadow-[0_0_100px_rgba(0,0,0,0.5)]"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Panel del menú */}
            <motion.div
              key="menu-panel"
              id="mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 40 }}
              className="fixed top-0 right-0 bottom-0 z-[120] w-72 bg-[var(--nb-dark)]/95 backdrop-blur-xl border-l border-[var(--nb-primary)]/15 flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
            >
              {/* Header del panel */}
              <div className="flex items-center justify-between p-6 pb-5">
                <span className="font-extrabold text-lg text-[var(--nb-light)]">
                  NORA<span className="text-[var(--nb-primary)]">BYTE</span>
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--nb-light)]/10 text-[var(--nb-light)]/70 hover:text-[var(--nb-light)] transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 p-6" aria-label="Menú móvil">
                <ul className="space-y-1" role="list">
                  {navItems.map((item, i) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 + 0.1 }}
                    >
                      <a
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.id, item.href)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--nb-light)]/70 hover:text-[var(--nb-light)] hover:bg-[var(--nb-light)]/8 transition-all duration-200 font-medium"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--nb-primary)] opacity-60" aria-hidden="true" />
                        {item.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Footer del panel */}
              <div className="p-6 pt-4 space-y-3">
                {/* Fila: idioma + tema */}
                <div className="flex gap-2">
                  <a
                    href={langSwitchHref}
                    onClick={handleLangSwitch}
                    className="flex-1 flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-[var(--nb-light)]/15 hover:border-[var(--nb-light)]/30 hover:bg-[var(--nb-light)]/5 transition-all duration-200 cursor-pointer"
                  >
                    <Image 
                      src={otherLang === "es" ? "https://flagcdn.com/w20/mx.png" : "https://flagcdn.com/w20/us.png"}
                      width={18}
                      height={13}
                      style={{ width: "auto", height: "auto" }}
                      alt={otherLang === "es" ? "Bandera MX" : "US Flag"}
                      className="rounded-[2px] object-cover"
                    />
                    <span className="text-sm font-semibold text-[var(--nb-light)]/80 uppercase tracking-widest">{dict.language.switch}</span>
                  </a>
                  <button
                    onClick={toggleTheme}
                    aria-label={!mounted || theme === "dark" ? "Modo claro" : "Modo oscuro"}
                    className="w-12 flex items-center justify-center rounded-xl border border-[var(--nb-light)]/15 text-[var(--nb-light)]/60 hover:text-[var(--nb-primary)] hover:border-[var(--nb-primary)]/30 transition-all duration-200"
                  >
                    {!mounted || theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                </div>
                <a
                  href={`/${lang}#contact`}
                  className="btn-primary w-full text-sm py-3"
                  onClick={(e) => handleNavClick(e, "contact", `/${lang}#contact`)}
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
