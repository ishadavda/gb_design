-- Customer profile data captured during onboarding.
-- Profile data may be deleted when an account is closed, while consent audit
-- evidence remains preserved in public.consent_records.

create table if not exists public.customer_profiles (
  user_id uuid primary key,
  first_name text not null,
  phone text not null,
  date_of_birth date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint customer_profiles_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on update restrict
    on delete cascade,

  constraint customer_profiles_first_name_required_chk
    check (char_length(trim(first_name)) > 0)
);

comment on table public.customer_profiles is
  'Customer profile data captured during onboarding. This table may be deleted when an account is closed; consent audit evidence is retained separately.';

alter table public.customer_profiles enable row level security;

revoke all on table public.customer_profiles from anon;
revoke all on table public.customer_profiles from authenticated;

grant select, insert, update on table public.customer_profiles to authenticated;

drop policy if exists "Authenticated users can read own profile"
  on public.customer_profiles;

create policy "Authenticated users can read own profile"
  on public.customer_profiles
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Authenticated users can create own profile"
  on public.customer_profiles;

create policy "Authenticated users can create own profile"
  on public.customer_profiles
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Authenticated users can update own profile"
  on public.customer_profiles;

create policy "Authenticated users can update own profile"
  on public.customer_profiles
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

