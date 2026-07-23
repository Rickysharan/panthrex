create table if not exists public.day_passes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  amount_paid integer not null default 100,
  currency text not null default 'gbp',
  status text not null default 'pending',
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint day_passes_amount_paid_positive
    check (amount_paid > 0),

  constraint day_passes_status_valid
    check (
      status in (
        'pending',
        'active',
        'expired',
        'cancelled',
        'refunded',
        'failed'
      )
    ),

  constraint day_passes_valid_time_range
    check (
      expires_at is null
      or starts_at is null
      or expires_at > starts_at
    )
);

create index if not exists day_passes_user_id_idx
  on public.day_passes(user_id);

create index if not exists day_passes_status_idx
  on public.day_passes(status);

create index if not exists day_passes_expires_at_idx
  on public.day_passes(expires_at);

alter table public.day_passes enable row level security;

drop policy if exists "Users can view their day passes"
  on public.day_passes;

create policy "Users can view their day passes"
  on public.day_passes
  for select
  using (auth.uid() = user_id);

drop trigger if exists set_day_passes_updated_at
  on public.day_passes;

create trigger set_day_passes_updated_at
before update on public.day_passes
for each row
execute function public.set_updated_at();

comment on table public.day_passes is
  'Stores one-time Stripe purchases that grant 24 hours of Panthrex Premium access.';

comment on column public.day_passes.amount_paid is
  'Amount paid in the smallest currency unit. For GBP, 100 means £1.00.';

comment on column public.day_passes.starts_at is
  'Timestamp at which the 24-hour Premium access period begins.';

comment on column public.day_passes.expires_at is
  'Timestamp at which the 24-hour Premium access period expires.';
