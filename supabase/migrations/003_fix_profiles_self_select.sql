-- Migration: 003_fix_profiles_self_select.sql
-- Fix circular RLS dependency on public.profiles.
--
-- Problem: after OTP verification, the app queries profiles to check role/is_active.
-- The existing admin-gate policy required profiles to already be readable,
-- creating a circular check. Authenticated users had no way to read their own row.
--
-- Fix: add a "self select" policy that allows any authenticated user to read
-- only their own profile row (id = auth.uid()). Admin policies for INSERT/UPDATE/DELETE
-- remain gated by the admin-check predicate.

create policy "profiles_self_select"
on public.profiles
for select
to authenticated
using (id = auth.uid());
