"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, CalendarRange, Target } from "lucide-react";
import clsx from "clsx";

const TABS = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/previsions", label: "Prévisions", icon: CalendarRange },
  { href: "/epargne", label: "Épargne", icon: Target },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md safe-bottom">
      <div className="mx-4 mb-3 flex items-center justify-between rounded-pill border border-line-light bg-surface-light/80 px-2 py-2 shadow-soft backdrop-blur-xl dark:border-line-dark dark:bg-surface-dark/80 dark:shadow-soft-dark">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-1 flex-col items-center gap-1 rounded-pill py-2 transition-colors duration-200",
                active ? "text-accent" : "text-muted-light dark:text-muted-dark"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
