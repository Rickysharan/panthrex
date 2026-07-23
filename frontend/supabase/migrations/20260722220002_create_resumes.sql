begin;

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  title text not null,

  template text not null
    check (
      template in (
        'professional',
        'modern',
        'minimal'
      )
    ),

  resume_data jsonb not null,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now())
);

alter table public.resumes
enable row level security;

grant
select,
insert,
update,
delete
on public.resumes
to authenticated;

drop policy if exists "Users manage own resumes"
on public.resumes;

create policy "Users manage own resumes"
on public.resumes
for all
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

drop trigger if exists resumes_updated_at
on public.resumes;

create trigger resumes_updated_at
before update
on public.resumes
for each row
execute function public.set_updated_at();

create index if not exists resumes_user_idx
on public.resumes(user_id);

create index if not exists resumes_updated_idx
on public.resumes(updated_at desc);

commit;