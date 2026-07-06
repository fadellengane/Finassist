"use client";

import { useState } from "react";
import { AlertTriangle, Bell, CalendarClock, PiggyBank, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet } from "@/components/ui/Sheet";
import type { Reminder, ReminderType } from "@/lib/types";
import { canNotify, requestNotificationPermission } from "@/lib/notifications";

const ICONS: Record<ReminderType, typeof Bell> = {
  abonnement: RefreshCw,
  echeance: CalendarClock,
  risque: AlertTriangle,
  epargne_stagnante: PiggyBank,
};

const SEVERITY_STYLES = {
  info: { bg: "bg-accent-soft", text: "text-accent" },
  warning: { bg: "bg-warn-soft", text: "text-warn" },
  danger: { bg: "bg-bad-soft", text: "text-bad" },
} as const;

export function ReminderSheet({
  open,
  onClose,
  reminders,
}: {
  open: boolean;
  onClose: () => void;
  reminders: Reminder[];
}) {
  const [notifStatus, setNotifStatus] = useState<"idle" | "granted" | "denied">(
    canNotify() ? "granted" : "idle"
  );

  async function handleEnableNotifications() {
    const permission = await requestNotificationPermission();
    setNotifStatus(permission === "granted" ? "granted" : "denied");
  }

  return (
    <Sheet open={open} onClose={onClose} title="Rappels">
      {notifStatus !== "granted" && (
        <button
          onClick={handleEnableNotifications}
          className="mb-5 flex w-full items-center justify-between rounded-2xl bg-surface2-light px-4 py-3.5 text-left dark:bg-surface2-dark"
        >
          <div>
            <p className="text-sm font-normal">Activer les notifications</p>
            <p className="text-xs font-light text-muted-light dark:text-muted-dark">
              Reçois ces rappels même sans ouvrir l&rsquo;app
            </p>
          </div>
          <Bell size={18} className="shrink-0 text-accent" />
        </button>
      )}

      {reminders.length === 0 ? (
        <p className="py-8 text-center text-sm font-light text-muted-light dark:text-muted-dark">
          Rien à signaler pour l&rsquo;instant.
        </p>
      ) : (
        <div className="max-h-[55vh] space-y-2.5 overflow-y-auto">
          {reminders.map((reminder, i) => {
            const Icon = ICONS[reminder.type];
            const style = SEVERITY_STYLES[reminder.severity];
            return (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: "easeOut" }}
                className="flex items-start gap-3 rounded-2xl bg-surface2-light p-4 dark:bg-surface2-dark"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.bg} ${style.text}`}>
                  <Icon size={15} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-normal leading-snug">{reminder.title}</p>
                  <p className="mt-0.5 text-xs font-light text-muted-light dark:text-muted-dark">
                    {reminder.detail}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Sheet>
  );
}
