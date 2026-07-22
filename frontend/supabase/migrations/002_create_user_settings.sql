begin;

create table if not exists public.user_settings (
  user_id uuid primary key
    references public.profiles(id)
    on delete cascade,

  settings jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_settings
enable row level security;

grant select, insert, update
on public.user_settings
to authenticated;

drop policy if exists "Users can manage their own settings"
on public.user_settings;

create policy "Users can manage their own settings"
on public.user_settings
for all
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

drop trigger if exists user_settings_updated_at
on public.user_settings;

create trigger user_settings_updated_at
before update
on public.user_settings
for each row
execute function public.set_updated_at();

commit;