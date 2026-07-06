/**
 * ============================================================================
 * NOTIFICATIONS — infrastructure V1
 * ----------------------------------------------------------------------------
 * Pour l'instant, ce module ne fait qu'utiliser la Notification API du
 * navigateur (notifications locales, déclenchées pendant que l'app est
 * ouverte). Il n'y a pas encore de push serveur.
 *
 * Pour évoluer vers de vraies notifications PWA (reçues même app fermée) :
 *  1. Générer les clés VAPID côté serveur.
 *  2. Utiliser `registration.pushManager.subscribe()` dans le service worker
 *     (déjà enregistré dans `public/sw.js`) pour obtenir un `PushSubscription`.
 *  3. Envoyer cet abonnement à un backend, qui le stockera par utilisateur.
 *  4. Le backend déclenche les rappels (mêmes règles que `reminders.ts`, à
 *     exécuter côté serveur avec les données synchronisées) via `web-push`.
 *  5. Gérer l'évènement `push` dans `public/sw.js` pour afficher la
 *     notification même app fermée.
 * Rien de tout cela ne casse ce module : `notify()` restera le point d'appel
 * unique pour déclencher une notification, seule son implémentation interne
 * changera.
 * ============================================================================
 */

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!isNotificationSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export function canNotify(): boolean {
  return isNotificationSupported() && Notification.permission === "granted";
}

/** Déclenche une notification locale si l'autorisation a été accordée (no-op sinon). */
export function notify(title: string, body: string): void {
  if (!canNotify()) return;
  try {
    new Notification(title, { body, icon: "/icons/icon-192.png" });
  } catch {
    // Certains contextes (ex. iOS Safari hors PWA installée) ne supportent
    // pas `new Notification()` directement : on échoue silencieusement.
  }
}
