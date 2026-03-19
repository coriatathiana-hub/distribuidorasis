-- Migration: 008_profiles_module_permissions
-- Added by: HU-5.1 (FEAT-5)
-- Description: Adds per-module admin authorization controls.

alter table public.profiles
  add column if not exists allowed_modules text[] null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_allowed_modules_valid'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_allowed_modules_valid
      check (
        allowed_modules is null
        or allowed_modules <@ array['productos','categorias','conversion']::text[]
      );
  end if;
end
$$;
