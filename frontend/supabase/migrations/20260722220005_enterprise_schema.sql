create extension if not exists pgcrypto;

-------------------------------------------------
-- Referral System
-------------------------------------------------

create table if not exists public.referrals (
    id uuid primary key default gen_random_uuid(),
    referrer_id uuid not null references auth.users(id) on delete cascade,
    referred_user_id uuid references auth.users(id) on delete set null,
    referral_code text not null,
    status text default 'pending',
    reward numeric default 0,
    created_at timestamptz default now()
);

-------------------------------------------------
-- AI Credits
-------------------------------------------------

create table if not exists public.ai_credit_transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    amount integer not null,
    transaction_type text not null,
    description text,
    created_at timestamptz default now()
);

-------------------------------------------------
-- Resume Versions
-------------------------------------------------

create table if not exists public.resume_versions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    resume_name text,
    version integer default 1,
    json_data jsonb,
    created_at timestamptz default now()
);

-------------------------------------------------
-- Job Tracker
-------------------------------------------------

create table if not exists public.job_applications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    company text,
    job_title text,
    status text default 'Applied',
    applied_date date,
    notes text,
    created_at timestamptz default now()
);

-------------------------------------------------
-- Saved Jobs
-------------------------------------------------

create table if not exists public.saved_jobs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    external_job_id text,
    title text,
    company text,
    location text,
    url text,
    created_at timestamptz default now()
);

-------------------------------------------------
-- Notifications
-------------------------------------------------

create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    title text,
    message text,
    is_read boolean default false,
    created_at timestamptz default now()
);

-------------------------------------------------
-- Support Tickets
-------------------------------------------------

create table if not exists public.support_tickets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    subject text,
    message text,
    status text default 'Open',
    created_at timestamptz default now()
);

-------------------------------------------------
-- API Usage Logs
-------------------------------------------------

create table if not exists public.api_usage (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    endpoint text,
    tokens integer,
    created_at timestamptz default now()
);

