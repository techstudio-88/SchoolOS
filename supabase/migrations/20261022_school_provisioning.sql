create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  school_code text not null unique,
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists school_id uuid references public.schools(id) on delete set null;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (
  role = any (array['developer','owner','manager','principal','vice_principal','control_room','class_teacher','subject_teacher','student','parent','fees_counter','pending']::text[])
);
create table if not exists public.admin_bootstrap_keys (
  id boolean primary key default true check (id = true),
  key_hash text not null,
  created_at timestamptz not null default now()
);
insert into public.admin_bootstrap_keys (id, key_hash)
values (true, '6fc999551c8296935c8a938f78fb1ffbcae91a0d79d8475a48827e6e34f7768d')
on conflict (id) do update set key_hash = excluded.key_hash, created_at = now();
alter table public.schools enable row level security;
alter table public.admin_bootstrap_keys enable row level security;
revoke all on public.schools from anon, authenticated;
revoke all on public.admin_bootstrap_keys from anon, authenticated;