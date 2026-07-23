create table if not exists public.customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_subscription_id text unique not null,
  stripe_customer_id text not null,
  stripe_price_id text,
  status text not null default 'inactive',
  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions(user_id);

create index if not exists subscriptions_customer_id_idx
  on public.subscriptions(stripe_customer_id);

create index if not exists subscriptions_status_idx
  on public.subscriptions(status);

alter table public.customers enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "Users can view their customer record"
  on public.customers;

create policy "Users can view their customer record"
  on public.customers
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can view their subscriptions"
  on public.subscriptions;

create policy "Users can view their subscriptions"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_customers_updated_at
  on public.customers;

create trigger set_customers_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at
  on public.subscriptions;

create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();
