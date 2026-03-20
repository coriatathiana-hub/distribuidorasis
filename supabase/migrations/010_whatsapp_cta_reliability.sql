-- Migration: 010_whatsapp_cta_reliability
-- Added by: HU-5.6 (FEAT-5)
-- Description: Adds idempotency key to whatsapp_cta_attempts for reliable retry-safe inserts.

alter table public.whatsapp_cta_attempts
  add column if not exists event_id text;

update public.whatsapp_cta_attempts
set event_id = id::text
where event_id is null;

alter table public.whatsapp_cta_attempts
  alter column event_id set default gen_random_uuid()::text;

alter table public.whatsapp_cta_attempts
  alter column event_id set not null;

create unique index if not exists whatsapp_cta_attempts_event_id_unique
  on public.whatsapp_cta_attempts (event_id);
