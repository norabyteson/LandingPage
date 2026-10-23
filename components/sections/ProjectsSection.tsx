import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { SCREENSHOTS, hostOf, type ProjectItem } from "@/components/projects/ProjectDetail";
import { arrowNudge, buttonClasses } from "@/lib/ui";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/i18n";

interface ProjectsSectionProps {
  dict: {
    projects: {
      title: string;
      subtitle: string;
      viewAll: string;
      kinds: Record<string, string>;
      items: ProjectItem[];
    };
  };
  lang: Locale;
}

/**
 * Vista previa en la landing: una captura y una línea por proyecto o demo. El detalle vive en
 * /{lang}/projects (app/(site)/[lang]/projects), adonde lleva cada elemento.
 */
export default function ProjectsSection({ dict, lang }: ProjectsSectionProps) {
  const { projects } = dict;
  const pageHref = `/${lang}/projects`;

  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-20 bg-canvas">
      <div className="mx-auto max-w-7xl border-t border-line px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal name="projects-header" className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div>
            <h2
              id="projects-title"
              className="max-w-[20ch] text-4xl leading-[1.05] font-extrabold tracking-tight text-balance text-ink sm:text-5xl"
            >
              {projects.title}
            </h2>
            <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-ink-muted">{projects.subtitle}</p>
          </div>
          <Link href={pageHref} className={cn("group", buttonClasses("secondary", "lg"))}>
            {projects.viewAll}
            <ArrowRight aria-hidden="true" className={arrowNudge} />
          </Link>
        </Reveal>

        <ul className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3" role="list">
          {projects.items.map((project, i) => (
            <li key={project.id}>
              <Reveal name={`projects-${project.id}`} delay={(i % 3) * 110}>
                <Link href={`${pageHref}#${project.id}`} className="group block">
                  <span className="relative block aspect-[16/10] overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
                    <Image
                      src={SCREENSHOTS[project.id] ?? ""}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover object-top transition-transform duration-700 ease-standard group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                  </span>
                  <span className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                    <span className="font-semibold text-brand-ink">{projects.kinds[project.kind]}</span>
                    <span aria-hidden="true" className="text-ink-subtle">
                      ·
                    </span>
                    <span className="font-mono text-ink-subtle">{hostOf(project.url)}</span>
                  </span>
                  <span className="mt-2 block text-2xl font-bold tracking-tight text-ink transition-colors group-hover:text-brand-ink">
                    {project.name}
                  </span>
                  <span className="mt-2 block max-w-[40ch] leading-relaxed text-ink-muted">{project.summary}</span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
