-- ============================================================================
-- SubWise — initial schema
-- profiles, subscriptions, insights + Row Level Security
--
-- Every table has RLS enabled with policies tying rows to auth.uid(), so a
-- user can only ever read or write their own data. Validation of enum-like
-- values is done with CHECK constraints (kept in sync with src/config/app.ts);
-- the app also validates at the boundary with Zod.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: one row per auth user, created automatically on sign-up.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  plan_tier text not null default 'free' check (plan_tier in ('free', 'pro')),
  stripe_customer_id text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- subscriptions: the things a user is paying for.
-- cost_cents is always stored as an integer count of cents. Annual costs are
-- normalized to a monthly figure in the application layer, not here.
-- ----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  category text not null check (
    category in (
      'AI', 'Design', 'Productivity', 'Streaming', 'Dev Tools', 'Storage', 'Other'
    )
  ),
  cost_cents integer not null check (cost_cents >= 0 and cost_cents <= 100000000),
  billing_cycle text not null check (billing_cycle in ('monthly', 'annual')),
  renewal_date date,
  last_used text not null default 'unknown'
    check (last_used in ('today', 'week', 'month', 'unknown')),
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);

create index if not exists subscriptions_renewal_date_idx
  on public.subscriptions (user_id, renewal_date);

-- ----------------------------------------------------------------------------
-- insights: cached AI insight payloads, so we don't regenerate on every load.
-- ----------------------------------------------------------------------------
create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  generated_at timestamptz not null default now(),
  payload jsonb not null
);

create index if not exists insights_user_id_generated_at_idx
  on public.insights (user_id, generated_at desc);

-- ----------------------------------------------------------------------------
-- updated_at maintenance for subscriptions.
-- ----------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- Auto-create a profile row when a new auth user signs up.
-- SECURITY DEFINER so it can write to public.profiles regardless of RLS.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.insights enable row level security;

-- profiles -------------------------------------------------------------------
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- subscriptions --------------------------------------------------------------
drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists subscriptions_insert_own on public.subscriptions;
create policy subscriptions_insert_own on public.subscriptions
  for insert with check (auth.uid() = user_id);

drop policy if exists subscriptions_update_own on public.subscriptions;
create policy subscriptions_update_own on public.subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists subscriptions_delete_own on public.subscriptions;
create policy subscriptions_delete_own on public.subscriptions
  for delete using (auth.uid() = user_id);

-- insights -------------------------------------------------------------------
drop policy if exists insights_select_own on public.insights;
create policy insights_select_own on public.insights
  for select using (auth.uid() = user_id);

drop policy if exists insights_insert_own on public.insights;
create policy insights_insert_own on public.insights
  for insert with check (auth.uid() = user_id);

drop policy if exists insights_delete_own on public.insights;
create policy insights_delete_own on public.insights
  for delete using (auth.uid() = user_id);
