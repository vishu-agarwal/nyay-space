# Nyay Space

**Nyay Space** is a web application for **legal practice management**: one workspace where advocates can see matters at a glance, manage **clients** and **cases**, track **tasks** and **deadlines**, use a **calendar** for hearings and reminders, and organize **documents** and **notes**—without relying on scattered files and ad-hoc lists.

The product aligns with **NyayHub** (see site metadata in `app/layout.tsx`): case timelines, documents, client touchpoints, and consultation-oriented workflows, presented as a single digital hub.

This document is written for **two audiences**:

- **Advocates and practice staff** — what the system does, how to open it, and which areas help day-to-day work.
- **Developers** — how the app is built, where logic lives, and how to run and extend it.

---

## For advocates: what you get

| Area | Why it matters |
| ---- | -------------- |
| **Home** | A practice-oriented dashboard: quick visibility into matters, hearings, and deadlines so you start the day with context. |
| **To-Do** | Matter-linked tasks with due dates and priority—turns “I must remember to…” into a list you can filter and complete. |
| **Calendar** | Hearings, filings, and deadlines in one view; reminders help you avoid missing dates. |
| **Cases** | Each matter has status, court, stage, timeline, documents, and space for notes—your case file in structured form. |
| **Clients** | Client directory and profiles so you can connect people to their matters quickly. |
| **Documents** | Register and tag documents (e.g. FIR, Agreement, Evidence) per matter; supports search, filters, and export-style actions. |

**Global navigation** (top bar): **Home**, **To-Do**, **Calendar**, **Cases**, **Clients**, **Documents**. There is also **global search** in the header to jump to content faster.

**Quick add** (floating action on practice pages): shortcuts to add a **client**, **case**, or **document** without hunting through menus.

---

## How to access the system (advocate steps)

These steps assume the app is deployed to your firm’s URL (for local testing, use `http://localhost:3000` after developers run the project).

1. **Open the app** in a modern browser (Chrome, Edge, Firefox, Safari).
2. **Sign in** at `/login` (or use **Register** at `/register` if your deployment uses onboarding).
3. **Password sign-in** uses email or mobile plus password; some flows may offer **OTP** (one-time password) verification—enter the code sent or shown to you per your administrator’s process.
4. **Forgot password** is available at `/forgot-password` if you need to reset credentials.
5. After a successful sign-in, you land on the **practice area** starting at **Home** (`/`).

**Development note:** In this repository, authentication is a **stub** (see [Authentication](#authentication) below). For production, your team must connect a real identity provider and messaging channel for OTP.

---

## How Nyay Space helps manage advocate work

- **Single workspace** — Navigation and breadcrumbs keep you oriented; you move between overview, calendar, cases, and clients without losing context.
- **Matter-centric tasks** — Tasks on **To-Do** can be tied to a case and due date, so work follows the file, not random sticky notes.
- **Time-sensitive awareness** — Calendar and reminders (where enabled) surface hearings and deadlines; the home dashboard reinforces what matters this week.
- **Case file structure** — Case detail shows **timeline**, **documents**, **status**, and **practice notes** (including hearing notes where applicable). You can **print or export** a matter summary for court or internal use (`matter-print-actions` and related utilities).
- **Documents hub** — Central place to record what exists, where it lives (e.g. local path or link), and how it’s tagged—so retrieval is faster than searching folders alone.
- **Client linkage** — matters stay tied to clients, which supports both litigation workflow and client communication (e.g. WhatsApp-style contact helpers appear where configured in the UI).

**Data persistence (current app behavior):** Much of the practice data you add (tasks, notes, case overrides, managed documents metadata) is stored in the **browser** (`localStorage`) on your device. That gives a fast offline-feel demo, but **it is not a substitute for a firm server or cloud backup** for production. Developers should plan a backend and sync for real deployments.

---

## Feature map (routes)

| Route | Purpose |
| ----- | ------- |
| `/` | Home — practice overview and highlights |
| `/tasks` | To-Do — advocate tasks (filter by matter, status, due date) |
| `/calendar` | Calendar — hearings, deadlines, custom events |
| `/cases` | Case list |
| `/cases/[id]` | Case detail — timeline, documents, notes, print/export |
| `/clients` | Client list |
| `/clients/[id]` | Client profile |
| `/documents` | Documents — register, tag, filter, export |

Auth routes: `/login`, `/register`, `/forgot-password`.

Central path constants live in `lib/routes.ts`.

---

## For developers

### Tech stack

| Layer | Technology |
| ----- | ---------- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| UI | [React](https://react.dev) 19 |
| Styling | [Tailwind CSS](https://tailwindcss.com) 4 |
| Language | TypeScript |
| Toasts | [Sonner](https://sonner.emilkowal.ski/) |

Fonts: Geist (see `app/layout.tsx`).

### Requirements

- **Node.js** 20+ (aligned with `@types/node` in the repo)
- **npm**, **pnpm**, **yarn**, or **bun**

### Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint (Next.js config) |
| `npm run logo:transparent` | Optional logo processing (`scripts/knockout-logo-white.mjs`, uses Sharp) |

### Project layout (high level)

```
app/
  (auth)/           # Login, register, forgot password + server actions
  (practice)/       # Home, tasks, calendar, cases, clients, documents
  layout.tsx        # Root layout, fonts, metadata
  globals.css       # Design tokens and global styles
components/         # Shared UI (auth, practice, case-management, notes, …)
lib/                # Routes, cases seed data, stores, calendar, tasks, notes, print helpers, …
```

Notable libraries:

- `lib/routes.ts` — practice URL helpers
- `lib/cases.ts` — seed **matters** and rich **case detail** demo data
- `lib/case-management-store.ts` — user case overrides and status history in `localStorage`
- `lib/advocate-tasks.ts` — To-Do tasks in `localStorage`
- `lib/practice-notes.ts` — case/client notes in `localStorage`
- `lib/document-management.ts` — managed document records
- `lib/calendar-reminders.ts`, `lib/calendar-custom-events.ts` — calendar and reminders
- `lib/print-utils.ts` — printable HTML / downloads

### Authentication

Server actions in `app/(auth)/actions.ts` validate input and orchestrate OTP-style flows using HTTP-only cookies (`lib/server-otp-cookie.ts`). **There is no production identity provider wired in yet**—sign-in may redirect to `/` after validation, and in **development** OTP codes are logged to the server console for testing.

Replace these stubs with your real auth backend (session/JWT, email/SMS provider, etc.) before shipping.

### Deployment

Build with `npm run build` and run `npm run start`, or deploy to any host that supports Node (e.g. [Vercel](https://vercel.com/docs/frameworks/nextjs)). See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying).

---

## License

Private project (`"private": true` in `package.json`). Adjust this section if you open-source the repo.
