"use client";

import { useState } from "react";
import { Moon, Sun, Smartphone } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useFinanceStore } from "@/lib/store";
import { Sheet } from "@/components/ui/Sheet";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { startingBalance, startingBalanceDate, setStartingBalance, setOnboardingSeen } = useFinanceStore();

  const [amount, setAmount] = useState(String(startingBalance));
  const [date, setDate] = useState(startingBalanceDate);

  function handleSave() {
    const value = parseFloat(amount.replace(",", "."));
    if (!isNaN(value)) setStartingBalance(value, date);
    onClose();
  }

  function handleReplayTutorial() {
    setOnboardingSeen(false);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Réglages">
      <div className="mb-6 flex items-center justify-between rounded-2xl bg-surface2-light p-4 dark:bg-surface2-dark">
        <div className="flex items-center gap-2 text-sm font-light">
          {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
          Mode {theme === "dark" ? "sombre" : "clair"}
        </div>
        <button
          onClick={toggleTheme}
          className={`relative h-7 w-12 rounded-pill transition-colors ${
            theme === "dark" ? "bg-accent" : "bg-surface-light dark:bg-surface-dark"
          }`}
          aria-label="Changer de thème"
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-soft transition-transform ${
              theme === "dark" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <Field label="Solde de référence (€)">
        <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Field label="Valable à partir du">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <p className="mb-6 text-xs font-light text-muted-light dark:text-muted-dark">
        C&rsquo;est le solde réel de ton compte à cette date. Toutes les prévisions sont
        recalculées à partir de cette référence.
      </p>

      <button
        onClick={handleReplayTutorial}
        className="mb-6 flex w-full items-center justify-between rounded-2xl bg-surface2-light p-4 text-left dark:bg-surface2-dark"
      >
        <div className="flex items-center gap-2 text-sm font-light">
          <Smartphone size={16} />
          Revoir le tutoriel d&rsquo;installation
        </div>
      </button>

      <Button fullWidth onClick={handleSave}>
        Enregistrer
      </Button>
    </Sheet>
  );
}
