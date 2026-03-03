import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";
import type { Locale } from "@/types/i18n";

interface FooterProps {
  dict: {
    footer: {
      tagline: string;
      services: string;
      company: string;
      legal: string;
      links: {
        services: { label: string; href: string }[];
        company: { label: string; href: string }[];
        legal: { label: string; href: string }[];
      };
      copyright: string;
    };
    nav: { contact: string };
  };
  lang: Locale;
}

export default function Footer({ dict, lang }: FooterProps) {
  const { footer } = dict;

  return (
    <footer
      className="relative bg-[var(--nb-dark)]"
      role="contentinfo"
      aria-label="Pie de página"
    >
      {/* Glow superior */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[var(--nb-primary)]/40 to-transparent"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Columna de marca */}
          <div className="lg:col-span-2">
            <Link
              href={`/${lang}`}
              className="inline-flex items-center gap-2 mb-4 group"
              aria-label="NORABYTE - Inicio"
            >
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-lg bg-[var(--nb-primary)] opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0.5 rounded-md bg-[var(--nb-dark)] flex items-center justify-center">
                  <span className="text-[var(--nb-primary)] font-bold text-xs tracking-tighter">NB</span>
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[var(--nb-light)]">
                NORA<span className="text-[var(--nb-primary)]">BYTE</span>
              </span>
            </Link>
            <p className="text-[var(--nb-light)]/50 text-sm leading-relaxed max-w-xs">
              {footer.tagline}
            </p>

            {/* Redes sociales */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Github, label: "GitHub", href: "#" },
                { icon: Linkedin, label: "LinkedIn", href: "#" },
                { icon: Twitter, label: "Twitter / X", href: "#" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-[var(--nb-light)]/40 hover:text-[var(--nb-primary)] hover:border-[var(--nb-primary)]/30 transition-all duration-200"
                >
                  <Icon size={15} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="text-[var(--nb-light)] font-semibold text-sm mb-4 tracking-wide">
              {footer.services}
            </h3>
            <ul className="space-y-3" role="list">
              {footer.links.services.map((item) => (
                <li key={item.label}>
                  <Link
                    href={`/${lang}${item.href.startsWith('#') ? item.href : item.href}`}
                    className="text-[var(--nb-light)]/45 hover:text-[var(--nb-primary-light)] text-sm transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-[var(--nb-light)] font-semibold text-sm mb-4 tracking-wide">
              {footer.company}
            </h3>
            <ul className="space-y-3" role="list">
              {footer.links.company.map((item) => (
                <li key={item.label}>
                  <Link
                    href={`/${lang}${item.href.startsWith('#') ? item.href : item.href}`}
                    className="text-[var(--nb-light)]/45 hover:text-[var(--nb-primary-light)] text-sm transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[var(--nb-light)] font-semibold text-sm mb-4 tracking-wide">
              {footer.legal}
            </h3>
            <ul className="space-y-3" role="list">
              {footer.links.legal.map((item) => (
                <li key={item.label}>
                  <Link
                    href={`/${lang}${item.href.startsWith('#') ? item.href : item.href}`}
                    className="text-[var(--nb-light)]/45 hover:text-[var(--nb-primary-light)] text-sm transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[var(--nb-light)]/30 text-xs">
            {footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
