import Reveal from "@/components/ui/Reveal";

interface ValueItem {
  title: string;
  description: string;
}

interface ValuePropsSectionProps {
  dict: {
    valueProps: {
      badge: string;
      title: string;
      subtitle: string;
      items: ValueItem[];
    };
  };
}

/** Por qué NORABYTE: cada razón como una afirmación grande y su explicación al lado. */
export default function ValuePropsSection({ dict }: ValuePropsSectionProps) {
  const { valueProps } = dict;

  return (
    <section id="why-norabyte" aria-labelledby="why-norabyte-title" className="scroll-mt-20 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal name="why-header">
          <h2
            id="why-norabyte-title"
            className="max-w-[20ch] text-4xl leading-[1.05] font-extrabold tracking-tight text-balance text-ink sm:text-5xl"
          >
            {valueProps.title}
          </h2>
          {valueProps.subtitle?.trim() ? (
            <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-ink-muted">{valueProps.subtitle}</p>
          ) : null}
        </Reveal>

        <ul className="mt-14 divide-y divide-line border-y border-line" role="list">
          {valueProps.items.map((item, i) => (
            <li key={item.title}>
              <Reveal
                name={`why-${i}`}
                delay={i * 90}
                className="grid gap-3 py-9 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-baseline md:gap-12"
              >
                <h3 className="text-2xl leading-tight font-bold tracking-tight text-ink sm:text-3xl">{item.title}</h3>
                <p className="max-w-[52ch] text-lg leading-relaxed text-ink-muted">{item.description}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
