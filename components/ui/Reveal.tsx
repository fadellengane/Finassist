"use client";

import { motion } from "framer-motion";

/**
 * Fait apparaître son contenu en fondu + léger décalage vertical, avec un
 * délai proportionnel à `index`. Utilisé pour donner un effet de liste
 * "en cascade" (transactions, mois de prévision, objectifs...) sans dupliquer
 * la même animation partout.
 */
export function Reveal({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
