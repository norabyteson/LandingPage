import Reveal from "@/components/ui/Reveal";

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  short?: string;
}

interface ProcessSectionProps {
  dict: {
    process: {
      badge: string;
      title: string;
      subtitle: string;
      steps: ProcessStep[];
    };
  };
}

/**
 * El proceso en orden de lectura: seis pasos en cuadrícula. Cada paso aparece escalonado y
 * su línea superior se llena de izquierda a derecha, como un avance.
 */
export default function ProcessSection({ dict }: ProcessSectionProps) {
  const { process } = dict;

  return (
    <section id="process" aria-labelledby="process-title" className="scroll-mt-20 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal name="process-header">
          <h2
            id="process-title"
            className="text-4xl leading-[1.05] font-extrabold tracking-tight text-balance text-ink sm:text-5xl"
          >
            {process.title}
          </h2>
          <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-ink-muted">{process.subtitle}</p>
        </Reveal>

        <ol className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {process.steps.map((step, i) => (
            <li key={step.number}>
              <Reveal name={`process-${i}`} delay={(i % 3) * 110}>
                <div aria-hidden="true" className="relative h-0.5 overflow-hidden rounded-full bg-line">
                  <div className="reveal-detail absolute inset-0 origin-left scale-x-0 bg-brand transition-transform delay-300 duration-[900ms] ease-standard group-data-[shown=true]/reveal:scale-x-100 motion-reduce:scale-x-100 motion-reduce:transition-none" />
                </div>
                {/* El número es decorativo (la lista ya está ordenada); la etiqueta va aparte. */}
                <p className="mt-5 flex items-baseline gap-3 text-sm">
                  <span aria-hidden="true" className="font-mono font-semibold text-brand-ink">
                    {step.number.padStart(2, "0")}
                  </span>
                  {step.short ? <span className="text-ink-subtle">{step.short}</span> : null}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-ink">{step.title}</h3>
                <p className="mt-2 max-w-[38ch] leading-relaxed text-ink-muted">{step.description}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
