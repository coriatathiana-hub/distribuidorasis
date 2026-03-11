# Product Backlog

> **Project:** distribuidorasis
> **Last updated:** 2026-03-10
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
- **Status:** In Progress
- **Stories:**
  - [x] HU-2.1: Provision de Supabase y modelo base con politicas RLS iniciales ✅ (2026-03-10, commits `65ca105` + `d2c5af9`, evidencias en `.spec/work/FEAT-2/README.md` y `.spec/history/2026-03-10_HU-2.1_completed.md`)
  - [x] HU-2.2: Autenticacion admin por email OTP y proteccion de rutas ✅ (2026-03-10, commits `d2f4213` + `b6ad7f4` + `f6782b5`, evidencias en `.spec/work/FEAT-2/README.md` y `.spec/history/2026-03-10_HU-2.2_completed.md`)
  - [x] HU-2.3: Persistencia real de categorias y productos en panel admin (sin refactor UX mayor) ✅ (2026-03-10, commits `d337e18` + `28ebcc6` + `880cc2a`, evidencias en `.spec/work/FEAT-2/README.md` y `.spec/history/2026-03-10_HU-2.3_completed.md`)
  - [ ] HU-2.4: UX backoffice admin con rutas dedicadas y layout operativo

---

### FEAT-3: Gestion multi-imagen por producto y carrusel en catalogo

- **Hypothesis:** Si entregamos soporte multi-imagen ordenable por producto y carrusel visual en listados/detalle, entonces mejoraremos la evaluacion de producto y calidad de lead, medido por aumento de clicks a contacto desde paginas de producto.
- **Status:** Pending
- **Stories:** _(Se definiran en `@start-feature FEAT-3`)_

---

### FEAT-4: Contacto omnicanal con envio real (Email + WhatsApp)

- **Hypothesis:** Si entregamos un flujo de contacto que envíe solicitudes por correo a ventas y habilite WhatsApp con mensaje contextual, entonces aumentaremos la conversion de interesados a prospectos atendidos, medido por >=40 solicitudes calificadas al mes.
- **Status:** Pending
- **Stories:** _(Se definiran en `@start-feature FEAT-4`)_

---

## Completed

> Stories and Features move here when finished via `@finish-objective`.

- **Feature delivered:** `FEAT-1` — Foundation mobile-first de catalogo y navegacion (2026-03-10)
