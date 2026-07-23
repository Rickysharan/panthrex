alter table public.profiles

add column if not exists username text unique,
add column if not exists avatar_url text,
add column if not exists phone text,
add column if not exists country text,
add column if not exists city text,

add column if not exists subscription_plan text default 'free',
add column if not exists subscription_status text default 'inactive',

add column if not exists ai_credits integer default 25,

add column if not exists referral_code text unique,
add column if not exists referred_by uuid references auth.users(id),

add column if not exists resumes_created integer default 0,
add column if not exists cover_letters_created integer default 0,
add column if not exists ats_scans integer default 0,
add column if not exists interview_sessions integer default 0,

add column if not exists last_login timestamptz,
add column if not exists onboarding_completed boolean default false,

add column if not exists created_at timestamptz default now(),
add column if not exists updated_at timestamptz default now();
