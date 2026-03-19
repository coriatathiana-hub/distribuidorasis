# Changelog

> Benefit-oriented history of delivered value.
> Each entry traces back to a User Story and its parent Feature.

---

## Format

```
## [YYYY-MM-DD] — HU-N.M: [Story Title]

**Feature:** FEAT-N — [Feature Name]
**Benefit:** [What value was delivered to the user]
**Changes:**
- [Summary of what was built/changed]
**Tests:** [Number of tests added]
```

---

## [2026-03-18] — HU-5.2: Diferir eliminacion fisica de imagenes en edicion de producto hasta accion explicita de guardar

**Feature:** FEAT-5 — Hardening post-MVP de conversion, edicion y taxonomia de catalogo  
**Benefit:** La edición de productos ahora es más segura frente a errores humanos, porque eliminar imágenes deja de ser una acción destructiva inmediata y se confirma solo al guardar, reduciendo pérdida accidental de contenido.
**Changes:**
- Se cambió `ImageGalleryManager` para que la acción de eliminar marque imágenes como pendientes en estado local en vez de borrar físicamente al instante.
- Se agregó resumen de eliminaciones pendientes con opción de `Deshacer`, y se bloqueó reordenamiento mientras existan pendientes para evitar inconsistencias.
- Se conectó `ProductManager` con un handle imperativo de galería para ejecutar borrado físico únicamente al presionar `Guardar cambios`.
- Se mantuvo `upload` y `cover` operativos, pero el delete ahora sigue flujo de confirmación explícita del formulario.
- Se añadió cobertura de regresión para validar: no-save/no-delete, cancel sin persistir y commit físico al guardar.
**Tests:** 3 nuevos tests (`app/src/test/product-manager-edit-gallery-deferred-delete.test.tsx`) + ajustes en `admin-image-gallery-manager`

---

## [2026-03-18] — HU-5.1: Restringir acceso admin por modulo para usuario de conversiones

**Feature:** FEAT-5 — Hardening post-MVP de conversion, edicion y taxonomia de catalogo  
**Benefit:** El equipo comercial ahora puede operar con principio de minimo privilegio en el backoffice, permitiendo acceso exclusivo a Conversiones para usuarios restringidos sin romper la operacion de admins legacy.
**Changes:**
- Se agregó `allowed_modules` al modelo `profiles` con migración `008_profiles_module_permissions.sql` y validación de dominio permitido (`productos`, `categorias`, `conversion`).
- Se actualizó la capa de auth y tipos de Supabase para soportar permisos por módulo con fallback compatible (`null` = full access legacy).
- Se reforzó `AdminRouteGuard` para denegar módulos no autorizados, redirigir a una ruta permitida y mostrar feedback de acceso denegado.
- Se filtró el `AdminSidebar` por permisos efectivos, mostrando solo las secciones habilitadas para cada perfil admin.
- Se extendió cobertura de regresión para ruta protegida, filtrado de menú y contrato de migración.
**Tests:** 5 escenarios nuevos sobre suites existentes (`admin-route-guard`, `admin-layout-routes`, `supabase-schema-contract`)

---

## [2026-03-18] — HU-5.4: Actualizar branding legal en footer a razon social completa

**Feature:** FEAT-5 — Hardening post-MVP de conversion, edicion y taxonomia de catalogo  
**Benefit:** El contenido institucional ahora refleja la razon social legal requerida en paginas clave, reduciendo riesgo de inconsistencia legal/comercial y reforzando claridad de marca para usuarios finales.  
**Changes:**
- Se actualizo la razon social en `Privacidad` a `SUMINISTROS INDUSTRIALES DE SEGURIDAD PRIVADA SIS, S.A. DE C.V.`.
- Se actualizo la apertura editorial en `Nosotros` para iniciar con la razon social completa solicitada.
- Se incorporó ajuste de formato en negritas para destacar el nombre legal sin alterar el mensaje base.
- Se agrego prueba de regresion para validar copy legal en `Privacidad` y `Nosotros`, incluyendo caso con texto dividido por elementos inline.
- Se documentaron referencias residuales de `Distribuidora SIS` fuera del alcance de HU-5.4 como deuda controlada.
**Tests:** 2 passing tests (`app/src/test/branding-legal-copy.test.tsx`)

---

## [2026-03-18] — HU-5.5: Corregir bug de navegacion para iniciar cada cambio de pagina en la parte superior

**Feature:** FEAT-5 — Hardening post-MVP de conversion, edicion y taxonomia de catalogo  
**Benefit:** La navegacion publica ahora inicia consistentemente en la parte superior de cada pagina destino, reduciendo friccion de lectura en paginas largas y mejorando orientacion del usuario al cambiar de ruta.  
**Changes:**
- Se agrego `ScrollToTop` para resetear posicion en cambios de ruta dentro del arbol de `BrowserRouter`.
- Se integró la logica en `App.tsx` sin afectar layouts public/admin.
- Se preservo comportamiento de anclas (`#hash`) para no romper navegacion contextual dentro de pagina.
- Se agrego cobertura de regresion para scroll-top en navegacion normal y exclusion de hash navigation.
**Tests:** 2 nuevos tests (`app/src/test/navigation-scroll-top.test.tsx`) + verificacion de suite `navigation.test.tsx` (3 passing)

---

## [2026-03-11] — HU-4.4: Dashboard admin de conversion omnicanal para explotar `contact_requests` + `whatsapp_cta_attempts`

**Feature:** FEAT-4 — Contacto omnicanal con envio real (Email + WhatsApp)  
**Benefit:** El equipo comercial ahora puede inspeccionar conversion omnicanal desde backoffice con KPIs y eventos filtrables, priorizando seguimiento y detectando fricciones por canal sin salir del panel admin.  
**Changes:**
- Se implemento `admin-conversion-service` para consolidar `contact_requests` y `whatsapp_cta_attempts` en un read model de KPIs + eventos con filtros por fecha/canal/estado.
- Se agrego modulo `/admin/conversion` con `ConversionDashboard` (cards KPI, tabla unificada, estado vacio, error recuperable con reintento).
- Se integró navegación en sidebar para Conversión y se reubicó `Cerrar sesión` junto al correo del admin para mantener accesibilidad operativa en vistas largas.
- Se actualizaron `docs/TECH_SPEC.md` y `docs/SETUP.md` con modelo de datos WhatsApp CTA, ruta admin nueva y checklist de validación HU-4.4.
**Tests:** 17 passing tests ejecutados para HU-4.4 (`admin-conversion-service.test.ts`, `admin-conversion-dashboard.test.tsx`, `admin-layout-routes.test.tsx`)

---

## [2026-03-11] — HU-4.3: CTA de WhatsApp con mensaje contextual y registro minimo de intentos

**Feature:** FEAT-4 — Contacto omnicanal con envio real (Email + WhatsApp)  
**Benefit:** El flujo de conversion por WhatsApp ahora es consistente y contextual en vistas clave, con trazabilidad minima de intentos y feedback recuperable cuando el deeplink no puede abrirse.  
**Changes:**
- Se centralizo la construccion de deeplink y mensaje prellenado de WhatsApp para evitar divergencias entre rutas publicas.
- Se incorporo CTA contextual en `Producto` y se alineo el comportamiento del boton flotante y la tarjeta de contacto con tracking uniforme.
- Se agrego fallback UX con toast accionable cuando `window.open` es bloqueado por el navegador, manteniendo alternativa inmediata por formulario.
- Se implemento persistencia de intentos en `whatsapp_cta_attempts` (migracion `007`) con RLS (`anon` insert, admin select) e indices operativos.
- Se documentaron prerequisitos de despliegue para la migracion `007` en `docs/SETUP.md`.
**Tests:** 6 nuevos tests (3 archivos): `whatsapp-cta.test.ts` (3), `whatsapp-cta.test.tsx` (2), `producto-page.test.tsx` (1)

---

## [2026-03-11] — HU-4.2: Formulario publico de contacto con validaciones y feedback UX mobile-first

**Feature:** FEAT-4 — Contacto omnicanal con envio real (Email + WhatsApp)  
**Benefit:** La experiencia de solicitud ahora es mas robusta en mobile y desktop, con validaciones accionables, proteccion contra envios duplicados y manejo recuperable de fallos/timeout sin perder datos del usuario.  
**Changes:**
- Se robustecio `contact-service` con timeout explicito de envio y mapeo de errores de gateway/timeout/red a mensajes accionables.
- Se reforzo `Contacto.tsx` con guard de doble submit y estado de formulario `aria-busy` durante requests en vuelo.
- Se amplio la matriz de pruebas de contacto para cubrir validaciones invalidas, comportamiento en error recuperable y bloqueo de submit duplicado.
- Se alinearon colores de error del sistema de formularios a `amber` del tema para mantener consistencia visual corporativa.
**Tests:** 12 passing tests en suite de contacto (`app/src/test/contact-service.test.ts` + `app/src/test/contacto-submit.test.tsx`) / +4 escenarios sobre la base de HU-4.1

---

## [2026-03-11] — HU-4.1: Envio real de solicitudes por email con persistencia y trazabilidad en `contact_requests`

**Feature:** FEAT-4 — Contacto omnicanal con envio real (Email + WhatsApp)  
**Benefit:** El sitio ahora captura solicitudes reales de prospectos con persistencia en `contact_requests` y notificacion transaccional a ventas, reduciendo friccion operativa entre intencion de compra y atencion comercial.  
**Changes:**
- Se implemento DAL de contacto (`contact-service`) para mapear payload, invocar la Edge Function y normalizar errores para UX recuperable.
- Se conecto `Contacto.tsx` a envio real (sin simulacion), manteniendo estado de carga, feedback de exito y conservacion de datos en error para reintento.
- Se agrego Edge Function `send-contact-email` para insertar en `public.contact_requests` y despachar correo por Resend con response contract seguro (`success`, `requestId`, `emailId`).
- Se documentaron requisitos runtime para invocacion publica (`verify_jwt=false`) y secretos necesarios en setup operativo.
**Tests:** 8 passing tests (`app/src/test/contact-service.test.ts` y `app/src/test/contacto-submit.test.tsx`) / 2 archivos de pruebas agregados

---

## [2026-03-10] — HU-1.1: Navegacion mobile-first y estructura base de experiencia

**Feature:** FEAT-1 — Foundation mobile-first de catalogo y navegacion  
**Benefit:** Mejor navegacion mobile-first con estado activo consistente y recuperacion clara ante rutas invalidas, reduciendo friccion en exploracion de catalogo.  
**Changes:**
- Se reforzo el `Header` para estado activo correcto de rutas (incluyendo `end` en inicio) y menu mobile accesible.
- Se mejoro `NotFound` con CTAs de retorno a Inicio y Catalogo.
- Se fijo el tema corporativo `theme-1` y se removio el selector de temas por decision de producto.
- Se renombro la carpeta base de trabajo de `prototype` a `app` y se ajustaron referencias documentales.
**Tests:** 3 passing tests (`app/src/test/navigation.test.tsx`) / 1 archivo de pruebas agregado

## [2026-03-10] — HU-1.2: Catalogo responsive con busqueda, filtros y estados UX

**Feature:** FEAT-1 — Foundation mobile-first de catalogo y navegacion  
**Benefit:** Acelera descubrimiento de productos con filtros claros y busqueda usable en mobile/desktop, reduciendo friccion antes de contacto comercial.  
**Changes:**
- Se introdujo `catalog-service` para desacoplar la UI del dataset estatico y facilitar migracion a Supabase.
- Se mejoro la experiencia de filtros con accion de `Limpiar filtros` y estado vacio accionable.
- Se simplifico el flujo de resultados en catalogo manteniendo contador coherente por busqueda/categoria.
- Se añadieron polyfills de test para estabilidad de componentes Radix Select en entorno jsdom.
**Tests:** 3 passing tests (`app/src/test/catalogo-filters.test.tsx`) / 1 archivo de pruebas agregado

## [2026-03-10] — HU-1.3: Detalle de producto con informacion accionable y CTA a contacto

**Feature:** FEAT-1 — Foundation mobile-first de catalogo y navegacion  
**Benefit:** Mejora la conversion a contacto desde detalle de producto al llevar contexto directo del item seleccionado y reducir friccion de navegacion.  
**Changes:**
- Se reforzo `Producto` con navegacion contextual (breadcrumb + regreso a catalogo) y estado no encontrado accionable.
- Se implemento CTA a contacto con contexto de producto via query params (`productoId` y `producto`).
- Se actualizo `Contacto` para reconocer el contexto de origen y precargar tipo de requerimiento/mensaje.
- Se agrego cobertura de pruebas para detalle valido, breadcrumb y producto inexistente.
**Tests:** 3 passing tests (`app/src/test/producto-detalle.test.tsx`) / 1 archivo de pruebas agregado

## [2026-03-10] — HU-2.1: Provision de Supabase y modelo base con politicas RLS iniciales

**Feature:** FEAT-2 — Admin real con Supabase, OTP y seguridad RLS  
**Benefit:** Establece la base de persistencia y seguridad real del producto: esquema versionado en migraciones, RLS activo por defecto y cliente tipado listo para las siguientes historias.  
**Changes:**
- Migraciones SQL `001` (schema) y `002` (RLS) creadas en `supabase/migrations/` con tablas `profiles`, `categories`, `products`, `product_images` y `contact_requests`.
- Politicas RLS: `anon` con acceso de solo lectura a catalogo activo e insert en `contact_requests`; `authenticated admin` con CRUD completo validado por `profiles.role='admin'`.
- Cliente Supabase tipado (`app/src/lib/supabase/client.ts`) con contrato Database en `app/src/types/supabase.ts`.
- Seed de desarrollo (`supabase/seed.sql`) con 46 productos y 4 categorias usando subqueries por slug (portable entre entornos).
- `.env.example` documentado con todas las variables requeridas por FEAT-2/4.
- `docs/SETUP.md` y `docs/TECH_SPEC.md` actualizados con artefactos reales de migracion y estructura de carpetas.
- Validacion `authenticated admin` diferida a HU-2.2 (requiere Email OTP activo).
**Tests:** 28 passing tests (`app/src/test/supabase-schema-contract.test.ts`) / 1 archivo de pruebas agregado (37/37 suite total)

## [2026-03-10] — HU-2.3: Persistencia real de categorias y productos en panel admin

**Feature:** FEAT-2 — Admin real con Supabase, OTP y seguridad RLS  
**Benefit:** El administrador puede crear, editar y activar/desactivar categorías y productos con persistencia real en Supabase, y el catálogo público refleja inmediatamente los cambios sin recompilación, eliminando la dependencia de datos locales estáticos.  
**Changes:**
- Se implementó DAL admin (`admin-catalog-service.ts`) con CRUD completo para `categories` y `products` con manejo de errores por código (23505 para duplicados).
- Se refactorizaron `CategoryManager.tsx` y `ProductManager.tsx` para leer/escribir en Supabase con estados de loading, error, dialogs de creación/edición y toggle optimista.
- Se implementó DAL público (`public-catalog-service.ts`) con queries `is_active=true` y join con `categories` y `product_images` para cover image.
- Se conectaron `Catalogo.tsx`, `Producto.tsx`, `ProductCard.tsx` y `ProductFilters.tsx` al datasource real de Supabase, eliminando la dependencia del mock local `data/products.ts`.
- Se agregó `slugify()` a `utils.ts` (normalización NFD para acentos españoles).
- Se corrigió omisión del constraint `UNIQUE` en `products.name` (migración `005_products_name_unique.sql`).
- Se introdujo `ADR-004`: patrón de split DAL público/admin para catálogo.
**Tests:** 34 nuevos (total: 83 passing / +1 test de error state en catálogo)

## [2026-03-10] — HU-2.4: UX backoffice admin con rutas dedicadas y layout operativo

**Feature:** FEAT-2 — Admin real con Supabase, OTP y seguridad RLS
**Benefit:** El administrador puede operar el catálogo desde rutas independientes con un layout tipo backoffice — sidebar fija en desktop y menú colapsable en mobile — y eliminar productos y categorías con confirmación y reglas de integridad, sin depender de tabs en una sola pantalla.
**Changes:**
- Se introdujo routing anidado con `AdminLayout` (sidebar + Outlet) separando el backoffice del layout público.
- `AdminSidebar` con navegación activa (Productos / Categorías), email de admin y botón de cierre de sesión.
- Rutas dedicadas `/admin/productos` y `/admin/categorias` con redirect automático desde `/admin`.
- `/admin/login` ahora es standalone (sin header/footer público).
- DAL extendido: `deleteProduct()` (hard delete — cascade sobre `product_images`) y `deleteCategory()` (falla con error accionable si tiene productos, código FK 23503).
- `AlertDialog` de confirmación antes de cualquier eliminación en `ProductManager` y `CategoryManager`.
- `docs/TECH_SPEC.md` actualizado con estructura de rutas del backoffice y tabla de routing.
- `docs/SETUP.md` con 5 nuevos ítems en checklist de validación operativa.
**Tests:** 21 nuevos (83 → 104 passing); nuevo archivo `admin-layout-routes.test.tsx` (10 tests)

---

**🎯 FEAT-2 Delivered** — Admin real con Supabase, OTP y seguridad RLS (HU-2.1 → HU-2.4, 2026-03-10)

---

## [2026-03-10] — HU-2.2: Autenticacion admin por email OTP y proteccion de rutas

**Feature:** FEAT-2 — Admin real con Supabase, OTP y seguridad RLS  
**Benefit:** Habilita acceso administrativo real y seguro con OTP por correo y control de rutas por rol activo, eliminando el acceso abierto al panel `/admin`.  
**Changes:**
- Se implemento capa de autenticacion en `app/src/lib/supabase/auth.ts` con `requestOtp`, `verifyOtp`, `signOutAdmin` y validacion de perfil admin activo.
- Se agrego UI de login OTP mobile-first en `app/src/components/admin/AdminOtpLogin.tsx` y ruta `app/src/pages/AdminLogin.tsx`.
- Se protegieron rutas con `app/src/components/admin/AdminRouteGuard.tsx` y se actualizo `app/src/App.tsx` para separar `/admin/login` de `/admin`.
- Se reforzo `app/src/pages/Admin.tsx` con cierre de sesion y contexto de usuario autenticado.
- Se corrigio bloqueo de autorizacion por recursividad de politicas RLS en `profiles` mediante migracion `supabase/migrations/004_fix_profiles_policy_recursion.sql`.
- Se agrego script operacional `supabase/auth-user.sql` como referencia para alta/upsert de admins en `public.profiles`.
- Se actualizaron `docs/SETUP.md` y `docs/TECH_SPEC.md` con requisitos OTP y trazabilidad de nuevas migraciones.
**Tests:** 11 passing tests (`app/src/test/admin-auth.test.tsx` + `app/src/test/admin-route-guard.test.tsx`) y 2 nuevos tests de contrato RLS (49/49 suite total)

## [2026-03-11] — HU-3.1: Persistencia y reglas de negocio para galerias multi-imagen por producto

**Feature:** FEAT-3 — Gestion multi-imagen por producto y carrusel en catalogo  
**Benefit:** Se asegura integridad y consistencia de la galeria de imagenes por producto (orden deterministico + portada unica), reduciendo errores de datos y dejando la base lista para la UI admin y carrusel publico de FEAT-3.  
**Changes:**
- Se agrego migracion `006_product_images_gallery_rules.sql` con constraints de calidad (`sort_order >= 0`, `public_url/storage_path` no vacios), indice unico por posicion y regla de una sola portada por producto.
- Se extendio `admin-catalog-service.ts` con operaciones de galeria: `listProductImages`, `addProductImage`, `setProductImageCover` y `deleteProductImage` (incluyendo limpieza best-effort en Storage).
- Se extendio `public-catalog-service.ts` para exponer `images[]` ordenadas y `cover_image_url` derivada de `is_cover` o fallback al primer elemento.
- Se actualizaron tipos en `supabase.ts` (`InsertProductImage`, `UpdateProductImage`) y pruebas existentes para mantener compatibilidad del contrato `PublicProduct`.
- Se actualizo `docs/SETUP.md` con la migracion 006 y su trazabilidad de infraestructura.
**Tests:** 24 nuevos tests de contrato (12 en `supabase-schema-contract.test.ts` + 12 en `admin-catalog-service.test.ts`), suite total en verde: 126/126.

## [2026-03-11] — HU-3.2: Flujo admin para cargar, ordenar y marcar portada de imagenes

**Feature:** FEAT-3 — Gestion multi-imagen por producto y carrusel en catalogo  
**Benefit:** El equipo comercial ya puede gestionar galerias visuales reales desde el backoffice (carga, orden y portada) con validaciones accionables, reduciendo dependencia de operaciones manuales en base de datos y mejorando consistencia del catalogo.  
**Changes:**
- Se integró `ImageGalleryManager` en el flujo de edición de `ProductManager` para operar imágenes por producto desde la UI admin.
- Se implementó carga real a Supabase Storage + persistencia en `product_images` con rollback best-effort de objetos huérfanos si falla el insert.
- Se agregó verificación explícita de sesión/perfil admin antes de upload y mapeo de errores RLS (`42501`) a mensajes accionables para operación.
- Se implementó persistencia de reordenamiento y portada con operaciones idempotentes y normalización de posiciones después de eliminación.
- Se añadió cobertura de pruebas para escenarios de carga inválida/válida mixta, reordenamiento, portada, eliminación y contratos DAL.
- Se documentó en `SETUP.md` el prerrequisito crítico de políticas `storage.objects` del bucket `products` para evitar bloqueos por RLS en ambiente.
**Tests:** 26 nuevos tests (suite total: 152/152 en verde).

## [2026-03-11] — HU-3.3: Carrusel publico en listado y detalle con enfoque mobile-first

**Feature:** FEAT-3 — Gestion multi-imagen por producto y carrusel en catalogo  
**Benefit:** Los compradores pueden evaluar mejor cada producto desde mobile y desktop con una galeria navegable, orden consistente de imagenes y fallback visual estable, mejorando la confianza antes del contacto comercial.  
**Changes:**
- Se implemento `ProductGallery` para detalle con navegacion por flechas y dots, respetando portada/orden del admin y manteniendo accesibilidad en mobile.
- Se actualizo `Producto.tsx` para consumir `images[]` desde el contrato publico, eliminando dependencia de una sola URL de portada.
- Se simplifico `ProductCard` para mostrar portada como imagen principal en listado con fallback seguro ante error de carga.
- Se refinó la UX del carrusel con controles mas discretos y menor ruido visual tras feedback de usuario.
- Se agrego cobertura de pruebas para escenarios de galeria en detalle y fallback de portada en listado.
**Tests:** 2 nuevos tests (suite total: 154/154 en verde).
