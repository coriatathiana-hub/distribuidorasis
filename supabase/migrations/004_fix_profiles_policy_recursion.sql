-- Migration: 004_fix_profiles_policy_recursion.sql
-- Fix recursive RLS policy definitions on public.profiles.
--
-- Root cause:
-- 002_initial_rls_policies.sql created profiles policies that queried public.profiles
-- from inside a policy attached to public.profiles. That can produce recursive
-- policy evaluation and block post-OTP authorization checks.
--
-- Resolution:
-- Keep a minimal and safe policy for authenticated users to read only their own row.

drop policy if exists "profiles_admin_select" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;
drop policy if exists "profiles_self_select" on public.profiles;

create policy "profiles_self_select"
on public.profiles
for select
to authenticated
using (id = auth.uid());
