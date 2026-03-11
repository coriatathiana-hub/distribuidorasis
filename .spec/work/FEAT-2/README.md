# FEAT-2: Admin real con Supabase, OTP y seguridad RLS

## Benefit Hypothesis

- **Para**: Administrador comercial SIS que mantiene catalogo y atiende solicitudes.
- **Que**: Necesita operar contenido y datos comerciales en un entorno seguro y persistente.
- **Esta Feature**: Provee autenticacion OTP por email, persistencia real en Supabase y control de acceso por RLS para operaciones administrativas.
- **Esperamos**: Reducir errores operativos y eliminar dependencia de datos locales no persistentes en la gestion del catalogo.
- **Sabremos que hemos tenido éxito cuando**: Se mantenga una tasa de exito CRUD >=95% en admin y 0 accesos no autorizados a operaciones de escritura.

## User Stories

| ID | Title | Priority | Status |
|:---|:------|:---------|:-------|
| HU-2.1 | Provision de Supabase y modelo base con politicas RLS iniciales | High | [x] Completed ✅ (2026-03-10) |
| HU-2.2 | Autenticacion admin por email OTP y proteccion de rutas | High | [x] Completed ✅ (2026-03-10) |
| HU-2.3 | Persistencia real de categorias y productos en panel admin (sin refactor UX mayor) | High | [x] Completed ✅ (2026-03-10) |
| HU-2.4 | UX backoffice admin: rutas dedicadas y layout operativo (incluye eliminacion controlada) | Medium | [ ] Pending |

## Story Definitions and BDD Criteria

### HU-2.1: Provision de Supabase y modelo base con politicas RLS iniciales

- **Como:** Administrador de plataforma.
- **Quiero:** Configurar esquema base en Supabase con politicas de acceso.
- **Para poder:** Asegurar persistencia y seguridad desde el inicio del modulo admin.

**Criterios de aceptacion (BDD)**

1. Esquema base de datos operativo.
   - **Dado que:** El proyecto Supabase esta creado.
   - **Cuando:** Se ejecutan las migraciones iniciales de FEAT-2.
   - **Entonces:** Deben existir tablas `profiles`, `categories`, `products` y relaciones definidas sin errores.

2. Politicas RLS minimas aplicadas.
   - **Dado que:** Las tablas del catalogo ya existen.
   - **Cuando:** Se habilita RLS y se aplican politicas.
   - **Entonces:** `anon` solo puede leer catalogo activo y usuarios admin autenticados pueden ejecutar CRUD.

3. Escenario de error: acceso no autorizado.
   - **Dado que:** Un usuario anonimo intenta escribir en `products`.
   - **Cuando:** Ejecuta `insert`, `update` o `delete`.
   - **Entonces:** El motor debe denegar la operacion por politica RLS.

### HU-2.2: Autenticacion admin por email OTP y proteccion de rutas

- **Como:** Administrador comercial SIS.
- **Quiero:** Iniciar sesion con email + OTP.
- **Para poder:** Acceder al panel admin sin credenciales estaticas ni contraseñas permanentes.

**Criterios de aceptacion (BDD)**

1. Solicitud y validacion OTP.
   - **Dado que:** Estoy en el login admin con un correo permitido.
   - **Cuando:** Solicito y capturo un codigo OTP valido.
   - **Entonces:** Debo iniciar sesion y obtener acceso al panel `/admin`.

2. Proteccion de rutas administrativas.
   - **Dado que:** No tengo sesion valida o no soy admin activo.
   - **Cuando:** Intento acceder a rutas `/admin` o mutaciones protegidas.
   - **Entonces:** Debo ser redirigido a login o recibir denegacion de acceso.

3. Escenario de error: OTP invalido o expirado.
   - **Dado que:** Ingreso un OTP incorrecto o vencido.
   - **Cuando:** Envio la verificacion.
   - **Entonces:** Debe mostrarse error claro y opcion para solicitar un nuevo codigo.

### HU-2.3: Persistencia real de categorias y productos en panel admin (sin refactor UX mayor)

- **Como:** Administrador comercial SIS.
- **Quiero:** Crear, editar y activar/desactivar categorias/productos con almacenamiento real en Supabase.
- **Para poder:** Mantener catalogo actualizado sin perder cambios entre sesiones.

**Criterios de aceptacion (BDD)**

1. CRUD persistente de catalogo.
   - **Dado que:** Estoy autenticado como admin.
   - **Cuando:** Creo o edito una categoria o producto desde el panel.
   - **Entonces:** Los cambios deben guardarse en Supabase y reflejarse en la UI al recargar.

2. Validacion completa de RLS autenticado (cierre pendiente de HU-2.1).
   - **Dado que:** Estoy autenticado como admin activo.
   - **Cuando:** Ejecuto operaciones de escritura sobre `categories` y `products`.
   - **Entonces:** Las operaciones permitidas deben ejecutarse con exito por politicas RLS.

3. Lectura publica consistente del catalogo activo.
   - **Dado que:** Existen productos activos e inactivos en base real.
   - **Cuando:** Un usuario anonimo navega el catalogo publico.
   - **Entonces:** Solo debe visualizar productos/categorias activos permitidos por RLS.

4. Escenario de error: fallo de red o integridad.
   - **Dado que:** Ocurre una falla de conectividad o validacion de datos.
   - **Cuando:** El admin intenta guardar cambios.
   - **Entonces:** Debe mostrarse mensaje de error accionable sin perder el estado del formulario.

### HU-2.4: UX backoffice admin: rutas dedicadas y layout operativo

- **Como:** Administrador comercial SIS.
- **Quiero:** Navegar el admin con rutas separadas por dominio (`/admin/productos`, `/admin/categorias`) y layout tipo backoffice.
- **Para poder:** Operar catalogo con mayor velocidad y claridad en desktop y mobile.

**Criterios de aceptacion (BDD)**

1. Navegacion admin dedicada por modulo.
   - **Dado que:** Estoy autenticado como admin.
   - **Cuando:** Entro al backoffice.
   - **Entonces:** Debo disponer de rutas separadas para productos y categorias, sin depender de tabs en una sola pantalla.

2. Layout operativo responsive.
   - **Dado que:** Uso desktop o mobile.
   - **Cuando:** Navego entre modulos admin.
   - **Entonces:** Debe existir sidebar fija en desktop y menu colapsable en mobile.

3. Listados y acciones por fila.
   - **Dado que:** Visualizo tabla de productos/categorias.
   - **Cuando:** Uso busqueda/filtros y acciones por fila.
   - **Entonces:** Debo poder identificar estado y ejecutar acciones disponibles (ver, editar, activar/desactivar, eliminar).

4. Alta/edicion con baja friccion.
   - **Dado que:** Necesito crear o editar un registro.
   - **Cuando:** Abro el flujo de formulario.
   - **Entonces:** Debe abrirse en modal o drawer lateral con validaciones y mensajes claros.

5. Eliminacion controlada por reglas de integridad.
   - **Dado que:** Estoy autenticado como admin y necesito eliminar datos de prueba o registros obsoletos.
   - **Cuando:** Elimino un producto o una categoria desde su accion por fila.
   - **Entonces:** Debe cumplirse lo siguiente:
     - Producto: se permite hard delete y deben eliminarse en cascada los registros de `product_images` relacionados.
     - Categoria: solo se permite eliminar si no tiene productos asociados; si tiene dependencias, la UI debe mostrar error accionable y no romper el flujo.
     - Nota de alcance HU-2.4: el borrado de objetos binarios en Supabase Storage (`products` bucket) se atiende en FEAT-3.

## Acceptance Criteria (Feature Level)

- [x] El panel admin opera con autenticacion OTP real y control de acceso basado en rol admin activo. ✅ (HU-2.2)
- [ ] El catalogo administrativo persiste en Supabase con politicas RLS aplicadas y verificables.
- [ ] Las operaciones de escritura quedan restringidas a admins autenticados; la lectura publica respeta solo contenido activo.

## Technical Notes

- **Data model impact:** Implementacion inicial de tablas y constraints para `profiles`, `categories`, `products` (+ base para evolucion FEAT-3/4).
- **Security considerations:** RLS obligatorio desde la primera migracion, validacion de `profiles.role='admin'` y `is_active=true`.
- **Dependencies:** Proyecto Supabase creado, claves (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) y habilitacion de Email OTP/redirect URLs.
- **HU-2.4 decision (Option A):** incluir eliminacion controlada en UI admin con reglas de integridad (products hard delete; categories only if no dependencies).

## Out of Scope

- Gestion avanzada de imagenes por producto y reordenamiento de galeria (FEAT-3).
- Limpieza de archivos fisicos en Supabase Storage al eliminar productos (FEAT-3).
- Envio de contacto por email productivo y trazabilidad omnicanal completa (FEAT-4).
