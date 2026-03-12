# FEAT-3: Gestion multi-imagen por producto y carrusel en catalogo

## Benefit Hypothesis

- **Para**: Compradores y residentes de obra que evalúan productos desde mobile, y administrador comercial SIS que mantiene el contenido visual.
- **Que**: Buscan revisar rapidamente variantes visuales de cada producto y mantener galerias actualizadas sin friccion operativa.
- **Esta Feature**: Provee gestion multi-imagen ordenable por producto en admin, con imagen de portada y carrusel reutilizable en listado/detalle publico.
- **Esperamos**: Mejorar la evaluacion de producto, elevar la calidad del lead y reducir retrabajo operativo al administrar activos visuales.
- **Sabremos que hemos tenido éxito cuando**: Aumenten los clicks a contacto desde paginas de producto y la tasa de errores en operaciones de galeria admin se mantenga <=5%.

## User Stories

| ID | Title | Priority | Status |
|:---|:------|:---------|:-------|
| HU-3.1 | Persistencia y reglas de negocio para galerias multi-imagen por producto | High | [ ] Pending |
| HU-3.2 | Flujo admin para cargar, ordenar y marcar portada de imagenes | High | [ ] Pending |
| HU-3.3 | Carrusel publico en listado y detalle con enfoque mobile-first | High | [ ] Pending |

## Story Definitions and BDD Criteria

### HU-3.1: Persistencia y reglas de negocio para galerias multi-imagen por producto

- **Como:** Administrador comercial SIS.
- **Quiero:** Persistir multiples imagenes por producto con orden y una portada unica.
- **Para poder:** Mantener una galeria consistente reutilizable entre backoffice y catalogo publico.

**Criterios de aceptacion (BDD)**

1. Persistencia de metadatos de galeria.
   - **Dado que:** Existe un producto valido en `products`.
   - **Cuando:** Se registran imagenes en `product_images` con `sort_order` y `is_cover`.
   - **Entonces:** Las imagenes deben quedar asociadas al producto y recuperarse en el mismo orden configurado.

2. Regla de portada unica por producto.
   - **Dado que:** Un producto ya tiene una imagen marcada como portada.
   - **Cuando:** El admin marca otra imagen como portada.
   - **Entonces:** El sistema debe dejar una sola imagen con `is_cover=true` para ese producto.

3. Escenario de error: activo visual invalido o no accesible.
   - **Dado que:** Se intenta guardar una imagen con URL/public path invalido o recurso no disponible.
   - **Cuando:** Se confirma la operacion de guardado.
   - **Entonces:** Debe rechazarse la persistencia y mostrarse un error accionable sin corromper el orden previo de la galeria.

### HU-3.2: Flujo admin para cargar, ordenar y marcar portada de imagenes

- **Como:** Administrador comercial SIS.
- **Quiero:** Gestionar imagenes de cada producto desde el panel admin.
- **Para poder:** Publicar galerias completas sin depender de edicion manual en base de datos.

**Criterios de aceptacion (BDD)**

1. Carga de multiples imagenes con feedback de estado.
   - **Dado que:** Estoy autenticado como admin en el modulo de productos.
   - **Cuando:** Selecciono y cargo una o varias imagenes para un producto.
   - **Entonces:** Debo visualizar progreso/resultado por archivo y la galeria debe refrescarse con las nuevas imagenes persistidas.

2. Reordenamiento y portada desde UI admin.
   - **Dado que:** Un producto tiene al menos dos imagenes cargadas.
   - **Cuando:** Reordeno imagenes y marco una portada desde el flujo de edicion.
   - **Entonces:** El nuevo orden y la portada deben guardarse y reflejarse igual al recargar la pantalla.

3. Escenario de error: validacion de formato o tamano.
   - **Dado que:** Intento subir un archivo no permitido o que supera el limite definido.
   - **Cuando:** Inicio la carga en admin.
   - **Entonces:** Debe bloquearse ese archivo con mensaje claro y permitir continuar con los archivos validos restantes.

### HU-3.3: Carrusel publico en listado y detalle con enfoque mobile-first

- **Como:** Residente de obra o comprador.
- **Quiero:** Navegar varias imagenes por producto en listado y detalle.
- **Para poder:** Evaluar mejor el producto antes de iniciar contacto comercial.

**Criterios de aceptacion (BDD)**

1. Carrusel en detalle de producto.
   - **Dado que:** Un producto publico tiene multiples imagenes activas.
   - **Cuando:** Ingreso al detalle del producto desde mobile o desktop.
   - **Entonces:** Debo ver un carrusel navegable que respete portada y orden definido por admin.

2. Imagen principal en tarjetas de listado.
   - **Dado que:** Navego el listado de catalogo con productos que tienen galeria.
   - **Cuando:** Se renderizan las tarjetas de producto.
   - **Entonces:** Debe mostrarse la portada como imagen principal y fallback visual cuando no exista portada explicita.

3. Escenario de error: fallo parcial de carga de imagenes.
   - **Dado que:** Una o mas URLs de galeria fallan durante la carga.
   - **Cuando:** El usuario navega listado o detalle.
   - **Entonces:** La UI debe mantener estabilidad con placeholders/fallback sin romper navegacion ni CTA de contacto.

## Acceptance Criteria (Feature Level)

- [ ] El admin puede gestionar multiples imagenes por producto (alta, orden, portada) con persistencia real en Supabase.
- [ ] El catalogo publico consume y muestra la galeria por producto en listado y detalle, priorizando UX mobile-first.
- [ ] El flujo contempla escenarios de error de carga/validacion sin degradar la conversion a contacto.

## Technical Notes

- **Data model impact:** Reutiliza `product_images` como entidad central de galeria y valida semantica de `sort_order` + `is_cover`.
- **Security considerations:** Operaciones de escritura en imagenes restringidas a admins autenticados; lectura publica limitada a contenido permitido por RLS.
- **Dependencies:** Bucket `products` operativo en Supabase Storage y servicios DAL separados (`admin`/`public`) segun ADR-004.
- **Cross-feature dependency:** FEAT-3 cierra la brecha de ciclo de vida de assets visuales iniciada en FEAT-2 (gestion avanzada de galeria).

## Out of Scope

- Edicion visual avanzada (crop, filtros, anotaciones o watermark) dentro del admin.
- CDN/transformaciones dinamicas avanzadas fuera de capacidades base de Supabase Storage.
- Automatizacion de etiquetado inteligente de imagenes mediante IA.
