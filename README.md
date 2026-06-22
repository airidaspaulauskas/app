# SubWise

> Find every AI tool and SaaS subscription you're paying for, surface the overlapping and unused ones, and see exactly what to cancel to save money.

SubWise is a dashboard for knowledge workers, founders, and freelancers drowning
in AI + SaaS subscriptions. Add what you pay for (manually or by pasting a
receipt and letting Claude parse it), and instantly see your total monthly burn,
upcoming renewals, and AI-generated recommendations for what to cancel — with a
hard dollar figure attached to the savings.

> **Status:** Milestone 1 — project scaffold. The product is built in reviewable
> milestones; see [Roadmap](#roadmap) for what's wired up vs. coming next.

## Tech stack

| Concern        | Choice                                                       |
| -------------- | ------------------------------------------------------------ |
| Framework      | Next.js 14 (App Router) + TypeScript (strict)                |
| Styling        | Tailwind CSS + shadcn/ui, light + dark mode                  |
| Backend / Auth | Supabase (Postgres + Auth + Row Level Security)              |
| AI             | Anthropic SDK (`claude-sonnet-4-6`), server-side only        |
| Payments       | Stripe Checkout (test mode), Free / Pro tiers                |
| Charts         | Recharts                                                     |
| Validation     | Zod (all form + API boundaries)                              |
| Deploy target  | Vercel                                                       |

## Getting started

### 1. Prerequisites

- **Node 20+** and **pnpm 9+** (`npm i -g pnpm`)
- Accounts (free tiers are fine): [Supabase](https://supabase.com),
  [Anthropic](https://console.anthropic.com), [Stripe](https://stripe.com) (test mode)

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Then fill in `.env.local`. Every variable is documented inline in
[`.env.example`](./.env.example), including exactly where to find each key.

### 4. Set up Supabase

Database migrations live in [`supabase/migrations/`](./supabase) _(added in
Milestone 2)_. You can apply them with the Supabase CLI:

```bash
# coming in Milestone 2
supabase link --project-ref <your-project-ref>
supabase db push
```

### 5. Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> The app boots without Supabase/Stripe/Anthropic keys configured — auth and the
> data features simply stay inert until you add them. This makes the scaffold
> easy to explore before wiring up services.

## Scripts

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start the dev server                     |
| `pnpm build`     | Production build                         |
| `pnpm start`     | Run the production build                 |
| `pnpm lint`      | ESLint (next/core-web-vitals + TS rules) |
| `pnpm typecheck` | `tsc --noEmit` (strict)                  |

## Project structure

```
src/
├─ app/
│  ├─ (auth)/            # unauthenticated routes (login / magic-link)
│  ├─ (app)/             # authenticated dashboard shell
│  ├─ api/               # route handlers (AI + Stripe + health) — server only
│  ├─ globals.css        # Tailwind + shadcn design tokens (light/dark)
│  └─ layout.tsx         # root layout: fonts, theme provider, metadata
├─ components/
│  ├─ ui/                # shadcn/ui primitives
│  ├─ theme-provider.tsx
│  └─ theme-toggle.tsx
├─ config/
│  └─ app.ts             # brand + domain constants (rename the product here)
└─ lib/
   ├─ supabase/          # browser, server, and middleware clients
   └─ utils.ts           # cn() class helper
```

## Architecture notes

- **Secrets never touch the client.** Anthropic, Stripe, and service-role
  Supabase access happen exclusively in `src/app/api/*` route handlers and
  server components.
- **Everything is typed.** Strict TypeScript, no `any`; API + form boundaries
  validated with Zod.
- **Rename in one place.** The product name and domain constants live in
  [`src/config/app.ts`](./src/config/app.ts).

## Roadmap

- [x] **M1 — Scaffold:** Next.js + TS + Tailwind + shadcn, theming, Supabase
      client setup, `.env.example`, README.
- [ ] **M2 — DB + Auth:** migrations, RLS, magic-link sign-in, onboarding shell.
- [ ] **M3 — CRUD + Dashboard:** subscriptions, totals, category donut, renewals.
- [ ] **M4 — AI:** smart-paste parser + cached insights panel.
- [ ] **M5 — Billing:** Stripe Free/Pro tiers + feature gate.
- [ ] **M6 — Polish:** empty/loading/error states, a11y, dark-mode pass.

## License

Private — all rights reserved (placeholder).
