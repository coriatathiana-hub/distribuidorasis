-- Seed data: development environment only
-- Matches static product data from app/src/data/products.ts for consistency.
-- Run after migrations 001 and 002.
-- IMPORTANT: Do NOT run in production. Admin users must be provisioned manually via Supabase Auth.

-- Base categories aligned with CATEGORIES constant in products.ts
insert into public.categories (id, name, slug, sort_order, is_active) values
  ('00000000-0000-0000-0000-000000000001', 'Equipo de Protección Personal', 'epp', 1, true),
  ('00000000-0000-0000-0000-000000000002', 'Señalización y Delimitación',   'senalizacion', 2, true),
  ('00000000-0000-0000-0000-000000000003', 'Accesorios de Seguridad',        'accesorios', 3, true),
  ('00000000-0000-0000-0000-000000000004', 'Herramientas y Equipos',         'herramientas', 4, true)
on conflict (slug) do nothing;

-- Sample products (10 representative items) — extend as needed
insert into public.products (category_id, name, slug, short_description, description, specs_json, is_active) values
  ('00000000-0000-0000-0000-000000000001', 'Arnés de Seguridad 3 Aros',         'arnes-3-aros',          'Arnés para trabajo en alturas con 3 aros',     'Arnés de seguridad de 3 aros para trabajo en alturas', '{}', true),
  ('00000000-0000-0000-0000-000000000001', 'Arnés V-Form MSA',                  'arnes-vform-msa',       'Arnés V-Form Raceform MSA',                    'Arnés V-Form Raceform con argolla D en espalda, ajuste rápido en piernas, marca MSA', '{}', true),
  ('00000000-0000-0000-0000-000000000001', 'Casco Ala Ancha MSA',               'casco-ala-ancha-msa',   'Casco de seguridad Clase E Tipo 1 ala ancha',  'Casco de seguridad Clase E, Tipo 1, ala ancha, marca MSA', '{}', true),
  ('00000000-0000-0000-0000-000000000001', 'Lentes de Seguridad Claros',        'lentes-claros',         'Lentes de seguridad transparentes',            'Lentes de seguridad transparentes Kleenguard / MSA Cooper', '{}', true),
  ('00000000-0000-0000-0000-000000000001', 'Guante de Alto Impacto',            'guante-alto-impacto',   'Guante grado 5 para trabajo pesado',           'Guante de alto impacto grado 5 para trabajo pesado industrial', '{}', true),
  ('00000000-0000-0000-0000-000000000001', 'Bota con Casquillo',                'bota-casquillo',        'Bota de seguridad con casquillo tipo II',      'Bota de seguridad con casquillo tipo II, diversas tallas disponibles', '{}', true),
  ('00000000-0000-0000-0000-000000000001', 'Chaleco Reflejante',                'chaleco-reflejante',    'Chaleco alta visibilidad naranja',             'Chaleco de seguridad reflejante naranja de alta visibilidad', '{}', true),
  ('00000000-0000-0000-0000-000000000002', 'Cinta Delimitadora Precaución',     'cinta-precaucion',      'Cinta amarilla de precaución',                 'Cinta delimitadora amarilla de precaución para delimitar áreas de trabajo', '{}', true),
  ('00000000-0000-0000-0000-000000000003', 'Faja Lumbar',                       'faja-lumbar',           'Faja soporte lumbar para carga pesada',        'Faja soporte lumbar y abdominal con cinturón extra para carga pesada', '{}', true),
  ('00000000-0000-0000-0000-000000000004', 'Cuerda Industrial 3/4"',            'cuerda-industrial',     'Cuerda industrial para uso general en obra',   'Cuerda industrial de 3/4 de pulgada para uso general en obra', '{}', true)
on conflict (slug) do nothing;
