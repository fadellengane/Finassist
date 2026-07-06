"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Transaction } from "@/lib/types";
import { getTransactionsForMonth } from "@/lib/finance/engine";
import { CATEGORY_META } from "@/lib/finance/categories";
import { monthLabel, todayISO } from "@/lib/utils/format";
import { DayDetailSheet } from "@/components/previsions/DayDetailSheet";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

export function CalendarView({ transactions }: { transactions: Transaction[] }) {
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const occurrences = useMemo(
    () => getTransactionsForMonth(transactions, displayedMonth),
    [transactions, displayedMonth]
  );

  // Pour chaque jour, jusqu'à 3 couleurs de catégorie distinctes à afficher en pastilles.
  const eventsByDay = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const { transaction, occurrenceDate } of occurrences) {
      const color = CATEGORY_META[transaction.category].color;
      const list = map.get(occurrenceDate) ?? [];
      if (!list.includes(color)) list.push(color);
      map.set(occurrenceDate, list);
    }
    return map;
  }, [occurrences]);

  const today = todayISO();
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7; // lundi = premier jour

  const cells: (string | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return d.toISOString().slice(0, 10);
    }),
  ];

  function changeMonth(delta: number) {
    setDisplayedMonth(new Date(year, month + delta, 1));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between px-1">
        <button
          onClick={() => changeMonth(-1)}
          className="rounded-full p-2 text-muted-light dark:text-muted-dark"
          aria-label="Mois précédent"
        >
          <ChevronLeft size={18} strokeWidth={1.75} />
        </button>
        <p className="text-sm font-normal">{monthLabel(displayedMonth)}</p>
        <button
          onClick={() => changeMonth(1)}
          className="rounded-full p-2 text-muted-light dark:text-muted-dark"
          aria-label="Mois suivant"
        >
          <ChevronRight size={18} strokeWidth={1.75} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="text-[11px] font-light text-muted-light dark:text-muted-dark">
            {w}
          </span>
        ))}

        {cells.map((dateISO, i) => {
          if (!dateISO) return <div key={`blank-${i}`} />;
          const colors = eventsByDay.get(dateISO);
          const isToday = dateISO === today;

          return (
            <motion.button
              key={dateISO}
              whileTap={{ scale: 0.92 }}
              onClick={() => setSelectedDay(dateISO)}
              className={`mx-auto flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-2xl text-sm transition-colors ${
                isToday
                  ? "bg-accent font-medium text-white"
                  : "text-ink-light hover:bg-surface2-light dark:text-ink-dark dark:hover:bg-surface2-dark"
              }`}
            >
              <span>{parseInt(dateISO.slice(8, 10), 10)}</span>
              {colors && colors.length > 0 && (
                <span className="flex gap-0.5">
                  {colors.slice(0, 3).map((c) => (
                    <span
                      key={c}
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: isToday ? "rgba(255,255,255,0.85)" : c }}
                    />
                  ))}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <DayDetailSheet date={selectedDay} occurrences={occurrences} onClose={() => setSelectedDay(null)} />
    </div>
  );
}
