"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  User,
  Building,
  MessageSquare,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import SectionBadge from "@/components/ui/SectionBadge";
import AnimatedSection from "@/components/ui/AnimatedSection";
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

/* ---- Campo con ícono ---- */
function FieldWrapper({
  label,
  error,
  required,
  icon: Icon,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 relative">
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/60">
        <Icon size={12} aria-hidden="true" className="text-[var(--nb-primary)]" />
        {label}
        {required && (
          <span className="text-[var(--nb-primary)] ml-0.5" aria-hidden="true">*</span>
        )}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 4 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 text-[#f87171] font-medium text-xs overflow-hidden"
            role="alert"
          >
            <AlertCircle size={12} aria-hidden="true" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContactSection({ dict }: ContactSectionProps) {
  const { contact } = dict;
  const [status, setStatus] = useState<FormStatus>("idle");

  const schema = createSchema({
    nameMin: "Al menos 2 caracteres",
    emailInvalid: "Correo electrónico inválido",
    serviceRequired: "Selecciona un tipo de proyecto",
    messageMin: "Al menos 20 caracteres",
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
    { icon: Mail,  label: contact.info.email,        href: `mailto:${contact.info.email}` },
    { icon: Phone, label: contact.info.phone,         href: `tel:${contact.info.phone.replace(/\s/g, "")}` },
    { icon: MapPin, label: contact.info.location,     href: null },
    { icon: Clock, label: contact.info.availability,  href: null },
  ];

  // Estilo unificado y OSCURO INCONDICIONAL para resolver bugs de contraste
  const inputClass = "w-full bg-black/20 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[var(--nb-primary)] transition-colors shadow-sm";

  return (
    <section
      id="contact"
      className="section-padding relative overflow-hidden bg-[#161413]"
      aria-labelledby="contact-title"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Cabecera */}
        <div className="flex flex-col items-center text-center mb-16 gap-5">
          <SectionBadge className="text-white/60 before:bg-white/20">{contact.badge}</SectionBadge>
          <AnimatedSection delay={0.1}>
            <h2 id="contact-title" className="heading-lg text-white max-w-2xl">
              {contact.title}
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-white/60 text-lg max-w-lg leading-relaxed">
              {contact.subtitle}
            </p>
          </AnimatedSection>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-stretch">

          {/* ---- Panel de información ---- */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:col-span-2 flex flex-col gap-5 h-full"
            aria-label="Información de contacto"
          >
            {infoItems.map(({ icon: Icon, label, href }) => (
              <div
                key={label}
                className="bg-[#1A1817] rounded-2xl px-5 py-4 border border-white/10 flex items-center gap-5 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--nb-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-[var(--nb-primary)]" aria-hidden="true" />
                </div>
                {href ? (
                  <a
                    href={href}
                    className="text-white font-medium hover:text-[var(--nb-primary-light)] transition-colors duration-200"
                  >
                    {label}
                  </a>
                ) : (
                  <span className="text-white font-medium">{label}</span>
                )}
              </div>
            ))}

            {/* Trust badge */}
            <div className="rounded-2xl p-6 border border-[var(--nb-primary)]/20 flex gap-4 bg-[var(--nb-primary)]/5 mt-auto">
              <Sparkles size={20} className="text-[var(--nb-primary-light)] flex-shrink-0 mt-1" aria-hidden="true" />
              <div>
                <p className="text-white font-bold mb-1.5">
                  Respuesta en menos de 24 h
                </p>
                <p className="text-white/70 text-sm leading-relaxed">
                  Sin compromisos. Te enviamos una propuesta clara y personalizada a tu correo electrónico.
                </p>
              </div>
            </div>
          </motion.aside>

          {/* ---- Formulario ---- */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:col-span-3"
          >
            <div className="bg-[#1A1817] rounded-2xl border border-white/10 shadow-lg relative">

              {/* Header del formulario */}
              <div className="px-8 py-5 flex items-center justify-between rounded-t-2xl bg-white/5 border-b border-white/10">
                <div>
                  <p className="text-white font-bold text-sm">Nueva solicitud de proyecto</p>
                  <p className="text-white/60 text-xs mt-1">Todos los campos marcados con * son obligatorios</p>
                </div>
                <div className="flex gap-1.5" aria-hidden="true">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
              </div>

              {/* Cuerpo del formulario */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {/* ---- Estado éxito ---- */}
                  {status === "success" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center justify-center text-center gap-6 py-12"
                      role="status"
                      aria-live="polite"
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
                        className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center"
                      >
                        <CheckCircle2 size={36} className="text-green-400" aria-hidden="true" />
                      </motion.div>
                      <div>
                        <h3 className="text-white font-bold text-2xl mb-3">
                          {contact.form.successTitle}
                        </h3>
                        <p className="text-white/70 text-base max-w-sm mx-auto">
                          {contact.form.successMessage}
                        </p>
                      </div>
                      <button
                        onClick={() => setStatus("idle")}
                        className="text-[var(--nb-primary-light)] font-medium hover:underline text-sm mt-4"
                      >
                        Enviar otra solicitud
                      </button>
                    </motion.div>

                  ) : (
                    /* ---- Formulario ---- */
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit(onSubmit)}
                      noValidate
                      className="flex flex-col gap-6 relative"
                      aria-label="Formulario de solicitud de proyecto"
                    >

                      {/* Nombre + Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FieldWrapper
                          label={contact.form.name}
                          error={errors.name?.message}
                          icon={User}
                          required
                        >
                          <input
                            {...register("name")}
                            type="text"
                            placeholder={contact.form.namePlaceholder}
                            autoComplete="name"
                            className={cn(inputClass, errors.name && "border-red-500 focus:border-red-500")}
                            aria-invalid={!!errors.name}
                          />
                        </FieldWrapper>

                        <FieldWrapper
                          label={contact.form.email}
                          error={errors.email?.message}
                          icon={Mail}
                          required
                        >
                          <input
                            {...register("email")}
                            type="email"
                            placeholder={contact.form.emailPlaceholder}
                            autoComplete="email"
                            className={cn(inputClass, errors.email && "border-red-500 focus:border-red-500")}
                            aria-invalid={!!errors.email}
                          />
                        </FieldWrapper>
                      </div>

                      {/* Empresa + Servicio */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FieldWrapper
                          label={contact.form.company}
                          error={errors.company?.message}
                          icon={Building}
                        >
                          <input
                            {...register("company")}
                            type="text"
                            placeholder={contact.form.companyPlaceholder}
                            autoComplete="organization"
                            className={cn(inputClass, errors.company && "border-red-500 focus:border-red-500")}
                          />
                        </FieldWrapper>

                        <FieldWrapper
                          label={contact.form.service}
                          error={errors.service?.message}
                          icon={ChevronDown}
                          required
                        >
                          <div className="relative z-50">
                            {/* Input Oculto para validación RHF */}
                            <input type="hidden" {...register("service")} />
                            
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setDropdownOpen(!dropdownOpen);
                              }}
                              className={cn(
                                inputClass,
                                "flex items-center justify-between text-left",
                                !selectedService && "text-white/40",
                                errors.service && "border-red-500 focus:border-red-500",
                                dropdownOpen && "border-[var(--nb-primary)] ring-2 ring-[var(--nb-primary)]/20"
                              )}
                              aria-haspopup="listbox"
                              aria-expanded={dropdownOpen}
                            >
                              <span className="truncate">
                                {selectedService || contact.form.servicePlaceholder}
                              </span>
                              <ChevronDown
                                size={16}
                                className={cn(
                                  "text-white/60 transition-transform duration-200",
                                  dropdownOpen && "rotate-180 text-[var(--nb-primary-light)]"
                                )}
                                aria-hidden="true"
                              />
                            </button>

                            <AnimatePresence>
                              {dropdownOpen && (
                                <motion.ul
                                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute top-full left-0 w-full mt-2 bg-[#232120] border border-white/10 rounded-xl shadow-[0_15px_50px_-10px_rgba(0,0,0,0.8)] z-[200] overflow-hidden"
                                  role="listbox"
                                >
                                  {contact.form.services.map((svc) => (
                                    <li key={svc} role="option" aria-selected={selectedService === svc}>
                                      <button
                                        type="button"
                                        className={cn(
                                          "w-full text-left px-5 py-3.5 text-sm md:text-base focus:outline-none transition-colors",
                                          selectedService === svc
                                            ? "bg-[var(--nb-primary)]/20 text-[var(--nb-primary-light)] font-semibold"
                                            : "text-white/80 hover:bg-white/5 hover:text-white"
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
                        </FieldWrapper>
                      </div>

                      {/* Mensaje */}
                      <FieldWrapper
                        label={contact.form.message}
                        error={errors.message?.message}
                        icon={MessageSquare}
                        required
                      >
                        <textarea
                          {...register("message")}
                          rows={4}
                          placeholder={contact.form.messagePlaceholder}
                          className={cn(inputClass, "resize-none leading-relaxed", errors.message && "border-red-500 focus:border-red-500")}
                          aria-invalid={!!errors.message}
                        />
                      </FieldWrapper>

                      {/* Error global */}
                      <AnimatePresence initial={false}>
                        {status === "error" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-3 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium overflow-hidden"
                            role="alert"
                            aria-live="assertive"
                          >
                            <AlertCircle size={18} aria-hidden="true" className="flex-shrink-0" />
                            {contact.form.errorMessage}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Botón de envío */}
                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        className={cn(
                          "btn-primary w-full py-4 mt-2 text-base font-semibold shadow-lg shadow-[var(--nb-primary)]/20 rounded-xl",
                          status === "submitting" && "opacity-70 cursor-not-allowed"
                        )}
                        aria-disabled={status === "submitting"}
                      >
                        {status === "submitting" ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 mr-2 inline"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
                              <circle
                                className="opacity-25"
                                cx="12" cy="12" r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            {contact.form.submitting}
                          </>
                        ) : (
                          <>
                            <Send size={18} aria-hidden="true" className="mr-2 inline" />
                            {contact.form.submit}
                          </>
                        )}
                      </button>

                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
