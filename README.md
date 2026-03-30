# Nyay Space

**Nyay Space** is a Next.js app for legal practice management: a structured workspace where advocates can review matters at a glance, browse **clients** and **cases**, and use a **calendar** for hearings and deadlines. The UI is built for clarity and day-to-day workflow—not scattered notes and files.

The product positioning aligns with **NyayHub** (see site metadata in `app/layout.tsx`): case timelines, documents, client touchpoints, and consultation scheduling, presented as a single digital hub.

## Features

- **Dashboard** (`/`) — practice overview, quick stats, and matter highlights
- **Cases** (`/cases`, `/cases/[id]`) — case lists and detail views with related client context
- **Clients** (`/clients`, `/clients/[id]`) — client directory and profiles
- **Calendar** (`/calendar`) — advocate calendar for dates and reminders
- **Auth** (`/login`, `/register`, `/forgot-password`) — sign-in, registration, and recovery flows via React Server Actions
- **Global shell** — practice header, quick-add FAB, footer, loading and error boundaries

## Tech stack

| Area        | Choice                          |
| ----------- | ------------------------------- |
| Framework   | [Next.js](https://nextjs.org) 16 (App Router) |
| UI          | [React](https://react.dev) 19   |
| Styling     | [Tailwind CSS](https://tailwindcss.com) 4 |
| Language    | TypeScript                      |
| Toasts      | [Sonner](https://sonner.emilkowal.ski/) |

## Requirements

- **Node.js** 20+ (matches `@types/node` in the repo)
- **npm**, **pnpm**, **yarn**, or **bun** for installs and scripts

## Getting started

Clone the repository, install dependencies, and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm run start`| Run production server    |
| `npm run lint` | ESLint (Next.js config)  |

### Optional: logo asset script

```bash
npm run logo:transparent
```

Runs `scripts/knockout-logo-white.mjs` (uses Sharp) for logo processing when you need a transparent variant.

## Project layout (high level)

```
app/
  (auth)/          # Login, register, forgot password + server actions
  (practice)/      # Dashboard, cases, clients, calendar
  layout.tsx       # Root layout, fonts, metadata
  globals.css      # Design tokens and global styles
components/        # Shared UI (auth, practice, notes, icons, …)
lib/               # Routes, validation, calendar helpers, OTP cookies, …
```

Main practice routes are defined in `lib/routes.ts` (`/`, `/calendar`, `/cases`, `/clients`, and dynamic segments for detail pages).

## Authentication (current behavior)

Server actions in `app/(auth)/actions.ts` validate input and orchestrate OTP-style flows using HTTP-only cookies (`lib/server-otp-cookie.ts`). **There is no production identity provider wired in yet**—sign-in redirects to `/` after validation, and in **development** OTP codes are logged to the server console for testing.

Replace these stubs with your real auth backend (session/JWT, email/SMS provider, etc.) before shipping.

## Deployment

Build with `npm run build` and run `npm run start`, or deploy to any host that supports Node (e.g. [Vercel](https://vercel.com/docs/frameworks/nextjs)). See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.

## License

Private project (`"private": true` in `package.json`). Adjust this section if you open-source the repo.
