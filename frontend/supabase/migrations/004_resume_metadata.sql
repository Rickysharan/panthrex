begin;

alter table public.resumes
add column if not exists is_default boolean
default false;

create unique index if not exists resumes_default_idx
on public.resumes(user_id)
where is_default = true;

commit;