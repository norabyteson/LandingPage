import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { buttonClasses } from "@/lib/ui";
import { cn } from "@/lib/utils";

/** Un proyecto o demo de `projects.items` en los archivos de idioma. `kind`: "project" o "demo". */
export interface ProjectItem {
  id: string;
  kind: string;
  name: string;
  tag: string;
  summary: string;
  description: string;
  points: string[];
  cta: string;
  url: string;
}

/** Capturas en public/projects/ (1440×900), una por id de proyecto. */
export const SCREENSHOTS: Record<string, string> = {
  norhud: "/projects/norhud.webp",
  "erp-obra": "/projects/erp-obra.webp",
  auxia: "/projects/auxia.webp",
};

export const hostOf = (url: string) => new URL(url).host;

/**
 * Ficha completa de un proyecto: captura, qué resuelve, puntos clave y enlace al sitio en vivo
 * (pestaña nueva; NorHud y Auxia no se dejan mostrar dentro de otra página). `flip` pone la captura a la derecha.
 */
export default function ProjectDetail({ project, newTab, flip }: { project: ProjectItem; newTab: string; flip: boolean }) {
  return (
    <Reveal
      name={`project-${project.id}`}
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
          flip && "lg:order-2"
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
          <span aria-hidden="true" className="text-ink-subtle">
            ·
          </span>
          <span className="font-mono text-ink-subtle">{hostOf(project.url)}</span>
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
          <span className="sr-only"> ({newTab})</span>
          <ArrowUpRight
            aria-hidden="true"
            className="transition-transform duration-200 ease-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
          />
        </a>
      </div>
    </Reveal>
  );
}
