-- Migration: 007_whatsapp_cta_attempts
-- Added by: HU-4.3 (FEAT-4)
-- Description: Adds minimal WhatsApp CTA attempt traceability with anon insert and admin read access.

create table if not exists public.whatsapp_cta_attempts (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  context_type text not null,
  product_slug text null,
  product_name text null,
  prefilled_message text not null,
  opened_successfully boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.whatsapp_cta_attempts enable row level security;

create policy "whatsapp_cta_attempts_anon_insert"
on public.whatsapp_cta_attempts
for insert
to anon
with check (true);

create policy "whatsapp_cta_attempts_admin_select"
on public.whatsapp_cta_attempts
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  )
);

create index if not exists idx_whatsapp_cta_attempts_created_at
  on public.whatsapp_cta_attempts (created_at desc);

create index if not exists idx_whatsapp_cta_attempts_source_context
  on public.whatsapp_cta_attempts (source, context_type, created_at desc);
