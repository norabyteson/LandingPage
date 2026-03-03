import { getDictionary, isValidLocale, defaultLocale } from "@/lib/i18n";
import type { Locale } from "@/types/i18n";
import PageTransition from "@/components/ui/PageTransition";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function TermsPage({ params }: PageProps) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : defaultLocale;

  const content = {
    es: {
      title: "Términos de Uso",
      lastUpdated: "Última actualización: Febrero 2026",
      back: "Volver al inicio",
      sections: [
        {
          title: "1. Aceptación de los Términos",
          body: "Al acceder y utilizar el sitio web de NORABYTE, agencia de desarrollo de software en Hermosillo, Sonora, México, usted acepta estar sujeto a estos Términos de Uso y a todas las leyes y regulaciones aplicables."
        },
        {
          title: "2. Propiedad Intelectual",
          body: "Todo el contenido, diseño, código y material visual en este sitio es propiedad exclusiva de NORABYTE. Respecto a los proyectos de desarrollo realizados para clientes, la propiedad intelectual del código final, diseños y activos será transferida al cliente una vez liquidado el 100% del pago acordado, salvo acuerdo en contrario."
        },
        {
          title: "3. Prestación de Servicios",
          body: "Nos esforzamos por ofrecer servicios de alta calidad. Cualquier cronograma y estimación de costos es de buena fe pero puede estar sujeto a cambios debido a solicitudes adicionales, cambios en el alcance del proyecto o demoras en la entrega de materiales de su parte."
        },
        {
          title: "4. Uso del Sitio Web",
          body: "Usted se compromete a no utilizar nuestro sitio web para fines ilícitos o prohibidos. No se permite intentar obtener acceso no autorizado a los sistemas o redes conectados a nuestro sitio."
        },
        {
          title: "5. Limitación de Responsabilidad",
          body: "Bajo ninguna circunstancia NORABYTE será responsable de ningún daño directo, indirecto, incidental, especial o consecuente que resulte del uso o la incapacidad de usar nuestros servicios, o del rendimiento del software desarrollado tras el periodo de garantía técnica acordado."
        },
        {
          title: "6. Modificaciones de los Términos",
          body: "NORABYTE se reserva el derecho de revisar y cambiar estos Términos de Uso en cualquier momento sin previo aviso. Al usar este sitio web, usted acepta estar sujeto a la versión actual de estos Términos de Uso."
        },
        {
          title: "7. Ley Aplicable",
          body: "Cualquier reclamo relacionado con el sitio web o servicios de NORABYTE se regirá por las leyes del Estado de Sonora, México, sin considerar sus disposiciones sobre conflictos de leyes."
        }
      ]
    },
    en: {
      title: "Terms of Use",
      lastUpdated: "Last updated: February 2026",
      back: "Back to Home",
      sections: [
        {
          title: "1. Acceptance of Terms",
          body: "By accessing and using the website of NORABYTE, a software development agency in Hermosillo, Sonora, Mexico, you agree to be bound by these Terms of Use and all applicable laws and regulations."
        },
        {
          title: "2. Intellectual Property",
          body: "All content, design, code, and visual material on this site is the exclusive property of NORABYTE. Regarding development projects for clients, the intellectual property of the final code, designs, and assets will be transferred to the client once 100% of the agreed payment has been settled, unless otherwise agreed."
        },
        {
          title: "3. Provision of Services",
          body: "We strive to provide high-quality services. Any timelines and cost estimates are made in good faith but may be subject to change due to additional requests, changes in project scope, or delays in material delivery from your side."
        },
        {
          title: "4. Website Usage",
          body: "You agree not to use our website for any unlawful or prohibited purposes. You may not attempt to gain unauthorized access to any of the systems or networks connected to our site."
        },
        {
          title: "5. Limitation of Liability",
          body: "Under no circumstances shall NORABYTE be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services, or from the performance of the developed software after the agreed technical warranty period."
        },
        {
          title: "6. Modifications of Terms",
          body: "NORABYTE reserves the right to revise and change these Terms of Use at any time without notice. By using this website, you are agreeing to be bound by the then current version of these Terms of Use."
        },
        {
          title: "7. Governing Law",
          body: "Any claim relating to NORABYTE's website or services shall be governed by the laws of the State of Sonora, Mexico without regard to its conflict of law provisions."
        }
      ]
    }
  };

  const t = content[locale];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--nb-dark)] pt-32 pb-20 relative px-4 sm:px-6 lg:px-8">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[var(--nb-primary)]/10 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/3 h-[500px] bg-[var(--nb-primary)]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-[var(--nb-light)]/60 hover:text-[var(--nb-primary)] transition-colors mb-10 group text-sm font-medium"
          >
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            {t.back}
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--nb-light)] tracking-tight mb-4">
              {t.title}
            </h1>
            <p className="text-[var(--nb-light)]/50 text-sm">
              {t.lastUpdated}
            </p>
          </div>

          <div className="space-y-10">
            {t.sections.map((section, idx) => (
              <section key={idx} className="glass-card p-8 rounded-2xl border border-[var(--nb-light)]/5">
                <h2 className="text-xl font-semibold text-[var(--nb-light)] mb-4">
                  {section.title}
                </h2>
                <p className="text-[var(--nb-light)]/70 leading-relaxed text-sm md:text-base">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-16 text-[var(--nb-light)]/40 text-sm text-center">
            © {new Date().getFullYear()} NORABYTE.
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
