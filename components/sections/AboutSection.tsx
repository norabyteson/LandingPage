import Reveal from "@/components/ui/Reveal";

interface AboutSectionProps {
  dict: {
    about: {
      badge: string;
      title: string;
      description: string;
    };
  };
}

/** Quiénes somos: una frase grande y el texto debajo, con aire. Sin imagen de relleno. */
export default function AboutSection({ dict }: AboutSectionProps) {
  const { about } = dict;

  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-20 bg-canvas">
      <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <Reveal name="about-title">
          <p className="text-sm font-semibold text-brand-ink">{about.badge}</p>
          <h2
            id="about-title"
            className="mt-4 max-w-[22ch] text-4xl leading-[1.08] font-extrabold tracking-tight text-balance text-ink sm:text-5xl"
          >
            {about.title}
          </h2>
        </Reveal>
        <Reveal name="about-text" delay={120}>
          <p className="mt-8 max-w-[62ch] border-l-4 border-brand pl-6 text-xl leading-relaxed text-ink-muted">
            {about.description}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
