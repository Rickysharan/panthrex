begin;

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  company text,
  title text,
  location text,
  job_url text,
  salary text,
  description text,
  status text default 'applied',
  priority text default 'medium',
  applied_date date,
  interview_date date,
  recruiter text,
  recruiter_email text,
  resume_id uuid,
  cover_letter_id uuid,
  ats_analysis_id uuid,
  interview_session_id uuid,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'job_applications'
      and column_name = 'job_title'
  )
  and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'job_applications'
      and column_name = 'title'
  ) then
    alter table public.job_applications
      rename column job_title to title;
  end if;
end
$$;

alter table public.job_applications
  add column if not exists location text,
  add column if not exists job_url text,
  add column if not exists salary text,
  add column if not exists description text,
  add column if not exists priority text default 'medium',
  add column if not exists interview_date date,
  add column if not exists recruiter text,
  add column if not exists recruiter_email text,
  add column if not exists resume_id uuid,
  add column if not exists cover_letter_id uuid,
  add column if not exists ats_analysis_id uuid,
  add column if not exists interview_session_id uuid,
  add column if not exists updated_at timestamptz default now();

update public.job_applications
set status = case lower(coalesce(status, 'applied'))
  when 'wishlist' then 'wishlist'
  when 'saved' then 'wishlist'
  when 'applied' then 'applied'
  when 'assessment' then 'assessment'
  when 'interview' then 'interview'
  when 'offer' then 'offer'
  when 'rejected' then 'rejected'
  else 'applied'
end;

update public.job_applications
set priority = case lower(coalesce(priority, 'medium'))
  when 'low' then 'low'
  when 'medium' then 'medium'
  when 'high' then 'high'
  else 'medium'
end;

update public.job_applications
set updated_at = coalesce(updated_at, created_at, now());

alter table public.job_applications
  alter column user_id set not null,
  alter column company set not null,
  alter column title set not null,
  alter column status set default 'applied',
  alter column status set not null,
  alter column priority set default 'medium',
  alter column priority set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'job_applications_user_id_fkey'
      and conrelid = 'public.job_applications'::regclass
  ) then
    alter table public.job_applications
      add constraint job_applications_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'job_applications_resume_id_fkey'
      and conrelid = 'public.job_applications'::regclass
  ) then
    alter table public.job_applications
      add constraint job_applications_resume_id_fkey
      foreign key (resume_id)
      references public.resumes(id)
      on delete set null;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'job_applications_status_check'
      and conrelid = 'public.job_applications'::regclass
  ) then
    alter table public.job_applications
      add constraint job_applications_status_check
      check (
        status in (
          'wishlist',
          'applied',
          'assessment',
          'interview',
          'offer',
          'rejected'
        )
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'job_applications_priority_check'
      and conrelid = 'public.job_applications'::regclass
  ) then
    alter table public.job_applications
      add constraint job_applications_priority_check
      check (priority in ('low', 'medium', 'high'));
  end if;
end
$$;

alter table public.job_applications enable row level security;

drop policy if exists "Users can view own job applications"
on public.job_applications;

create policy "Users can view own job applications"
on public.job_applications
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own job applications"
on public.job_applications;

create policy "Users can create own job applications"
on public.job_applications
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own job applications"
on public.job_applications;

create policy "Users can update own job applications"
on public.job_applications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own job applications"
on public.job_applications;

create policy "Users can delete own job applications"
on public.job_applications
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_job_applications_updated_at
on public.job_applications;

create trigger set_job_applications_updated_at
before update on public.job_applications
for each row
execute function public.set_updated_at();

create index if not exists job_applications_user_id_idx
on public.job_applications(user_id);

create index if not exists job_applications_user_status_idx
on public.job_applications(user_id, status);

create index if not exists job_applications_user_priority_idx
on public.job_applications(user_id, priority);

create index if not exists job_applications_created_at_idx
on public.job_applications(created_at desc);

create index if not exists job_applications_resume_id_idx
on public.job_applications(resume_id)
where resume_id is not null;

comment on table public.job_applications is
  'Stores user-owned job applications and their recruitment progress.';

comment on column public.job_applications.status is
  'Recruitment stage: wishlist, applied, assessment, interview, offer, or rejected.';

comment on column public.job_applications.resume_id is
  'Optional resume associated with the job application.';

comment on column public.job_applications.cover_letter_id is
  'Reserved reference to a persisted generated cover letter.';

comment on column public.job_applications.ats_analysis_id is
  'Reserved reference to a persisted ATS analysis.';

comment on column public.job_applications.interview_session_id is
  'Reserved reference to a persisted interview preparation session.';

commit;
