# FEAT-5: Hardening post-MVP de conversion, edicion y taxonomia de catalogo

## Benefit Hypothesis — FEAT-5: Hardening post-MVP de conversion, edicion y taxonomia de catalogo

- **Para**: Equipo comercial y operacion admin de SIS
- **Que**: busca mayor control de conversiones y seguridad operativa al editar productos
- **Esta Feature**: provee mejoras post-MVP en control de acceso admin, UX transaccional de imagenes, taxonomia multi-categoria, correccion de navegacion y consistencia legal de marca
- **Esperamos**: reducir errores de operacion en backoffice y mejorar visibilidad de conversiones para toma de decisiones comerciales
- **Sabremos que hemos tenido éxito cuando**: se reduzcan incidentes de edicion reportados y aumente la trazabilidad de conversiones email en dashboard admin

## User Stories

### HU-5.1: Restringir acceso admin por modulo para usuario de conversiones (`ventas@distribuidorasis.com.mx`)

- **Como:** Administrador principal
- **Quiero:** definir permisos por subseccion del admin (Categorias, Productos, Conversiones)
- **Para poder:** permitir que `ventas@distribuidorasis.com.mx` acceda solo a Conversiones sin acceso a Catalogo

**Criterios de aceptacion (BDD):**
- **Dado que** existe un atributo de permisos por modulo en perfiles admin, **cuando** se configura a `ventas@distribuidorasis.com.mx` con acceso solo a Conversiones, **entonces** el usuario puede acceder a `/admin/conversion` y consultar sus datos.
- **Dado que** el mismo usuario intenta abrir `/admin/productos` o `/admin/categorias`, **cuando** navega por URL directa o menu, **entonces** el sistema deniega acceso, redirige a una ruta permitida y muestra feedback de autorizacion.

**Escenario de excepcion:**
- Si el atributo de permisos no existe en un admin legacy, el sistema debe aplicar fallback de full-access temporal hasta completar migracion controlada.

### HU-5.2: Diferir eliminacion fisica de imagenes en edicion de producto hasta accion explicita de guardar

- **Como:** Operador de catalogo
- **Quiero:** que borrar una imagen durante la edicion solo marque el cambio localmente
- **Para poder:** evitar perdida accidental de contenido antes de confirmar el formulario

**Criterios de aceptacion (BDD):**
- **Dado que** el admin abre la edicion de un producto con imagenes existentes, **cuando** marca una imagen para eliminar pero no guarda, **entonces** la imagen sigue persistida en BD/Storage.
- **Dado que** el admin tiene cambios pendientes de eliminacion y presiona `Guardar`, **cuando** la transaccion finaliza exitosamente, **entonces** solo en ese momento se eliminan de forma fisica las imagenes confirmadas.

**Escenario de excepcion:**
- Si falla la eliminacion fisica en Storage despues de guardar metadatos, se debe aplicar rollback o marcar inconsistencia recuperable con alerta para reintento.

### HU-5.3: Permitir relacion producto multi-categoria con migracion de modelo y UI admin/publica

- **Como:** Admin de catalogo
- **Quiero:** asociar un producto a mas de una categoria
- **Para poder:** representar mejor el catalogo y mejorar descubrimiento por distintos criterios

**Criterios de aceptacion (BDD):**
- **Dado que** el modelo actual usa `products.category_id`, **cuando** se aplica la migracion a tabla pivote `product_categories`, **entonces** los productos existentes conservan su categoria original sin perdida de datos.
- **Dado que** un admin crea o edita un producto, **cuando** selecciona multiples categorias validas, **entonces** el producto queda visible en todos los filtros publicos de esas categorias.

**Escenario de excepcion:**
- Si la migracion detecta referencias huerfanas o categorias inactivas incompatibles, el script debe detenerse con reporte y sin ejecutar cambios parciales.

### HU-5.4: Actualizar branding legal en footer a razon social completa

- **Como:** Usuario visitante y area legal/comercial
- **Quiero:** ver la razon social completa de la empresa en el sitio
- **Para poder:** asegurar consistencia legal y de marca en la presentacion corporativa

**Criterios de aceptacion (BDD):**
- **Dado que** la pagina "Aviso de Privacidad" contiene la razon social anterior, **cuando** se publique el ajuste legal, **entonces** se reemplaza `SUMINISTROS INDUSTRIALES Y DE SEGURIDAD SIS, S.A. DE C.V.` por `SUMINISTROS INDUSTRIALES DE SEGURIDAD PRIVADA SIS, S.A. DE C.V.`.
- **Dado que** la pagina "Nosotros" contiene el texto "Somos una comercializadora especializada ...", **cuando** se aplique la actualizacion editorial, **entonces** inicia con `Suministros Industriales de Seguridad Privada SIS, S.A. de C.V. es una comercializadora especializada ...`.
- **Dado que** el sitio se consulta en mobile y desktop, **cuando** se renderizan ambas paginas, **entonces** el nuevo texto se mantiene legible y consistente.

**Escenario de excepcion:**
- Si existen referencias adicionales del nombre corto fuera del footer, se deben registrar como deuda de consistencia de marca antes de cerrar la HU.

### HU-5.5: Corregir bug de navegacion para iniciar cada cambio de pagina en la parte superior

- **Como:** Usuario visitante
- **Quiero:** que al navegar entre paginas el scroll inicie desde arriba
- **Para poder:** visualizar de inmediato el encabezado y contexto de la pagina destino

**Criterios de aceptacion (BDD):**
- **Dado que** el usuario viene de una ruta con scroll profundo, **cuando** navega a otra pagina del sitio, **entonces** la nueva vista se posiciona automaticamente en el top.
- **Dado que** la navegacion ocurre entre rutas publicas (por ejemplo hacia "Aviso de Privacidad"), **cuando** se completa el cambio de pagina, **entonces** el encabezado de la pagina destino es visible sin desplazamiento manual.

**Escenario de excepcion:**
- Si existe una navegacion interna que requiere conservar posicion (anclas o retorno contextual), se documenta y excluye explicitamente para no romper UX esperada.

### HU-5.6: Hardening de trazabilidad para WhatsApp CTA con persistencia confiable en `whatsapp_cta_attempts`

- **Como:** Responsable comercial y administrador de conversiones
- **Quiero:** que cada clic valido al CTA de WhatsApp quede trazado de forma confiable
- **Para poder:** usar el dashboard de conversion con datos consistentes para seguimiento comercial

**Criterios de aceptacion (BDD):**
- **Dado que** un usuario hace clic en un CTA de WhatsApp desde el sitio, **cuando** se dispara el tracking del intento, **entonces** el evento se persiste en `whatsapp_cta_attempts` con `source`, `context_type`, `opened_successfully` y `created_at`.
- **Dado que** existe un fallo transitorio de red o cambio inmediato de contexto del navegador, **cuando** falla el primer intento de persistencia, **entonces** el sistema ejecuta la estrategia de recuperacion definida sin bloquear la accion del usuario.
- **Dado que** se ejecutan pruebas controladas de conversion, **cuando** se comparan clics instrumentados contra registros persistidos, **entonces** la desviacion permanece dentro del umbral operativo acordado.

**Escenario de excepcion:**
- Si el navegador no permite el mecanismo preferente de despacho del evento, el sistema debe degradar a una estrategia alternativa manteniendo idempotencia y sin degradar la apertura de WhatsApp.

## Riesgos y consideraciones iniciales

- **HU-5.3 (Riesgo Alto):** impacto en modelo de datos, consultas DAL, filtros publicos y politicas RLS.
- **HU-5.6 (Riesgo Medio):** confiabilidad de telemetria en navegacion de salida y consistencia de KPIs de conversion.
- **HU-5.2 (Riesgo Medio):** consistencia transaccional entre estado de UI, DB y Storage.
- **HU-5.1 (Riesgo Medio):** cambios en autorizacion por modulo y guards de rutas admin.
- **HU-5.4/HU-5.5 (Riesgo Bajo):** ajustes de copy legal y comportamiento de navegacion.
