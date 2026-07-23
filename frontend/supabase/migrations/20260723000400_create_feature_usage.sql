create table if not exists public.feature_usage (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  feature_key text not null,

  period_type text not null default 'monthly',

  period_start timestamptz not null,
  period_end timestamptz not null,

  usage_count integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint feature_usage_count_non_negative
    check (usage_count >= 0),

  constraint feature_usage_period_valid
    check (period_end > period_start),

  constraint feature_usage_period_type_valid
    check (
      period_type in (
        'daily',
        'monthly',
        'lifetime'
      )
    ),

  unique (
    user_id,
    feature_key,
    period_type,
    period_start
  )
);

create index if not exists feature_usage_user_id_idx
  on public.feature_usage(user_id);

create index if not exists feature_usage_feature_key_idx
  on public.feature_usage(feature_key);

create index if not exists feature_usage_period_end_idx
  on public.feature_usage(period_end);

alter table public.feature_usage enable row level security;

drop policy if exists "Users can view their feature usage"
  on public.feature_usage;

create policy "Users can view their feature usage"
  on public.feature_usage
  for select
  using (auth.uid() = user_id);

drop trigger if exists set_feature_usage_updated_at
  on public.feature_usage;

create trigger set_feature_usage_updated_at
before update on public.feature_usage
for each row
execute function public.set_updated_at();

comment on table public.feature_usage is
  'Tracks usage counters for Free-plan quotas and Premium feature enforcement.';

comment on column public.feature_usage.feature_key is
  'Stable identifier such as ai_resume_writer, ats_scan, cover_letter, resume_tailor, or interview_session.';

comment on column public.feature_usage.period_type is
  'Quota period type: daily, monthly, or lifetime.';

comment on column public.feature_usage.usage_count is
  'Number of successful uses recorded during the quota period.';
