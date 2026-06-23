# SubWise

> Find every AI tool and SaaS subscription you're paying for, surface the overlapping and unused ones, and see exactly what to cancel to save money.

SubWise is a dashboard for knowledge workers, founders, and freelancers drowning
in AI + SaaS subscriptions. Add what you pay for (manually or by pasting a
receipt and letting Claude parse it) and instantly see your total monthly burn,
upcoming renewals, and AI-generated recommendations for what to cancel — with a
hard dollar figure attached to the savings.

In under two minutes you can: sign in with a magic link → add subscriptions →
see your spend → get a ranked, dollar-quantified "cut these first" list.

## Tech stack

| Concern        | Choice                                                       |
| -------------- | ------------------------------------------------------------ |
| Framework      | Next.js 14 (App Router) + TypeScript (strict)                |
| Styling        | Tailwind CSS + shadcn/ui, light + dark mode                  |
| Backend / Auth | Supabase (Postgres + Auth + Row Level Security)              |
| AI             | Anthropic SDK (`claude-sonnet-4-6`), server-side only        |
| Payments       | Stripe Checkout + Billing Portal (test mode), Free / Pro     |
| Charts         | Recharts                                                     |
| Validation     | Zod (all form + API boundaries)                              |
| Deploy target  | Vercel                                                       |

## Architecture

- **Route groups.** `(auth)` for the magic-link sign-in, `(app)` for the
  authenticated dashboard shell, and `api/` route handlers for every AI and
  Stripe call.
- **Secrets never reach the client.** Anthropic, Stripe, and service-role
  Supabase access happen exclusively in `src/app/api/*` route handlers and
  server components. Only `NEXT_PUBLIC_*` values are exposed to the browser.
- **RLS everywhere.** Every table has Row Level Security enabled with policies
  tying rows to `auth.uid()` — a user can only ever read or write their own data.
- **Everything is typed.** Strict TypeScript, no `any`; API + form boundaries
  validated with Zod. AI responses are parsed defensively (strip code fences,
  `try/catch`, Zod-validate, fallback UI on failure).
- **Graceful degradation.** The app boots and is explorable before Supabase,
  Anthropic, or Stripe keys are configured — each feature simply stays inert
  until its keys are present.

## Getting started

### 1. Prerequisites

- **Node 20+** and **pnpm 9+** (`npm i -g pnpm`)
- Free accounts: [Supabase](https://supabase.com),
  [Anthropic](https://console.anthropic.com), [Stripe](https://stripe.com) (test mode)
- Optional for local billing webhooks: the [Stripe CLI](https://stripe.com/docs/stripe-cli)

### 2. Install

```bash
pnpm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` — every variable is documented inline in
[`.env.example`](./.env.example), including where to find each key. You can add
keys incrementally: Supabase first (auth + data), then Anthropic (AI), then
Stripe (billing).

### 4. Set up Supabase

1. Create a project at [app.supabase.com](https://app.supabase.com).
2. **Apply the schema.** The migration in
   [`supabase/migrations/`](./supabase/migrations) creates the tables, triggers,
   and RLS policies. Either:
   - **Supabase CLI:**
     ```bash
     supabase link --project-ref <your-project-ref>
     supabase db push
     ```
   - **or** paste the contents of the migration file into the Supabase
     **SQL Editor** and run it.
3. **Auth redirect URLs.** In **Authentication → URL Configuration**, set the
   Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback`
   to the Redirect URLs (add your deployed URL too for production).
4. Copy the Project URL + anon key + service-role key (Project Settings → API)
   into `.env.local`.

### 5. Set up Anthropic

Create an API key at [console.anthropic.com](https://console.anthropic.com) and
set `ANTHROPIC_API_KEY`. Powers smart-paste parsing and the AI insights panel.

### 6. Set up Stripe (test mode)

1. In the Stripe dashboard (toggle **Test mode**), create a **Product** with a
   recurring **Price** (e.g. $9/month). Copy the price id (`price_…`) into
   `STRIPE_PRO_PRICE_ID`.
2. Copy your test **secret** and **publishable** keys into `STRIPE_SECRET_KEY`
   and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. **Local webhooks** — forward Stripe events to the app so plan upgrades flip
   the user's tier:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the printed `whsec_…` signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Enable the **Billing Portal** in test mode (Settings → Billing → Customer
   portal) so "Manage billing" works.

Use Stripe's test card `4242 4242 4242 4242` with any future expiry and CVC.

### 7. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start the dev server                     |
| `pnpm build`     | Production build                         |
| `pnpm start`     | Run the production build                 |
| `pnpm lint`      | ESLint (next/core-web-vitals + TS rules) |
| `pnpm typecheck` | `tsc --noEmit` (strict)                  |
| `pnpm test`      | Vitest unit tests (money, summary, parsing) |

## Project structure

```
supabase/migrations/      # SQL schema + RLS policies
src/
├─ app/
│  ├─ (auth)/login/        # magic-link sign-in
│  ├─ (app)/               # authed shell: dashboard, billing, onboarding
│  ├─ auth/callback/       # magic-link exchange
│  ├─ api/
│  │  ├─ ai/{parse,insights}/    # Anthropic (server only)
│  │  └─ stripe/{checkout,portal,webhook}/
│  ├─ globals.css          # design tokens (light/dark)
│  ├─ error.tsx · not-found.tsx · icon.svg
│  └─ layout.tsx
├─ components/
│  ├─ ui/                  # shadcn primitives
│  ├─ dashboard/           # stats, donut, renewals, insights panel
│  ├─ subscriptions/       # form, table, smart-paste, dialogs
│  └─ billing/
├─ config/app.ts           # brand + domain constants (rename the app here)
├─ lib/
│  ├─ ai/                  # client, prompts, schemas, defensive JSON parsing
│  ├─ auth/ · supabase/    # session guard, typed clients, middleware
│  ├─ stripe/ · insights/ · subscriptions/
│  └─ utils.ts
└─ types/database.ts       # typed Supabase schema
```

## How the key flows work

- **Smart paste.** The add dialog's hero box posts free text to `/api/ai/parse`,
  which asks Claude for structured fields, validates them with Zod, and
  pre-fills the form. You always confirm before saving — AI output is never
  auto-saved.
- **AI insights (Pro).** `/api/ai/insights` sends your subscription list to
  Claude and gets back structured JSON: overlap detection, likely-unused flags,
  and a ranked cut-list with a total monthly saving. Results are cached in the
  `insights` table and rendered as cards you can dismiss or mark actioned.
- **Billing.** "Upgrade to Pro" creates a Stripe Checkout session; the webhook
  flips `profiles.plan_tier` to `pro` on success and back to `free` on cancel.
  The Free plan caps at 5 subscriptions and hides AI insights.

## Deploying to Vercel

1. Import the repo into Vercel and add every variable from `.env.example` to the
   project's environment.
2. Set `NEXT_PUBLIC_APP_URL` to your deployment URL.
3. Add a **production Stripe webhook** endpoint pointing at
   `https://<your-domain>/api/stripe/webhook` and use its signing secret for
   `STRIPE_WEBHOOK_SECRET`.
4. Add `https://<your-domain>/auth/callback` to Supabase's redirect URLs.

## Out of scope (clean extension points left in place)

Bank/email auto-import, native mobile, team accounts, and multi-currency are
intentionally **not** built. The data model and server boundaries leave room for
them (e.g. money stored as integer cents, a single `config/app.ts` for brand and
domain enums, server-only AI/Stripe layers).

## License

Private — all rights reserved (placeholder).
