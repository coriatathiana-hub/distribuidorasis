# Product Backlog

> **Project:** distribuidorasis
> **Last updated:** 2026-03-18
>
> This is the **Single Source of Truth** for the SAFe hierarchy.
> Structure: Epic → Feature (FEAT-N) → User Story (HU-N.M)

---

## Epic: distribuidorasis MVP

> Convertir el sitio corporativo en una aplicacion mobile-first operable en produccion que capture y gestione oportunidades comerciales con seguridad y persistencia real.

---

### FEAT-1: Foundation mobile-first de catalogo y navegacion

- **Hypothesis:** Si entregamos una experiencia de catalogo mobile-first con navegacion y filtros optimizados, entonces incrementaremos el consumo de productos desde campo para residentes y compradores, medido por sesiones mobile con >=3 vistas de producto.
- **Status:** Delivered ✅ (2026-03-10)
- **Stories:**
  - [x] HU-1.1: Navegacion mobile-first y estructura base de experiencia ✅ (2026-03-10, commits `e3d736e` + `57fe235`, evidencias en `.spec/work/FEAT-1/README.md` y `.spec/history/2026-03-10_HU-1.1_completed.md`)
  - [x] HU-1.2: Catalogo responsive con busqueda, filtros y estados UX ✅ (2026-03-10, commits `48e0118` + cierre docs, evidencias en `.spec/work/FEAT-1/README.md` y `.spec/history/2026-03-10_HU-1.2_completed.md`)
  - [x] HU-1.3: Detalle de producto con informacion accionable y CTA a contacto ✅ (2026-03-10, commits `720c6f7` + cierre docs, evidencias en `.spec/work/FEAT-1/README.md` y `.spec/history/2026-03-10_HU-1.3_completed.md`)

---

### FEAT-2: Admin real con Supabase, OTP y seguridad RLS

- **Hypothesis:** Si entregamos un panel de administracion autenticado por OTP y persistencia en Supabase con RLS, entonces reduciremos errores operativos y dependencia de cambios manuales, medido por tasa de exito CRUD >=95%.
- **Status:** Delivered ✅ (2026-03-10)
- **Stories:**
  - [x] HU-2.1: Provision de Supabase y modelo base con politicas RLS iniciales ✅ (2026-03-10, commits `65ca105` + `d2c5af9`, evidencias en `.spec/work/FEAT-2/README.md` y `.spec/history/2026-03-10_HU-2.1_completed.md`)
  - [x] HU-2.2: Autenticacion admin por email OTP y proteccion de rutas ✅ (2026-03-10, commits `d2f4213` + `b6ad7f4` + `f6782b5`, evidencias en `.spec/work/FEAT-2/README.md` y `.spec/history/2026-03-10_HU-2.2_completed.md`)
  - [x] HU-2.3: Persistencia real de categorias y productos en panel admin (sin refactor UX mayor) ✅ (2026-03-10, commits `d337e18` + `28ebcc6` + `880cc2a`, evidencias en `.spec/work/FEAT-2/README.md` y `.spec/history/2026-03-10_HU-2.3_completed.md`)
  - [x] HU-2.4: UX backoffice admin con rutas dedicadas y layout operativo (incluye eliminacion controlada: products hard delete, categories sin dependencias) ✅ (2026-03-10, commits `f95f046` + `f5d24a6` + `c0926c8` + `8096214`, evidencias en `.spec/work/FEAT-2/README.md` y `.spec/history/2026-03-10_HU-2.4_completed.md`)

---

### FEAT-3: Gestion multi-imagen por producto y carrusel en catalogo

- **Hypothesis:** Si entregamos soporte multi-imagen ordenable por producto y carrusel visual en listados/detalle, entonces mejoraremos la evaluacion de producto y calidad de lead, medido por aumento de clicks a contacto desde paginas de producto.
- **Status:** Delivered ✅ (2026-03-11)
- **Stories:**
  - [x] HU-3.1: Persistencia y reglas de negocio para galerias multi-imagen por producto ✅ (2026-03-11, commits `b93f5e8` + `08101ae` + `7b75860` + `1cd3961` + `33b8193`, evidencias en `.spec/history/2026-03-11_HU-3.1_completed.md`)
  - [x] HU-3.2: Flujo admin para cargar, ordenar y marcar portada de imagenes ✅ (2026-03-11, commits `640a0f4` + cierre docs, evidencias en `.spec/history/2026-03-11_HU-3.2_completed.md`)
  - [x] HU-3.3: Carrusel publico en listado y detalle con enfoque mobile-first ✅ (2026-03-11, commits `5cbd6a2` + `58b37b5` + `c203835` + `444ef78`, evidencias en `.spec/history/2026-03-11_HU-3.3_completed.md`)

---

### FEAT-4: Contacto omnicanal con envio real (Email + WhatsApp)

- **Hypothesis:** Si entregamos un flujo de contacto que envíe solicitudes por correo a ventas y habilite WhatsApp con mensaje contextual, entonces aumentaremos la conversion de interesados a prospectos atendidos, medido por >=40 solicitudes calificadas al mes.
- **Status:** Delivered ✅ (2026-03-11)
- **Stories:**
  - [x] HU-4.1: Envio real de solicitudes por email con persistencia y trazabilidad en `contact_requests` ✅ (2026-03-11, commit `d5cbde7`, evidencias en `.spec/history/2026-03-11_HU-4.1_completed.md`)
  - [x] HU-4.2: Formulario publico de contacto con validaciones y feedback UX mobile-first ✅ (2026-03-11, commit `14ed984`, evidencias en `.spec/history/2026-03-11_HU-4.2_completed.md`)
  - [x] HU-4.3: CTA de WhatsApp con mensaje contextual y registro minimo de intentos ✅ (2026-03-11, commit `cae8161`, evidencias en `.spec/history/2026-03-11_HU-4.3_completed.md`)
  - [x] HU-4.4: Dashboard admin de conversion omnicanal para explotar `contact_requests` + `whatsapp_cta_attempts` (cards KPI, tabla y filtros) ✅ (2026-03-11, commits `c5bea36` + `94f87b4` + `03db3ae` + `a551ffc`, evidencias en `.spec/history/2026-03-11_HU-4.4_completed.md`)

---

### FEAT-5: Hardening post-MVP de conversion, edicion y taxonomia de catalogo

- **Hypothesis:** Si endurecemos conversiones con control de acceso por modulo, edicion transaccional de imagenes, taxonomia multi-categoria, navegacion consistente y branding legal, entonces reduciremos incidentes operativos y mejoraremos trazabilidad comercial, medido por menor tasa de errores de edicion y mayor cobertura de conversiones registradas.
- **Para:** Equipo comercial y operacion admin de SIS
- **Que:** busca mayor control de conversiones y seguridad operativa al editar productos
- **Esta epica:** provee mejoras post-MVP en control de acceso admin, UX transaccional de imagenes, taxonomia multi-categoria, correccion de navegacion y consistencia de marca
- **Esperamos:** reducir errores de operacion en backoffice y mejorar visibilidad de conversiones para toma de decisiones
- **Sabremos que hemos tenido exito cuando:** se reduzcan incidentes de edicion reportados y aumente la trazabilidad de conversiones email en dashboard admin
- **Status:** In Progress 🚧 (2026-03-18)
- **Stories:**
  - [x] HU-5.1: Restringir acceso admin por modulo para usuario de conversiones (`ventas@distribuidorasis.com.mx`) ✅ (2026-03-18, commits `076ba4f` + cierre docs, evidencias en `.spec/history/2026-03-18_HU-5.1_completed.md`)
    - Como: Administrador principal
    - Quiero: definir permisos por subseccion del admin (Categorias, Productos, Conversiones)
    - Para poder: permitir que `ventas@distribuidorasis.com.mx` acceda solo a Conversiones sin acceso a Catalogo
    - Criterios iniciales:
      - Incorporar un atributo de autorizacion por modulo en alta/gestion de usuarios admin.
      - `ventas@distribuidorasis.com.mx` solo puede abrir `/admin/conversion` y no puede abrir `/admin/productos` ni `/admin/categorias`.
      - Si intenta navegar manualmente a un modulo no permitido, el sistema redirige y muestra feedback de acceso denegado.
      - Mantener compatibilidad con admins full-access actuales.
  - [ ] HU-5.2: Diferir eliminacion fisica de imagenes en edicion de producto hasta accion explicita de guardar
    - Como: Operador de catalogo
    - Quiero: que borrar una imagen durante la edicion solo marque el cambio localmente
    - Para poder: evitar perdida accidental de contenido antes de confirmar el formulario
    - Criterios iniciales:
      - Las imagenes marcadas para eliminar no se borran en DB/storage hasta `Guardar`.
      - Si el usuario cancela o abandona, el estado persistido no cambia.
      - El resumen de cambios muestra imagenes pendientes de eliminacion antes de confirmar.
  - [ ] HU-5.3: Permitir relacion producto multi-categoria con migracion de modelo y UI admin/publica
    - Como: Admin de catalogo
    - Quiero: asociar un producto a mas de una categoria
    - Para poder: representar mejor el catalogo y mejorar descubrimiento por distintos criterios
    - Criterios iniciales:
      - Definir tabla pivote `product_categories` y estrategia de migracion desde modelo 1:N actual.
      - Ajustar CRUD admin para seleccionar multiples categorias por producto.
      - Mantener compatibilidad en listados/filtros publicos y en consultas de detalle.
      - Actualizar reglas RLS/constraints para evitar inconsistencias y duplicados.
    - **Riesgo:** Alto 🔴 (impacta modelo de datos, consultas existentes y flujos de filtrado)
  - [x] HU-5.4: Actualizar branding legal en footer a razon social completa ✅ (2026-03-18, commits `6666c8a` + `fd95024` + cierre docs, evidencias en `.spec/history/2026-03-18_HU-5.4_completed.md`)
    - Como: Usuario visitante y area legal/comercial
    - Quiero: ver la razon social completa de la empresa en el sitio
    - Para poder: asegurar consistencia legal y de marca en la presentacion corporativa
    - Criterios iniciales:
      - En la página "Aviso de Privacidad", reemplazar  `SUMINISTROS INDUSTRIALES Y DE SEGURIDAD SIS, S.A. DE C.V.` por `SUMINISTROS INDUSTRIALES DE SEGURIDAD PRIVADA SIS, S.A. DE C.V.`
      - En la página "Nosotros", reemplazar "Somos una comercializadora especializada ..." por "Suministros Industriales de Seguridad Privada SIS, S.A. de C.V. es una comercializadora especializada ..."
      - Verificar consistencia en vistas mobile y desktop.
      - Validar que no existan otras referencias desactualizadas del nombre comercial.
  - [x] HU-5.5: Corregir bug de navegacion para iniciar cada cambio de pagina en la parte superior ✅ (2026-03-18, commits `c4130be` + cierre docs, evidencias en `.spec/history/2026-03-18_HU-5.5_completed.md`)
    - Como: Usuario visitante
    - Quiero: que al navegar entre paginas el scroll inicie desde arriba
    - Para poder: visualizar de inmediato el encabezado y contexto de la pagina destino
    - Criterios iniciales:
      - Al navegar entre rutas del sitio (ej. desde Inicio hacia Aviso de Privacidad), la vista se posiciona en el top de la nueva pagina.
      - El comportamiento aplica de forma consistente en desktop y mobile.
      - Evitar regresiones de UX en paginas largas donde el usuario venga desde un scroll profundo.

---

## Completed

> Stories and Features move here when finished via `@finish-objective`.

- **Feature delivered:** `FEAT-1` — Foundation mobile-first de catalogo y navegacion (2026-03-10)
- **Feature delivered:** `FEAT-2` — Admin real con Supabase, OTP y seguridad RLS (2026-03-10)
- **Feature delivered:** `FEAT-3` — Gestion multi-imagen por producto y carrusel en catalogo (2026-03-11)
- **Feature delivered:** `FEAT-4` — Contacto omnicanal con envio real (Email + WhatsApp) (2026-03-11)
