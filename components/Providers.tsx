"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useFinanceStore } from "@/lib/store";
import { InstallTutorial } from "@/components/onboarding/InstallTutorial";

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    useFinanceStore.persist.rehydrate();
    useFinanceStore.getState().setHasHydrated(true);
    setReady(true);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Enregistrement du service worker facultatif : on échoue silencieusement.
      });
    }
  }, []);

  return (
    <ThemeProvider>
      {ready ? (
        <>
          {children}
          <InstallTutorial />
        </>
      ) : (
        <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark" />
      )}
    </ThemeProvider>
  );
}
