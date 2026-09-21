-- Platform consent audit records for Phase I.
-- Consent records are append-only compliance evidence and are intentionally
-- stored separately from profile/application data.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.consent_records (
  consent_id uuid primary key default extensions.gen_random_uuid(),
  anonymized_user_id uuid not null,
  scope text not null default 'platform',
  data_processing_granted boolean not null,
  sms_granted boolean not null,
  marketing_granted boolean not null,
  granted_timestamp timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint consent_records_anonymized_user_id_fkey
    foreign key (anonymized_user_id)
    references auth.users(id)
    on update restrict
    on delete restrict,

  constraint consent_records_scope_platform_chk
    check (scope = 'platform'),

  constraint consent_records_data_processing_required_chk
    check (data_processing_granted is true),

  constraint consent_records_sms_required_chk
    check (sms_granted is true)
);

comment on table public.consent_records is
  'Append-only platform consent audit records. Future consent changes should create a new row instead of mutating historical evidence.';

comment on column public.consent_records.anonymized_user_id is
  'Supabase Auth user UUID at the time consent was granted. Hard auth user deletion is restricted to preserve audit evidence.';

comment on column public.consent_records.granted_timestamp is
  'Consent grant time as timestamptz. PostgreSQL stores timestamptz as an absolute instant and Supabase returns ISO-8601 UTC values.';

comment on constraint consent_records_anonymized_user_id_fkey on public.consent_records is
  'Uses ON DELETE RESTRICT rather than CASCADE so auth user deletion cannot silently destroy consent audit evidence.';

create index if not exists consent_records_anonymized_user_id_idx
  on public.consent_records (anonymized_user_id);

create index if not exists consent_records_granted_timestamp_idx
  on public.consent_records (granted_timestamp desc);

alter table public.consent_records enable row level security;

-- Lock down table privileges. Supabase service_role can still perform
-- authorized server-side compliance operations because it bypasses RLS.
revoke all on table public.consent_records from anon;
revoke all on table public.consent_records from authenticated;

grant select, insert on table public.consent_records to authenticated;

drop policy if exists "Authenticated users can read own consent records"
  on public.consent_records;

create policy "Authenticated users can read own consent records"
  on public.consent_records
  for select
  to authenticated
  using (anonymized_user_id = auth.uid());

drop policy if exists "Authenticated users can create own consent records"
  on public.consent_records;

create policy "Authenticated users can create own consent records"
  on public.consent_records
  for insert
  to authenticated
  with check (anonymized_user_id = auth.uid());

-- No UPDATE or DELETE privileges and no UPDATE/DELETE policies are defined.
-- Normal authenticated clients therefore cannot mutate or remove historical
-- consent audit records. Consent changes must be represented by inserting a
-- new audit row through an authenticated client or controlled server-side flow.

