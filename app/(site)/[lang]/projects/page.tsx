import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import { getDictionary, isValidLocale, defaultLocale } from "@/lib/i18n";
import type { Locale } from "@/types/i18n";
import MarkPlayed from "@/components/ui/MarkPlayed";
import ProjectDetail, { type ProjectItem } from "@/components/projects/ProjectDetail";
import { arrowNudge, buttonClasses } from "@/lib/ui";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : defaultLocale;
  const { projects } = await getDictionary(locale);
  const title = projects.title;
  const description = projects.page.metaDescription;
  const parentOpenGraph = (await parent).openGraph ?? {};

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/projects`,
      languages: { "es-MX": "/es/projects", "en-US": "/en/projects" },
    },
    openGraph: { ...parentOpenGraph, title, description, url: `/${locale}/projects` },
  };
}

const GROUPS = ["project", "demo"] as const;

/** Proyectos y demos completos, en dos grupos. La landing solo muestra la vista previa (ProjectsSection). */
export default async function ProjectsPage({ params }: PageProps) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const { projects } = dict;

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-6 md:pt-36 lg:px-8 lg:pb-32">
        <Link
          href={`/${locale}#projects`}
          className="group inline-flex min-h-11 items-center gap-2 font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft
            size={16}
            aria-hidden="true"
            className="transition-transform duration-200 ease-standard group-hover:-translate-x-1 motion-reduce:transition-none"
          />
          {projects.page.back}
        </Link>

        <MarkPlayed name="projects-page" />
        <header data-reveal="projects-page" className="landing-rise mt-8">
          <h1 className="max-w-[20ch] text-4xl leading-[1.05] font-extrabold tracking-tight text-balance text-ink sm:text-6xl">
            {projects.title}
          </h1>
          <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-ink-muted">{projects.subtitle}</p>
        </header>

        {GROUPS.map((kind) => {
          const items = (projects.items as ProjectItem[]).filter((p) => p.kind === kind);
          if (!items.length) return null;
          const group = projects.groups[kind];
          return (
            <section key={kind} aria-labelledby={`group-${kind}`} className="mt-20 border-t border-line pt-10 lg:mt-24">
              <h2 id={`group-${kind}`} className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                {group.title}
              </h2>
              <p className="mt-3 max-w-[60ch] text-lg leading-relaxed text-ink-muted">{group.description}</p>
              <ul className="mt-12 grid gap-20 lg:gap-28" role="list">
                {items.map((project, i) => (
                  <li key={project.id} id={project.id} className="scroll-mt-28">
                    <ProjectDetail project={project} newTab={projects.newTab} flip={i % 2 === 1} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <div className="mt-24 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-10">
          <p className="text-2xl font-bold tracking-tight text-ink">{projects.page.ctaText}</p>
          <Link href={`/${locale}#contact`} className={cn("group", buttonClasses("primary", "lg"))}>
            {projects.page.cta}
            <ArrowRight aria-hidden="true" className={arrowNudge} />
          </Link>
        </div>
      </div>
    </div>
  );
}
