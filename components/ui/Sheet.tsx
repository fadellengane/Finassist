"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-[32px] border-t border-line-light bg-surface-light p-7 pb-10 shadow-soft dark:border-line-dark dark:bg-surface-dark dark:shadow-soft-dark safe-bottom"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="mx-auto mb-6 h-1 w-10 rounded-pill bg-surface2-light dark:bg-surface2-dark" />
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-medium tracking-tight">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-full bg-surface2-light p-2 text-muted-light dark:bg-surface2-dark dark:text-muted-dark"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
