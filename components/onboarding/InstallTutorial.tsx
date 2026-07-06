"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share, MoreVertical, PlusSquare, CheckCircle2, Smartphone } from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function isAlreadyInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

interface Step {
  icon: typeof Share;
  title: string;
  detail: string;
}

const STEPS_BY_PLATFORM: Record<Exclude<Platform, "other">, Step[]> = {
  ios: [
    { icon: Share, title: "Appuie sur Partager", detail: "L'icône en bas de Safari (un carré avec une flèche)." },
    { icon: PlusSquare, title: "Ajouter à l'écran d'accueil", detail: "Fais défiler le menu et sélectionne cette option." },
    { icon: CheckCircle2, title: "Valide", detail: "FinAssist apparaît sur ton écran d'accueil, comme une vraie app." },
  ],
  android: [
    { icon: MoreVertical, title: "Ouvre le menu du navigateur", detail: "Les trois points en haut à droite de Chrome." },
    { icon: PlusSquare, title: "Installer l'application", detail: "Ou « Ajouter à l'écran d'accueil » selon ton navigateur." },
    { icon: CheckCircle2, title: "Valide", detail: "FinAssist apparaît sur ton écran d'accueil, comme une vraie app." },
  ],
};

export function InstallTutorial() {
  const { hasHydrated, onboardingSeen, setOnboardingSeen } = useFinanceStore();
  const [step, setStep] = useState(0);
  const platform = useMemo(detectPlatform, []);
  const installed = useMemo(isAlreadyInstalled, []);

  const shouldShow = hasHydrated && !onboardingSeen && !installed && platform !== "other";
  const steps = platform === "other" ? [] : STEPS_BY_PLATFORM[platform];

  function finish() {
    setOnboardingSeen(true);
  }

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col bg-canvas-light px-7 pb-10 pt-14 dark:bg-canvas-dark safe-top safe-bottom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-10 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Smartphone size={26} strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="mb-2 text-center text-xl font-medium tracking-tight">
            Installe FinAssist sur ton écran d&rsquo;accueil
          </h1>
          <p className="mb-10 text-center text-sm font-light text-muted-light dark:text-muted-dark">
            Accède-y en un geste, comme une vraie application.
          </p>

          <div className="flex-1 space-y-4">
            <AnimatePresence mode="wait">
              {steps.map((s, i) =>
                i === step ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="rounded-card border border-line-light bg-surface-light p-7 text-center shadow-soft dark:border-line-dark dark:bg-surface-dark dark:shadow-soft-dark"
                  >
                    <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <s.icon size={22} strokeWidth={1.5} />
                    </div>
                    <p className="mb-1.5 text-[15px] font-normal">{s.title}</p>
                    <p className="text-sm font-light text-muted-light dark:text-muted-dark">{s.detail}</p>
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>

            <div className="flex justify-center gap-1.5 pt-2">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-pill transition-all duration-300 ${
                    i === step ? "w-5 bg-accent" : "w-1.5 bg-surface2-light dark:bg-surface2-dark"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <button
              onClick={finish}
              className="flex-1 py-3 text-sm font-light text-muted-light dark:text-muted-dark"
            >
              Passer
            </button>
            <Button
              fullWidth
              className="flex-[2]"
              onClick={() => (step < steps.length - 1 ? setStep(step + 1) : finish())}
            >
              {step < steps.length - 1 ? "Suivant" : "Terminer"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
