alter table public.profiles
  add column if not exists welcome_trial_used boolean not null default false,
  add column if not exists welcome_trial_started_at timestamptz,
  add column if not exists welcome_trial_ends_at timestamptz,
  add column if not exists premium_until timestamptz,
  add column if not exists referral_days integer not null default 0;

alter table public.profiles
  drop constraint if exists profiles_referral_days_non_negative;

alter table public.profiles
  add constraint profiles_referral_days_non_negative
  check (referral_days >= 0);

create index if not exists profiles_welcome_trial_ends_at_idx
  on public.profiles(welcome_trial_ends_at);

create index if not exists profiles_premium_until_idx
  on public.profiles(premium_until);

create index if not exists profiles_referred_by_idx
  on public.profiles(referred_by);

create or replace function public.initialize_profile_access()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  trial_start timestamptz;
  trial_end timestamptz;
begin
  if coalesce(new.welcome_trial_used, false) = false then
    trial_start := now();
    trial_end := trial_start + interval '1 day';

    new.welcome_trial_used := true;
    new.welcome_trial_started_at := trial_start;
    new.welcome_trial_ends_at := trial_end;

    if new.premium_until is null or new.premium_until < trial_end then
      new.premium_until := trial_end;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists initialize_profile_access_trigger
  on public.profiles;

create trigger initialize_profile_access_trigger
before insert on public.profiles
for each row
execute function public.initialize_profile_access();

comment on column public.profiles.welcome_trial_used is
  'True after the account has received its one-time 24-hour welcome trial.';

comment on column public.profiles.welcome_trial_started_at is
  'Timestamp at which the one-time welcome trial began.';

comment on column public.profiles.welcome_trial_ends_at is
  'Timestamp at which the one-time welcome trial expires.';

comment on column public.profiles.premium_until is
  'Expiry for non-subscription Premium access such as welcome trials, day passes and referral rewards.';

comment on column public.profiles.referral_days is
  'Total number of Premium days earned through successful referrals.';
