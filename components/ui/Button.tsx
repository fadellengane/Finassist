"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-accent text-white shadow-soft",
  secondary: "bg-surface2-light text-ink-light dark:bg-surface2-dark dark:text-ink-dark",
  ghost: "bg-transparent text-accent",
  danger: "bg-bad-soft text-bad",
};

export function Button({
  variant = "primary",
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={clsx(
        "flex items-center justify-center gap-2 rounded-pill px-6 py-4 text-[15px] font-normal tracking-wide transition-colors",
        VARIANT_CLASSES[variant],
        fullWidth && "w-full",
        props.disabled && "opacity-40",
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
