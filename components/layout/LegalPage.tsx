import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MarkPlayed from "@/components/ui/MarkPlayed";

interface LegalPageProps {
  /** Clave de la página (`privacy`, `terms`): su entrada se anima una vez por pestaña. */
  pageKey: string;
  backHref: string;
  backLabel: string;
  title: string;
  lastUpdated: string;
  sections: { title: string; body: string }[];
}

/**
 * Página legal (privacidad, términos) con el mismo lenguaje que la landing: texto a ancho de
 * lectura, secciones separadas por líneas finas y la entrada sutil del título.
 */
export default function LegalPage({ pageKey, backHref, backLabel, title, lastUpdated, sections }: LegalPageProps) {
  return (
    <div className="bg-surface">
      <article className="mx-auto max-w-3xl px-4 pt-28 pb-24 sm:px-6 md:pt-36 lg:pb-32">
        <Link
          href={backHref}
          className="group inline-flex min-h-11 items-center gap-2 font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft
            size={16}
            aria-hidden="true"
            className="transition-transform duration-200 ease-standard group-hover:-translate-x-1 motion-reduce:transition-none"
          />
          {backLabel}
        </Link>

        <MarkPlayed name={`legal-${pageKey}`} />
        <header data-reveal={`legal-${pageKey}`} className="landing-rise mt-8">
          <h1 className="text-4xl leading-[1.05] font-extrabold tracking-tight text-balance text-ink sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm text-ink-subtle">{lastUpdated}</p>
        </header>

        <div className="mt-14 divide-y divide-line border-t border-line">
          {sections.map((section) => (
            <section key={section.title} className="py-8">
              <h2 className="text-xl font-bold tracking-tight text-ink">{section.title}</h2>
              <p className="mt-3 text-lg leading-relaxed text-ink-muted">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
