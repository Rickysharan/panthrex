alter table public.profiles
  add column if not exists stripe_trial_used boolean not null default false;

comment on column public.profiles.stripe_trial_used is
  'True once the user has started their one-time Stripe subscription trial.';
