import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

const baseClasses =
  "w-full rounded-2xl border border-line-light bg-surface2-light px-4 py-3.5 text-[15px] text-ink-light outline-none transition-colors focus:border-accent dark:border-line-dark dark:bg-surface2-dark dark:text-ink-dark";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-xs font-medium text-muted-light dark:text-muted-dark">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={baseClasses} />;
}

export function Select({
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={baseClasses}>
      {children}
    </select>
  );
}
