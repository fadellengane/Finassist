import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import clsx from "clsx";

const baseClasses =
  "w-full rounded-2xl border border-line-light bg-surface2-light px-4 py-3.5 text-[15px] font-light text-ink-light outline-none transition-colors focus:border-accent dark:border-line-dark dark:bg-surface2-dark dark:text-ink-dark";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-5 block">
      <span className="mb-2 block text-xs font-normal tracking-wide text-muted-light dark:text-muted-dark">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(baseClasses, className)} />;
}

export function Select({
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={clsx(baseClasses, className)}>
      {children}
    </select>
  );
}
