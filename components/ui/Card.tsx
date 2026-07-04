import clsx from "clsx";

export function Card({
  children,
  className,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-card border border-line-light bg-surface-light shadow-soft dark:border-line-dark dark:bg-surface-dark dark:shadow-soft-dark",
        padded && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
