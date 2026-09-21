-- Server-side OTP dispatch rate limiting (3 requests per phone per 10 minutes).
--
-- This is a write-only audit table keyed by a salted hash of the normalized
-- phone number, so raw phone numbers do not need to be persisted.
--
-- The check is implemented as a SECURITY DEFINER function to provide an atomic
-- "check and insert" under concurrency, and is intended to be invoked only by
-- trusted server code (service_role).

create table if not exists public.otp_dispatch_rate_limits (
  phone_hash text not null,
  requested_at timestamptz not null default now()
);

create index if not exists otp_dispatch_rate_limits_phone_requested_idx
  on public.otp_dispatch_rate_limits (phone_hash, requested_at desc);

alter table public.otp_dispatch_rate_limits enable row level security;

revoke all on table public.otp_dispatch_rate_limits from anon;
revoke all on table public.otp_dispatch_rate_limits from authenticated;

-- No grants/policies: only service_role (which bypasses RLS) should touch this.

drop function if exists public.check_otp_dispatch_rate_limit(text);

create function public.check_otp_dispatch_rate_limit(phone_hash text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  now_ts timestamptz := now();
  window_start timestamptz := now_ts - interval '10 minutes';
  request_count integer;
begin
  -- Serialize by phone_hash so concurrent sends can't slip past the window.
  perform pg_advisory_xact_lock(hashtext(phone_hash));

  delete from public.otp_dispatch_rate_limits
    where otp_dispatch_rate_limits.phone_hash = check_otp_dispatch_rate_limit.phone_hash
      and requested_at < window_start;

  select count(*)
    into request_count
    from public.otp_dispatch_rate_limits
    where otp_dispatch_rate_limits.phone_hash = check_otp_dispatch_rate_limit.phone_hash
      and requested_at >= window_start;

  if request_count >= 3 then
    return false;
  end if;

  insert into public.otp_dispatch_rate_limits(phone_hash, requested_at)
    values (check_otp_dispatch_rate_limit.phone_hash, now_ts);

  return true;
end;
$$;

revoke all on function public.check_otp_dispatch_rate_limit(text) from public;
revoke all on function public.check_otp_dispatch_rate_limit(text) from anon;
revoke all on function public.check_otp_dispatch_rate_limit(text) from authenticated;

grant execute on function public.check_otp_dispatch_rate_limit(text) to service_role;

