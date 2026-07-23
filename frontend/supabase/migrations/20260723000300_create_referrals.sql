alter table public.referrals
  add column if not exists reward_days integer not null default 1,
  add column if not exists rewarded_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

update public.referrals
set reward_days = greatest(1, ceil(coalesce(reward, 0))::integer)
where reward_days is null
   or reward_days < 1;

alter table public.referrals
  alter column referred_user_id set not null,
  alter column status set not null,
  alter column status set default 'pending';

alter table public.referrals
  drop constraint if exists referrals_no_self_referral,
  drop constraint if exists referrals_reward_positive,
  drop constraint if exists referrals_status_valid,
  drop constraint if exists referrals_referrer_referred_unique;

alter table public.referrals
  add constraint referrals_no_self_referral
    check (referrer_id <> referred_user_id),
  add constraint referrals_reward_positive
    check (reward_days > 0),
  add constraint referrals_status_valid
    check (status in ('pending', 'completed', 'cancelled')),
  add constraint referrals_referrer_referred_unique
    unique (referrer_id, referred_user_id);

create index if not exists referrals_referrer_idx
  on public.referrals(referrer_id);

create index if not exists referrals_referred_idx
  on public.referrals(referred_user_id);

create index if not exists referrals_status_idx
  on public.referrals(status);

alter table public.referrals enable row level security;

drop policy if exists "Users can view their referrals"
  on public.referrals;

create policy "Users can view their referrals"
  on public.referrals
  for select
  using (
    auth.uid() = referrer_id
    or auth.uid() = referred_user_id
  );

drop trigger if exists set_referrals_updated_at
  on public.referrals;

create trigger set_referrals_updated_at
before update on public.referrals
for each row
execute function public.set_updated_at();

comment on table public.referrals is
  'Tracks Panthrex referral relationships and Premium-day rewards.';

comment on column public.referrals.reward_days is
  'Number of Premium access days awarded for a completed referral.';

comment on column public.referrals.status is
  'Referral lifecycle status: pending, completed, or cancelled.';
