insert into public.profiles (id, email, role, is_active, allowed_modules)
values (
  '9420de68-a21f-40cc-a281-6cb960c36e55',
  'tu-correo@dominio.com',
  'admin',
  true,
  array['productos','categorias','conversion']::text[]
)
on conflict (id) do update
set
  email = excluded.email,
  role = excluded.role,
  is_active = excluded.is_active,
  allowed_modules = excluded.allowed_modules;