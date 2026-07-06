# FinAssist — l'assistant qui te dit si tu peux vraiment te le permettre

PWA premium de gestion budgétaire, pensée comme une application Apple :
minimaliste, rapide, rassurante. Ce n'est pas un logiciel de comptabilité —
c'est un assistant qui répond à une seule question : *« Est-ce que je peux
me permettre cette dépense ? »*

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — design system iOS (coins arrondis, ombres discrètes, mode clair/sombre)
- **Framer Motion** — micro-animations, bottom sheets, transitions de page
- **Recharts** — graphiques (solde, revenus/dépenses, catégories, épargne)
- **Zustand** (+ `persist`) — état global, sauvegardé en `localStorage`
- Aucun backend, aucune base de données — tout vit côté client pour la V1

## Installation

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000). L'application est
utilisable directement sur mobile (responsive) ou installable en PWA
(« Ajouter à l'écran d'accueil » sur iOS/Android, ou l'icône d'installation
dans la barre d'adresse sur desktop).

> Je n'ai pas pu exécuter `npm install` / `npm run build` dans mon
> environnement (pas d'accès réseau), donc pensez à lancer un build avant
> tout déploiement pour rattraper une éventuelle coquille TypeScript.

## Déploiement (Vercel)

1. Poussez le projet sur GitHub.
2. Sur [vercel.com](https://vercel.com) → **Add New → Project** → importez
   le dépôt. Next.js est détecté automatiquement, aucune configuration
   nécessaire.
3. Déployez.

## Architecture

```
app/
  layout.tsx           → police, manifest PWA, thème, navigation persistante, PageTransition
  page.tsx              → Accueil
  transactions/page.tsx  → Transactions
  previsions/page.tsx     → Prévisions (durée personnalisée + détail par mois)
  epargne/page.tsx         → Épargne (objectifs)
  simulateur/page.tsx       → Simulateur de scénarios avancés
  coach/page.tsx             → Coach financier (accessible depuis l'accueil)

components/
  ui/                    → primitives réutilisables (Card, Button, Sheet, Field, StatusBadge, Reveal)
  home/                   → BalanceCard, RemainingToLiveCard, RemainingToLiveGauge, SettingsSheet
  transactions/            → formulaire (ajout + édition) + liste animée
  previsions/               → frise, sélecteur de durée, détail par mois
  epargne/                   → objectifs, création, versement
  simulateur/                 → sélecteur de scénario, champs dynamiques, comparaison, résultat
  coach/                       → carte de conseil
  charts/                       → 4 graphiques Recharts (solde, revenus/dépenses, catégories, épargne)
  reminders/                     → Sheet des rappels intelligents
  onboarding/                     → tutoriel d'installation PWA
  BottomNav.tsx                    → navigation à 4 onglets
  PageTransition.tsx                 → transition animée entre pages
  ThemeProvider.tsx / Providers.tsx    → thème + hydratation du store + service worker + tutoriel

lib/
  types.ts                → modèle de données (Transaction, SavingsGoal, Reminder, Scenario…)
  store.ts                 → état global Zustand + actions + données de démo + onboardingSeen
  notifications.ts          → wrapper Notification API, prêt pour un vrai push PWA
  finance/
    engine.ts                → cœur des calculs (solde, prévisions, reste à vivre, simulateur simple)
    scenarios.ts               → moteur des scénarios avancés (diff virtuel + comparaison)
    reminders.ts                 → génération des rappels intelligents
    goals.ts                      → progression des objectifs d'épargne
    coach.ts                       → génération des conseils
    categories.ts                   → registre des types/catégories
  ui/
    chartTheme.ts                    → couleurs et styles partagés pour les graphiques
  utils/
    format.ts                         → devises, dates, mois
    id.ts                               → identifiants uniques

public/
  manifest.json            → PWA installable
  sw.js                      → service worker (cache app shell, réseau d'abord)
  icons/                       → icônes 192 / 512
```

### Modèle de données

Une seule entité pivot : **`Transaction`**. Un salaire, une facture, un
abonnement, un achat en plusieurs fois ou un versement d'épargne sont tous
des transactions — seul le champ `type` change, ce qui détermine le sens
(`flow: income | expense`) et les valeurs par défaut (catégorie,
récurrence). Ça simplifie énormément le moteur de calcul : pas besoin de
traiter chaque cas à part.

- `type` → le geste rapide choisi à l'ajout (salaire, facture, abonnement…)
- `category` → l'étiquette utilisée pour les regroupements et le coach
  (restauration, transport, logement…)
- `recurrence` → `none | weekly | monthly | yearly`
- `installment` → présent uniquement sur les échéances d'un achat en
  plusieurs fois (elles sont générées automatiquement, une transaction par
  échéance)
- `goalId` → présent sur un versement d'épargne, relie la transaction à un
  objectif

### Moteur de calcul (`lib/finance/engine.ts`)

C'est le cœur de l'application. Toutes les hypothèses de calcul sont
documentées en commentaire en tête du fichier. En résumé :

- Un **solde de référence** (`startingBalance` + `startingBalanceDate`,
  modifiable dans **Réglages** depuis l'accueil) sert d'ancrage : c'est le
  solde réel du compte à une date donnée. Tout ce qui se passe après cette
  date est recalculé à partir des transactions enregistrées.
- Les transactions récurrentes sont « dépliées » mois par mois
  (approximation au mois près pour les mensuelles/annuelles, ~4
  occurrences/mois pour les hebdomadaires — precision volontairement
  simplifiée, ce n'est pas un outil comptable).
- `getForecast()` calcule les 3 prochains mois (revenus, dépenses,
  paiements en plusieurs fois, épargne, solde final, statut de risque).
- `getSafeToSpend()` = solde actuel − engagements connus des 30 prochains
  jours − une marge de sécurité de 15 %.
- `simulatePurchase()` clone les transactions existantes, y ajoute l'achat
  simulé (généré en échéances virtuelles si paiement en plusieurs fois),
  recalcule la prévision à 3 mois, et retourne le mois le plus difficile,
  le solde minimum et un message adapté (🟢 / 🟠 / 🔴).
- Seuils de risque : `< 0 €` → risque, `< 300 €` → attention, sinon stable
  (constantes ajustables en haut du fichier).

### Pourquoi Zustand plutôt qu'un Context React classique ?

L'app est volontairement sans backend en V1, mais l'objectif affiché est
d'y brancher plus tard une **connexion bancaire**, une **synchronisation
cloud**, du **multi-utilisateur**. Zustand isole tout l'état et les actions
dans un seul store avec une API stable (`useFinanceStore`) : demain, il
suffira de remplacer la persistance `localStorage` par des appels API dans
les mêmes actions (`addTransaction`, `contributeToGoal`, etc.) sans toucher
aux composants qui les consomment.

## Préparé pour la suite (sans refonte d'architecture)

- **Connexion bancaire** : remplacer la saisie manuelle du solde de
  référence par un import automatique — le reste du moteur de calcul
  fonctionne déjà sur des `Transaction[]`, peu importe leur origine.
- **Notifications** : les fonctions `riskFromBalance` /
  `getForecast` retournent déjà un statut par mois ; il suffit de les
  brancher à un scheduler (cron / push).
- **Synchronisation cloud** : le store Zustand centralise déjà toutes les
  mutations ; swap de `persist(localStorage)` vers un adaptateur API.
- **IA / coach avancé** : `lib/finance/coach.ts` est un moteur de règles
  volontairement simple et isolé — remplaçable par un appel à un modèle
  sans toucher au reste de l'app.
- **Export PDF** : les données affichées (prévisions, transactions) sont
  déjà des structures typées (`MonthForecast[]`, `Transaction[]`),
  directement sérialisables vers un générateur de PDF.
- **Multi-utilisateur** : le store n'a aucune notion d'identité pour
  l'instant ; ajouter un `userId` sur les entités et un espace de stockage
  par utilisateur ne casse pas le modèle existant.

## Ce qui est volontairement simplifié en V1

- Pas de vraie authentification ni de compte : une seule « session »
  locale par navigateur.
- Les calculs de récurrence sont au mois près, pas au jour près (voir les
  commentaires dans `engine.ts`).
- Le coach financier applique des règles simples (seuils fixes), pas de
  modèle prédictif.
- Les données de démonstration (salaire, loyer, abonnements, quelques
  dépenses restauration, un objectif « Voyage ») sont préchargées au
  premier lancement pour que l'app ne soit pas vide — supprimez-les
  librement depuis l'onglet Transactions.
- Les notifications (`lib/notifications.ts`) sont des notifications
  **locales** du navigateur : elles ne fonctionnent que si l'app (ou
  l'onglet) est ouverte. Recevoir un rappel app fermée nécessite un vrai
  push serveur — voir les commentaires du fichier pour le chemin
  d'évolution complet.

## Évolutions récentes

- **Prévisions sur une durée personnalisée** : un sélecteur (3 / 6 / 12
  mois, ou une valeur libre jusqu'à 36) contrôle directement le paramètre
  `months` de `getForecast()`, déjà générique. Toucher une carte de mois
  ouvre `MonthDetailSheet`, qui liste les transactions réellement associées
  à ce mois via la nouvelle fonction `getTransactionsForMonth()` — elle
  déplie les transactions récurrentes en occurrences concrètes avec une
  date calculée (contrairement à `flowBetween`, qui ne fait que sommer).
- **Modification d'une transaction** : `TransactionItem` expose un bouton
  crayon en plus de la corbeille. Il ouvre `TransactionForm` pré-rempli
  (prop `existing`) ; la validation appelle la nouvelle action de store
  `updateTransaction(id, updates)` au lieu de recréer une entrée. Pour une
  échéance d'un achat en plusieurs fois, seule cette écriture est modifiée
  — l'échéancier existant (`installment`) est préservé tel quel.
- **Design plus épuré** : palette éclaircie (fonds quasi blancs,
  `tailwind.config.ts`), graisses de texte allégées dans toute
  l'application (titres en `font-medium`, corps en `font-light`/`font-normal`,
  montants en `font-medium` pour rester lisibles sans être criards), padding
  des cartes et des sheets augmenté, ombres encore plus discrètes, icônes à
  trait plus fin. La police Manrope charge désormais aussi la graisse 300
  pour ce rendu plus fin.

## Version "premium" — graphiques, rappels, scénarios avancés

Cette itération ajoute six évolutions majeures **sans changer
l'architecture existante** : mêmes 4 onglets, même store Zustand, mêmes
fonctions de calcul (`engine.ts`) — uniquement étendues, jamais réécrites.

### 1. Graphiques (Recharts)

Quatre graphiques, chacun placé sur l'onglet le plus pertinent plutôt que
tous entassés sur l'accueil (cohérence avec le principe « minimaliste ») :

| Graphique | Fichier | Où |
|---|---|---|
| Évolution du solde prévue | `components/charts/BalanceEvolutionChart.tsx` | Accueil |
| Revenus vs dépenses par mois | `components/charts/IncomeExpenseChart.tsx` | Prévisions |
| Répartition des dépenses par catégorie | `components/charts/CategoryBreakdownChart.tsx` | Transactions |
| Progression des objectifs d'épargne | `components/charts/SavingsProgressChart.tsx` | Épargne |

Les couleurs sont centralisées dans `lib/ui/chartTheme.ts` (miroir de
`tailwind.config.ts` — Recharts a besoin de vraies valeurs hexadécimales,
pas de classes Tailwind). Chaque graphique s'adapte au thème clair/sombre
via `useTheme()` et anime son apparition nativement (props `animationDuration`
de Recharts).

### 2. Rappels intelligents

`lib/finance/reminders.ts` (`generateReminders()`) analyse l'état courant
et détecte : abonnements et échéances des 7 prochains jours, mois à risque
sur les 3 prochains mois, objectifs d'épargne sans versement depuis 30
jours. Accessible via l'icône cloche sur l'accueil (`ReminderSheet`), avec
un point rouge si des rappels sont actifs.

`lib/notifications.ts` isole l'appel à la Notification API du navigateur
(`requestNotificationPermission`, `notify`) derrière une interface stable.
Le fichier documente précisément la marche à suivre pour brancher un vrai
push PWA plus tard (VAPID, `pushManager.subscribe()`, backend, évènement
`push` dans `public/sw.js`) sans avoir à changer l'appelant.

### 3. Simulations avancées

Le simulateur (`app/simulateur/page.tsx`) propose maintenant 6 types de
scénario via `ScenarioTypePicker` : achat, hausse/baisse de salaire, ajout
d'abonnement, résiliation d'abonnement, nouvelle dépense récurrente,
remboursement anticipé d'un achat en plusieurs fois.

Le moteur (`lib/finance/scenarios.ts`, `simulateScenario()`) traduit chaque
scénario en une modification **virtuelle** (ajouts + suppressions par id)
de la liste de transactions, sans jamais toucher au store réel, puis
compare la prévision de base à la prévision avec scénario
(`ScenarioComparisonChart`) sur la durée choisie (6 mois par défaut).
L'ancien `simulatePurchase()` reste intact dans `engine.ts` (non
supprimé, non modifié) : rien ne dépendait de lui en dehors de la page
simulateur, qui utilise désormais le moteur de scénarios pour une
expérience unifiée.

### 4. Micro-interactions

- Transition de page (fondu + léger slide) via `components/PageTransition.tsx`,
  monté une fois dans `app/layout.tsx`.
- Apparition en cascade des cartes via `components/ui/Reveal.tsx`
  (wrapper Framer Motion générique, réutilisé sur l'accueil, les
  transactions, les prévisions et l'épargne).
- Ajout/suppression de transaction animés (`TransactionItem` + `AnimatePresence`
  dans la page Transactions).
- Boutons avec retour tactile (`whileTap`) déjà présents, complétés sur les
  actions de suppression.
- Graphiques et Bottom Sheets déjà animés nativement (Recharts / Framer
  Motion spring existant, non modifié).

### 5. Carte "Reste à vivre"

`lib/finance/engine.ts` expose `getRemainingToLive()`, qui réutilise
`getCurrentBalance()` et `getBalanceAfterCommitments()` (aucune logique de
calcul dupliquée) pour donner : solde actuel, revenus/dépenses du mois
(occurrences réelles via `getTransactionsForMonth`), dépenses restantes
prévues, et disponible jusqu'à la fin du mois. Affichée sur l'accueil
(`RemainingToLiveCard`) avec une jauge à 3 zones
(`RemainingToLiveGauge` : confortable / à surveiller / risqué).

### 6. Tutoriel d'installation PWA

`components/onboarding/InstallTutorial.tsx` détecte iOS/Android via
`navigator.userAgent`, ne s'affiche que si l'app n'est pas déjà installée
(`display-mode: standalone`) et pas déjà vue (`onboardingSeen` dans le
store Zustand existant, persisté). Étapes illustrées et animées
(Framer Motion), bouton "Passer" à tout moment. Peut être relancé depuis
**Réglages → Revoir le tutoriel d'installation**, qui ne fait que remettre
`onboardingSeen` à `false`.

## Personnaliser

- **Couleurs / rayons / ombres** : `tailwind.config.ts`.
- **Catégories et types de transaction** : `lib/finance/categories.ts`.
- **Seuils de risque et marge de sécurité** : constantes en haut de
  `lib/finance/engine.ts`.
- **Règles du coach** : `lib/finance/coach.ts`.
- **Données de démonstration** : fonction `seedTransactions()` dans
  `lib/store.ts`.
