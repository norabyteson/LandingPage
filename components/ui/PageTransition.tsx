"use client";

import { motion } from "framer-motion";

/**
 * PageTransition
 * Envuelve el contenido de la página con una animación de fade+slide suave.
 * Se usa en app/[lang]/page.tsx para que el cambio de idioma se vea fluido.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
}
