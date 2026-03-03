import { getDictionary, isValidLocale, defaultLocale } from "@/lib/i18n";
import type { Locale } from "@/types/i18n";
import PageTransition from "@/components/ui/PageTransition";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function PrivacyPage({ params }: PageProps) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : defaultLocale;

  const content = {
    es: {
      title: "Aviso de Privacidad",
      lastUpdated: "Última actualización: Febrero 2026",
      back: "Volver al inicio",
      sections: [
        {
          title: "1. Identidad y Domicilio del Responsable",
          body: "NORABYTE, agencia de desarrollo de software con sede en Hermosillo, Sonora, México, es responsable del tratamiento de sus datos personales, del uso que se le dé a los mismos y de su protección."
        },
        {
          title: "2. Datos Personales Recabados",
          body: "Para llevar a cabo las finalidades descritas en el presente aviso de privacidad, recabaremos los siguientes datos personales: Nombre completo, correo electrónico, nombre de la empresa y detalles del proyecto. Estos datos son proporcionados voluntariamente al utilizar nuestro formulario de contacto o cotización."
        },
        {
          title: "3. Finalidad del Tratamiento de Datos",
          body: "Sus datos personales serán utilizados para las siguientes finalidades principales: (a) Proveer información sobre nuestros servicios de desarrollo de software. (b) Elaborar propuestas y cotizaciones personalizadas. (c) Dar seguimiento a sus solicitudes de contacto. (d) Comunicar actualizaciones relevantes sobre sus proyectos."
        },
        {
          title: "4. Protección y Seguridad",
          body: "Implementamos las medidas de seguridad técnicas, administrativas y físicas necesarias para proteger sus datos personales de daño, pérdida, alteración, destrucción o el uso, acceso o tratamiento no autorizado."
        },
        {
          title: "5. Derechos ARCO",
          body: "Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición). Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva a través de nuestro correo: contacto@norabyte.com."
        },
        {
          title: "6. Cambios al Aviso de Privacidad",
          body: "El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales, de nuestras propias necesidades por los servicios que ofrecemos o de nuestras prácticas de privacidad. Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir este aviso de privacidad, a través de nuestro sitio web."
        }
      ]
    },
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: February 2026",
      back: "Back to Home",
      sections: [
        {
          title: "1. Identity and Address of the Controller",
          body: "NORABYTE, a software development agency based in Hermosillo, Sonora, Mexico, is responsible for the processing of your personal data, its use, and its protection."
        },
        {
          title: "2. Personal Data Collected",
          body: "To carry out the purposes described in this privacy policy, we will collect the following personal data: Full name, email, company name, and project details. This data is voluntarily provided when using our contact or quote form."
        },
        {
          title: "3. Purpose of Data Processing",
          body: "Your personal data will be used for the following main purposes: (a) Providing information about our software development services. (b) Preparing custom proposals and quotes. (c) Following up on your contact requests. (d) Communicating relevant updates about your projects."
        },
        {
          title: "4. Protection and Security",
          body: "We implement the necessary technical, administrative, and physical security measures to protect your personal data against damage, loss, alteration, destruction, or unauthorized use, access, or treatment."
        },
        {
          title: "5. User Rights",
          body: "You have the right to know what personal data we have about you, what we use it for, and the conditions of use (Access). Likewise, it is your right to request the correction of your personal information if it is outdated, inaccurate, or incomplete (Rectification); that we delete it from our records or databases (Cancellation); as well as object to the use of your personal data for specific purposes (Opposition). You can exercise these rights by contacting us at: contacto@norabyte.com."
        },
        {
          title: "6. Changes to the Privacy Policy",
          body: "This privacy policy may undergo modifications, changes, or updates derived from new legal requirements, our own needs for the services we offer, or our privacy practices. We commit to keeping you informed about the changes that this privacy policy may undergo, through our website."
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
