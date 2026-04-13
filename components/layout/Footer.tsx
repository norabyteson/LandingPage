import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import type { Locale } from "@/types/i18n";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
      social: {
        facebook: string;
        instagram: string;
        whatsapp: string;
      };
      socialAria: {
        facebook: string;
        instagram: string;
        whatsapp: string;
      };
    };
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
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[var(--nb-primary)]/40 to-transparent"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <Link
              href={`/${lang}`}
              className="inline-flex items-center gap-2 mb-4 group"
              aria-label="NORABYTE - Inicio"
            >
              <span className="font-extrabold text-xl tracking-tight text-[var(--nb-light)]">
                NORA<span className="text-[var(--nb-primary)]">BYTE</span>
              </span>
            </Link>
            <p className="text-[var(--nb-light)]/65 text-sm leading-relaxed max-w-xs">
              {footer.tagline}
            </p>

            <div className="flex items-center gap-3 mt-6">
              <a
                href={footer.social.facebook}
                aria-label={footer.socialAria.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-[var(--nb-light)]/60 hover:text-[var(--nb-primary)] hover:border-[var(--nb-primary)]/30 transition-all duration-200"
              >
                <Facebook size={15} aria-hidden="true" />
              </a>
              <a
                href={footer.social.instagram}
                aria-label={footer.socialAria.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-[var(--nb-light)]/60 hover:text-[var(--nb-primary)] hover:border-[var(--nb-primary)]/30 transition-all duration-200"
              >
                <Instagram size={15} aria-hidden="true" />
              </a>
              <a
                href={footer.social.whatsapp}
                aria-label={footer.socialAria.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-[var(--nb-light)]/60 hover:text-emerald-400 hover:border-emerald-500/35 transition-all duration-200"
              >
                <WhatsAppIcon className="w-[15px] h-[15px]" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-[var(--nb-light)] font-semibold text-sm mb-4 tracking-wide">
              {footer.services}
            </h3>
            <ul className="space-y-3" role="list">
              {footer.links.services.map((item) => (
                <li key={item.label}>
                  <Link
                    href={`/${lang}${item.href.startsWith("#") ? item.href : item.href}`}
                    className="text-[var(--nb-light)]/60 hover:text-[var(--nb-primary-light)] text-sm transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[var(--nb-light)] font-semibold text-sm mb-4 tracking-wide">
              {footer.company}
            </h3>
            <ul className="space-y-3" role="list">
              {footer.links.company.map((item) => (
                <li key={item.label}>
                  <Link
                    href={`/${lang}${item.href.startsWith("#") ? item.href : item.href}`}
                    className="text-[var(--nb-light)]/60 hover:text-[var(--nb-primary-light)] text-sm transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[var(--nb-light)] font-semibold text-sm mb-4 tracking-wide">
              {footer.legal}
            </h3>
            <ul className="space-y-3" role="list">
              {footer.links.legal.map((item) => (
                <li key={item.label}>
                  <Link
                    href={`/${lang}${item.href.startsWith("#") ? item.href : item.href}`}
                    className="text-[var(--nb-light)]/60 hover:text-[var(--nb-primary-light)] text-sm transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[var(--nb-light)]/65 text-xs">
            {footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
