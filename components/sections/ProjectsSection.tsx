import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { buttonClasses } from "@/lib/ui";
import { cn } from "@/lib/utils";

interface ProjectItem {
  id: string;
  name: string;
  tag: string;
  description: string;
  points: string[];
  cta: string;
  url: string;
}

interface ProjectsSectionProps {
  dict: {
    projects: {
      title: string;
      subtitle: string;
      newTab: string;
      items: ProjectItem[];
    };
  };
}

/** Capturas en public/projects/ (1440×900), una por id de proyecto. */
const SCREENSHOTS: Record<string, string> = {
  norhud: "/projects/norhud.webp",
  "erp-obra": "/projects/erp-obra.webp",
  auxia: "/projects/auxia.webp",
};

/**
 * Productos reales, no plantillas: cada uno con su captura, qué resuelve y un enlace al sitio en vivo
 * (pestaña nueva; NorHud y Auxia no se dejan mostrar dentro de otra página). Las capturas alternan de lado.
 */
export default function ProjectsSection({ dict }: ProjectsSectionProps) {
  const { projects } = dict;

  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-20 bg-canvas">
      <div className="mx-auto max-w-7xl border-t border-line px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal name="projects-header">
          <h2
            id="projects-title"
            className="max-w-[20ch] text-4xl leading-[1.05] font-extrabold tracking-tight text-balance text-ink sm:text-5xl"
          >
            {projects.title}
          </h2>
          <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-ink-muted">{projects.subtitle}</p>
        </Reveal>

        <ul className="mt-14 grid gap-20 lg:mt-16 lg:gap-28" role="list">
          {projects.items.map((project, i) => {
            const host = new URL(project.url).host;
            return (
              <li key={project.id}>
                <Reveal
                  name={`projects-${project.id}`}
                  className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14"
                >
                  {/* La captura repite el enlace del botón; se oculta a lectores y al tabulador. */}
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={-1}
                    aria-hidden="true"
                    className={cn(
                      "group relative block aspect-[16/10] overflow-hidden rounded-3xl border border-line bg-surface shadow-lift",
                      i % 2 === 1 && "lg:order-2"
                    )}
                  >
                    <Image
                      src={SCREENSHOTS[project.id] ?? ""}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="object-cover object-top transition-transform duration-700 ease-standard group-hover:scale-[1.02] motion-reduce:transition-none"
                    />
                  </a>

                  <div className="min-w-0">
                    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                      <span className="font-semibold text-brand-ink">{project.tag}</span>
                      <span className="font-mono text-ink-subtle">{host}</span>
                    </p>
                    <h3 className="mt-3 text-3xl leading-tight font-bold tracking-tight text-ink">{project.name}</h3>
                    <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink-muted">{project.description}</p>
                    <ul className="mt-6" role="list">
                      {project.points.map((point) => (
                        <li key={point} className="border-t border-line py-3 font-medium text-ink">
                          {point}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn("group mt-6", buttonClasses("secondary", "lg"))}
                    >
                      {project.cta}
                      <span className="sr-only"> ({projects.newTab})</span>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="transition-transform duration-200 ease-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                      />
                    </a>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
