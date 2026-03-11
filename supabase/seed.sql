-- Seed data: development environment only
-- Mirrors static catalog in app/src/data/products.ts (46 products, 4 categories).
-- Run after migrations 001 and 002.
-- IMPORTANT: Do NOT run in production. Admin users must be provisioned via Supabase Auth.
--
-- category_id uses subqueries on slug so this script is portable across environments
-- (no hardcoded UUIDs that differ between local, staging, and prod).

-- ============================================================
-- Categories
-- ============================================================
insert into public.categories (name, slug, sort_order, is_active) values
  ('Equipo de Protección Personal', 'epp',          1, true),
  ('Señalización y Delimitación',   'senalizacion',  2, true),
  ('Accesorios de Seguridad',       'accesorios',    3, true),
  ('Herramientas y Equipos',        'herramientas',  4, true)
on conflict (slug) do nothing;

-- ============================================================
-- Products — EPP (ids 1–37)
-- ============================================================

-- Seguridad en Alturas
insert into public.products (category_id, name, slug, short_description, description, specs_json, is_active) values
  ((select id from public.categories where slug = 'epp'), 'Arnés de Seguridad 3 Aros',    'arnes-3-aros',       'Arnés para trabajo en alturas con 3 aros',                             'Arnés de seguridad de 3 aros para trabajo en alturas',                                                              '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Arnés V-Form MSA',              'arnes-vform-msa',    'Arnés V-Form Raceform MSA ajuste rápido',                              'Arnés V-Form Raceform con argolla D en espalda, ajuste rápido en piernas, marca MSA',                               '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Línea de Vida Tejida',          'linea-vida-tejida',  'Línea de vida tejida para protección contra caídas',                   'Línea de vida tejida para sistemas de protección contra caídas',                                                    '{}', true)
on conflict (slug) do nothing;

-- Protección de Cabeza
insert into public.products (category_id, name, slug, short_description, description, specs_json, is_active) values
  ((select id from public.categories where slug = 'epp'), 'Casco Ala Ancha MSA',           'casco-ala-ancha-msa',   'Casco Clase E Tipo 1 ala ancha MSA',                               'Casco de seguridad Clase E, Tipo 1, ala ancha, marca MSA. Disponible en varios colores',                            '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Casco Tipo Cachucha MSA',       'casco-cachucha-msa',    'Casco Clase E Tipo 1 tipo cachucha MSA',                           'Casco de seguridad Clase E, Tipo 1, tipo cachucha con suspensión de puntos, marca MSA',                             '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Casco con Matraca MSA',         'casco-matraca-msa',     'Casco ala ancha con ajuste matraca MSA',                           'Casco de seguridad Clase E, Tipo 1, ala ancha con sistema de ajuste matraca, marca MSA',                            '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Barbiquejo para Casco',         'barbiquejo',            'Barbiquejo de sujeción para casco industrial',                     'Barbiquejo de sujeción para casco de seguridad industrial',                                                         '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Cubre Nuca',                    'cubre-nuca',            'Cubre nuca para protección solar en casco',                        'Cubre nuca para protección solar adaptable a casco de seguridad',                                                   '{}', true)
on conflict (slug) do nothing;

-- Protección Ocular / Facial
insert into public.products (category_id, name, slug, short_description, description, specs_json, is_active) values
  ((select id from public.categories where slug = 'epp'), 'Lentes de Seguridad Claros',    'lentes-claros',         'Lentes transparentes Kleenguard / MSA Cooper',                     'Lentes de seguridad transparentes Kleenguard / MSA Cooper para protección ocular',                                  '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Lentes de Seguridad Oscuros',   'lentes-oscuros',        'Lentes con filtro oscuro para exteriores',                         'Lentes de seguridad con filtro oscuro para trabajo en exteriores',                                                  '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Careta para Soldador',          'careta-soldador',       'Careta soldador adaptable a casco MSA cachucha',                   'Careta de soldador adaptable a casco MSA tipo cachucha',                                                            '{}', true)
on conflict (slug) do nothing;

-- Protección Respiratoria
insert into public.products (category_id, name, slug, short_description, description, specs_json, is_active) values
  ((select id from public.categories where slug = 'epp'), 'Mascarilla de Seguridad',       'mascarilla',            'Mascarilla para partículas y vapores',                             'Mascarilla de protección respiratoria para partículas y vapores',                                                   '{}', true)
on conflict (slug) do nothing;

-- Protección Auditiva
insert into public.products (category_id, name, slug, short_description, description, specs_json, is_active) values
  ((select id from public.categories where slug = 'epp'), 'Orejeras de Seguridad',         'orejeras',              'Orejeras para ambientes industriales de alto ruido',               'Orejeras de protección auditiva para ambientes industriales de alto ruido',                                          '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Tapones Auditivos',             'tapones-auditivos',     'Tapones desechables para protección contra ruido',                 'Tapones auditivos desechables para protección contra ruido',                                                        '{}', true)
on conflict (slug) do nothing;

-- Protección de Manos
insert into public.products (category_id, name, slug, short_description, description, specs_json, is_active) values
  ((select id from public.categories where slug = 'epp'), 'Guante de Alto Impacto',        'guante-alto-impacto',       'Guante grado 5 para trabajo pesado industrial',            'Guante de alto impacto grado 5 para trabajo pesado industrial',                                                     '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Guante de Nitrilo Ansell',      'guante-nitrilo-ansell',     'Guante de nitrilo Ansell para químicos y líquidos',        'Guante de nitrilo marca Ansell para manejo de químicos y líquidos',                                                 '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Guante Anticorte Nitrilo',      'guante-anticorte-nitrilo',  'Guante anticorte recubierto nitrilo Truper',               'Guante anticorte recubierto de nitrilo, marca Truper',                                                              '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Guante Anticorte Poliuretano',  'guante-anticorte-pu',       'Guante anticorte recubierto poliuretano Truper',           'Guante anticorte recubierto de poliuretano, marca Truper',                                                          '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Guante para Soldador',          'guante-soldador',           'Guantes largos de carnaza para soldador',                  'Guantes largos reforzados de carnaza para soldador',                                                                '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Guante para Argonero',          'guante-argonero',           'Guantes especializados para soldadura TIG',                'Guantes especializados para soldadura con argón (TIG)',                                                             '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Guante de Látex Uline',         'guante-latex-uline',        'Guantes látex Super Gription marca Uline',                 'Guantes recubiertos de látex Super Gription marca Uline',                                                           '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Guante de Carnaza Pretul',      'guante-carnaza-pretul',     'Guante de carnaza trabajo general Pretul',                 'Guante de carnaza para trabajo general, marca Pretul',                                                              '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Guante de Tela',                'guante-tela',               'Guantes de tela para trabajo ligero',                      'Guantes de tela para trabajo ligero y manejo de materiales',                                                        '{}', true)
on conflict (slug) do nothing;

-- Calzado Industrial
insert into public.products (category_id, name, slug, short_description, description, specs_json, is_active) values
  ((select id from public.categories where slug = 'epp'), 'Bota con Casquillo',            'bota-casquillo',        'Bota de seguridad con casquillo tipo II',                          'Bota de seguridad con casquillo tipo II, diversas tallas disponibles',                                              '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Bota Tipo Petrolera',           'bota-petrolera',        'Bota tipo petrolero para trabajo pesado en campo',                 'Bota de seguridad tipo petrolero para trabajo pesado en campo',                                                     '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Bota Red Wing',                 'bota-red-wing',         'Bota premium Red Wing Shoes modelo 8241',                          'Bota de seguridad premium marca Red Wing Shoes modelo 8241',                                                        '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Bota de Hule',                  'bota-hule',             'Botas impermeables para condiciones húmedas',                      'Botas de hule impermeables para trabajo en condiciones húmedas',                                                    '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Calzado Borceguí',              'calzado-borcegui',      'Calzado borceguí tipo II con punta de polímero',                   'Calzado borceguí de seguridad tipo II con punta de polímero',                                                       '{}', true)
on conflict (slug) do nothing;

-- Ropa de Trabajo
insert into public.products (category_id, name, slug, short_description, description, specs_json, is_active) values
  ((select id from public.categories where slug = 'epp'), 'Overol Retardante al Fuego',    'overol-retardante',         'Overol algodón retardante NRF-006-PEMEX-2011',             'Overol 100% algodón retardante al fuego con cintas reflejantes, norma NRF-006-PEMEX-2011',                          '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Camisa de Mezclilla',           'camisa-mezclilla',          'Camisa mezclilla manga larga 13.5 oz industrial',          'Camisa de mezclilla manga larga 13.5 onzas para uso industrial con bordados de certificaciones',                     '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Pantalón de Mezclilla',         'pantalon-mezclilla',        'Pantalón mezclilla industrial para trabajo pesado',        'Pantalón de mezclilla industrial para trabajo pesado',                                                              '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Impermeable Tipo Gabardina',    'impermeable-gabardina',     'Impermeable gabardina para lluvia en campo',               'Impermeable tipo gabardina para protección contra lluvia en campo',                                                 '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Camisa Algodón Formal',         'camisa-algodon-formal',     'Camisa algodón manga larga corporativa',                   'Camisa de algodón manga larga para uso corporativo con bordados institucionales',                                    '{}', true)
on conflict (slug) do nothing;

-- Alta Visibilidad
insert into public.products (category_id, name, slug, short_description, description, specs_json, is_active) values
  ((select id from public.categories where slug = 'epp'), 'Chaleco Reflejante',            'chaleco-reflejante',    'Chaleco alta visibilidad naranja',                                 'Chaleco de seguridad reflejante naranja de alta visibilidad',                                                       '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Chaleco Tipo Reportero',        'chaleco-reportero',     'Chaleco reportero poliéster con bolsillos',                        'Chaleco tipo reportero de poliéster con múltiples bolsillos',                                                       '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Chaleco Tipo Rescatista',       'chaleco-rescatista',    'Chaleco rojo rescatista con cinta reflejante',                     'Chaleco rojo tipo rescatista con cinta reflejante, unitalla',                                                       '{}', true),
  ((select id from public.categories where slug = 'epp'), 'Chaleco Tipo Brigadista',       'chaleco-brigadista',    'Chaleco brigadista para equipos de emergencia',                    'Chaleco tipo brigadista para equipos de emergencia y respuesta',                                                    '{}', true)
on conflict (slug) do nothing;

-- ============================================================
-- Products — SENALIZACION (ids 38–41)
-- ============================================================
insert into public.products (category_id, name, slug, short_description, description, specs_json, is_active) values
  ((select id from public.categories where slug = 'senalizacion'), 'Cinta Delimitadora Precaución',  'cinta-precaucion',  'Cinta amarilla de precaución para delimitar áreas',   'Cinta delimitadora amarilla de precaución para delimitar áreas de trabajo',  '{}', true),
  ((select id from public.categories where slug = 'senalizacion'), 'Cinta Delimitadora Peligro',     'cinta-peligro',     'Cinta roja de peligro para zonas de alto riesgo',     'Cinta delimitadora roja de peligro para zonas de alto riesgo',               '{}', true),
  ((select id from public.categories where slug = 'senalizacion'), 'Cinta Adherible de Seguridad',   'cinta-adherible',   'Cinta adherible amarilla/negro para pisos',           'Cinta adherible amarilla con negro para señalización de pisos y escalones',  '{}', true),
  ((select id from public.categories where slug = 'senalizacion'), 'Malla Naranja de Seguridad',     'malla-naranja',     'Malla naranja para delimitación de áreas y obras',    'Malla naranja de seguridad para delimitación de áreas y obras',              '{}', true)
on conflict (slug) do nothing;

-- ============================================================
-- Products — ACCESORIOS (ids 42–45)
-- ============================================================
insert into public.products (category_id, name, slug, short_description, description, specs_json, is_active) values
  ((select id from public.categories where slug = 'accesorios'), 'Faja Lumbar',           'faja-lumbar',           'Faja lumbar y abdominal para carga pesada',           'Faja soporte lumbar y abdominal con cinturón extra para carga pesada',   '{}', true),
  ((select id from public.categories where slug = 'accesorios'), 'Rodilleras Industriales','rodilleras-industriales','Rodilleras para trabajo industrial y soldadores',     'Rodilleras de protección para trabajo industrial y soldadores',           '{}', true),
  ((select id from public.categories where slug = 'accesorios'), 'Peto de Carnaza',       'peto-carnaza',          'Peto de carnaza para protección en soldadura',        'Peto de carnaza para protección del torso en soldadura',                  '{}', true),
  ((select id from public.categories where slug = 'accesorios'), 'Mandil Industrial',     'mandil-industrial',     'Mandil de protección para trabajo industrial',        'Mandil de protección para trabajo industrial',                            '{}', true)
on conflict (slug) do nothing;

-- ============================================================
-- Products — HERRAMIENTAS (id 46)
-- ============================================================
insert into public.products (category_id, name, slug, short_description, description, specs_json, is_active) values
  ((select id from public.categories where slug = 'herramientas'), 'Cuerda Industrial 3/4"', 'cuerda-industrial', 'Cuerda industrial 3/4" para uso general en obra', 'Cuerda industrial de 3/4 de pulgada para uso general en obra', '{}', true)
on conflict (slug) do nothing;
