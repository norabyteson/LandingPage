"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, CheckCircle2, AlertCircle, Send, ChevronDown, LoaderCircle } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { buttonClasses } from "@/lib/ui";
import { cn } from "@/lib/utils";

const createSchema = (t: Record<string, string>) =>
  z.object({
    name: z.string().min(2, t.nameMin).max(80),
    email: z.string().email(t.emailInvalid),
    company: z.string().max(100).optional(),
    service: z.string().min(1, t.serviceRequired),
    message: z.string().min(20, t.messageMin).max(2000),
  });

type FormValues = {
  name: string;
  email: string;
  company?: string;
  service: string;
  message: string;
};

interface ContactSectionProps {
  dict: {
    contact: {
      badge: string;
      title: string;
      subtitle: string;
      trustTitle: string;
      trustBody: string;
      formHeaderTitle: string;
      formHeaderHint: string;
      sendAnother: string;
      contactInfoAria: string;
      formAriaLabel: string;
      whatsapp: {
        href: string;
        shortLabel: string;
        ctaLabel: string;
      };
      validation: {
        nameMin: string;
        emailInvalid: string;
        serviceRequired: string;
        messageMin: string;
      };
      form: {
        name: string;
        namePlaceholder: string;
        email: string;
        emailPlaceholder: string;
        company: string;
        companyPlaceholder: string;
        service: string;
        servicePlaceholder: string;
        message: string;
        messagePlaceholder: string;
        submit: string;
        submitting: string;
        successTitle: string;
        successMessage: string;
        errorTitle: string;
        errorMessage: string;
        services: string[];
      };
      info: {
        email: string;
        phone: string;
        location: string;
        availability: string;
      };
    };
  };
}

type FormStatus = "idle" | "submitting" | "success" | "error";

/* ---- Campo: etiqueta arriba, control, error abajo ---- */
function Field({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {required && (
          <span className="ml-0.5 text-brand-ink" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-1.5 text-sm font-medium text-danger"
            role="alert"
          >
            <AlertCircle size={14} aria-hidden="true" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-line-strong/45 bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-subtle transition-[border-color,box-shadow] duration-150 hover:border-line-strong/70 focus:outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 aria-[invalid=true]:border-danger";

export default function ContactSection({ dict }: ContactSectionProps) {
  const { contact } = dict;
  const [status, setStatus] = useState<FormStatus>("idle");

  const schema = createSchema({
    nameMin: contact.validation.nameMin,
    emailInvalid: contact.validation.emailInvalid,
    serviceRequired: contact.validation.serviceRequired,
    messageMin: contact.validation.messageMin,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const selectedService = watch("service");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const service = (e as CustomEvent<{ service: string }>).detail?.service;
      if (service) {
        setValue("service", service, { shouldValidate: true });
        setDropdownOpen(false);
      }
    };
    window.addEventListener("norabyte:prefill-service", handler);
    return () => window.removeEventListener("norabyte:prefill-service", handler);
  }, [setValue]);

  const onSubmit = async (data: FormValues) => {
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Server error");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  const infoItems = [
    { icon: Mail, label: contact.info.email, href: `mailto:${contact.info.email}` },
    { icon: Phone, label: contact.info.phone, href: `tel:${contact.info.phone.replace(/\s/g, "")}` },
    { icon: MapPin, label: contact.info.location, href: null },
  ];

  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20 bg-canvas">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 lg:px-8 lg:py-28">
        {/* ---- Información ---- */}
        <Reveal name="contact-info">
          <aside aria-label={contact.contactInfoAria}>
            <h2
              id="contact-title"
              className="max-w-[18ch] text-4xl leading-[1.05] font-extrabold tracking-tight text-balance text-ink sm:text-5xl"
            >
              {contact.title}
            </h2>
            <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-muted">{contact.subtitle}</p>

            <ul className="mt-10 divide-y divide-line border-y border-line" role="list">
              {infoItems.map(({ icon: Icon, label, href }) => (
                <li key={label} className="flex items-center gap-4 py-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  {href ? (
                    <a href={href} className="font-semibold text-ink transition-colors hover:text-brand-ink">
                      {label}
                    </a>
                  ) : (
                    <span className="font-semibold text-ink">{label}</span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-8 border-l-4 border-brand pl-4">
              <p className="font-bold text-ink">{contact.trustTitle}</p>
              <p className="mt-1 max-w-[44ch] text-ink-muted">{contact.trustBody}</p>
            </div>

            <a
              href={contact.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonClasses("secondary", "lg"), "mt-8")}
            >
              {contact.whatsapp.ctaLabel}
            </a>
          </aside>
        </Reveal>

        {/* ---- Formulario ---- */}
        <Reveal name="contact-form" delay={120}>
          <div className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8 lg:p-10">
            <div className="border-b border-line pb-5">
              <p className="text-lg font-bold text-ink">{contact.formHeaderTitle}</p>
              <p className="mt-1 text-sm text-ink-muted">{contact.formHeaderHint}</p>
            </div>

            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
                  className="flex flex-col items-center gap-5 py-14 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                    className="flex size-16 items-center justify-center rounded-full bg-brand-soft text-success"
                  >
                    <CheckCircle2 size={32} aria-hidden="true" />
                  </motion.span>
                  <div>
                    <h3 className="text-2xl font-bold text-ink">{contact.form.successTitle}</h3>
                    <p className="mx-auto mt-2 max-w-sm text-ink-muted">{contact.form.successMessage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className={buttonClasses("secondary")}
                  >
                    {contact.sendAnother}
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="mt-7 flex flex-col gap-6"
                  aria-label={contact.formAriaLabel}
                >
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Field id="contact-name" label={contact.form.name} error={errors.name?.message} required>
                      <input
                        {...register("name")}
                        id="contact-name"
                        type="text"
                        placeholder={contact.form.namePlaceholder}
                        autoComplete="name"
                        className={inputClass}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "contact-name-error" : undefined}
                      />
                    </Field>

                    <Field id="contact-email" label={contact.form.email} error={errors.email?.message} required>
                      <input
                        {...register("email")}
                        id="contact-email"
                        type="email"
                        placeholder={contact.form.emailPlaceholder}
                        autoComplete="email"
                        className={inputClass}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "contact-email-error" : undefined}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Field id="contact-company" label={contact.form.company} error={errors.company?.message}>
                      <input
                        {...register("company")}
                        id="contact-company"
                        type="text"
                        placeholder={contact.form.companyPlaceholder}
                        autoComplete="organization"
                        className={inputClass}
                      />
                    </Field>

                    <Field id="contact-service" label={contact.form.service} error={errors.service?.message} required>
                      <div className="relative">
                        {/* Input oculto para la validación de react-hook-form */}
                        <input type="hidden" {...register("service")} />
                        <button
                          id="contact-service"
                          type="button"
                          onClick={() => setDropdownOpen((open) => !open)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") setDropdownOpen(false);
                          }}
                          className={cn(
                            inputClass,
                            "flex items-center justify-between gap-2 text-left",
                            !selectedService && "text-ink-subtle",
                            errors.service && "border-danger",
                            dropdownOpen && "border-brand ring-3 ring-brand/20"
                          )}
                          aria-haspopup="listbox"
                          aria-expanded={dropdownOpen}
                          aria-describedby={errors.service ? "contact-service-error" : undefined}
                        >
                          <span className="truncate">{selectedService || contact.form.servicePlaceholder}</span>
                          <ChevronDown
                            size={16}
                            aria-hidden="true"
                            className={cn(
                              "shrink-0 text-ink-subtle transition-transform duration-200",
                              dropdownOpen && "rotate-180"
                            )}
                          />
                        </button>

                        <AnimatePresence>
                          {dropdownOpen && (
                            <motion.ul
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
                              className="absolute top-full left-0 z-20 mt-2 w-full overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-lift"
                              role="listbox"
                              aria-label={contact.form.service}
                            >
                              {contact.form.services.map((svc) => (
                                <li key={svc} role="option" aria-selected={selectedService === svc}>
                                  <button
                                    type="button"
                                    className={cn(
                                      "w-full rounded-lg px-4 py-3 text-left text-base transition-colors",
                                      selectedService === svc
                                        ? "bg-brand-soft font-semibold text-brand-ink"
                                        : "text-ink hover:bg-surface-hover"
                                    )}
                                    onClick={() => {
                                      setValue("service", svc, { shouldValidate: true });
                                      setDropdownOpen(false);
                                    }}
                                  >
                                    {svc}
                                  </button>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    </Field>
                  </div>

                  <Field id="contact-message" label={contact.form.message} error={errors.message?.message} required>
                    <textarea
                      {...register("message")}
                      id="contact-message"
                      rows={5}
                      placeholder={contact.form.messagePlaceholder}
                      className={cn(inputClass, "resize-none leading-relaxed")}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "contact-message-error" : undefined}
                    />
                  </Field>

                  <AnimatePresence initial={false}>
                    {status === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger"
                        role="alert"
                        aria-live="assertive"
                      >
                        <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                        {contact.form.errorMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className={cn(buttonClasses("primary", "lg"), "w-full")}
                  >
                    {status === "submitting" ? (
                      <>
                        <LoaderCircle aria-hidden="true" className="animate-spin" />
                        {contact.form.submitting}
                      </>
                    ) : (
                      <>
                        <Send aria-hidden="true" />
                        {contact.form.submit}
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
