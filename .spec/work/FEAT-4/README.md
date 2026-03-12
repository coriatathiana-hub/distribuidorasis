# FEAT-4: Contacto omnicanal con envio real (Email + WhatsApp)

## Benefit Hypothesis

- **Para**: Residentes de obra y compradores que necesitan cotizar rapidamente, y equipo comercial SIS que requiere atender prospectos con contexto completo.
- **Que**: Buscan iniciar contacto por canales de alto uso (formulario email y WhatsApp) sin friccion ni perdida de informacion clave.
- **Esta Feature**: Provee un flujo omnicanal de contacto con envio real por correo a ventas, CTA de WhatsApp con mensaje contextual y trazabilidad minima de intentos.
- **Esperamos**: Incrementar la conversion de interesados a prospectos atendidos y reducir tiempos muertos entre intencion de compra y primer contacto comercial.
- **Sabremos que hemos tenido éxito cuando**: Se alcancen >=40 solicitudes calificadas al mes y el tiempo promedio de respuesta comercial se mantenga <=2 horas habiles.

## User Stories

| ID | Title | Priority | Status |
|:---|:------|:---------|:-------|
| HU-4.1 | Envio real de solicitudes por email con persistencia y trazabilidad en `contact_requests` | High | [x] Completed |
| HU-4.2 | Formulario publico de contacto con validaciones y feedback UX mobile-first | High | [x] Completed |
| HU-4.3 | CTA de WhatsApp con mensaje contextual y registro minimo de intentos | High | [x] Completed |
| HU-4.4 | Dashboard admin de conversion omnicanal para explotar `contact_requests` + `whatsapp_cta_attempts` | Medium | [x] Completed |

## Story Definitions and BDD Criteria

### HU-4.1: Envio real de solicitudes por email con persistencia y trazabilidad en `contact_requests`

- **Como:** Equipo comercial SIS.
- **Quiero:** Recibir por correo cada solicitud enviada desde el sitio y conservar su registro estructurado en base de datos.
- **Para poder:** Atender prospectos con contexto suficiente y medir conversion de captacion.

**Criterios de aceptacion (BDD)**

1. Persistencia de solicitud y despacho de correo en flujo exitoso.
   - **Dado que:** Un visitante completa el formulario con datos validos.
   - **Cuando:** El sistema procesa la solicitud de contacto.
   - **Entonces:** Debe guardar el registro en `contact_requests` y enviar el correo a `ventas@distribuidorasis.com.mx` con el detalle de la solicitud.

2. Respuesta de API consistente para frontend.
   - **Dado que:** El endpoint de contacto recibe una solicitud valida.
   - **Cuando:** Finaliza el procesamiento del envio.
   - **Entonces:** Debe responder con estado de exito y metadatos minimos para confirmar entrega/registro sin exponer informacion sensible.

3. Escenario de error: fallo en proveedor de correo.
   - **Dado que:** Ocurre una falla temporal o rechazo en el servicio de email.
   - **Cuando:** Se intenta enviar una nueva solicitud.
   - **Entonces:** El sistema debe informar error controlado, mantener trazabilidad del intento y evitar estados ambiguos para el usuario final.

### HU-4.2: Formulario publico de contacto con validaciones y feedback UX mobile-first

- **Como:** Residente de obra o comprador.
- **Quiero:** Completar un formulario claro y rapido para solicitar cotizacion.
- **Para poder:** Enviar mi requerimiento sin friccion desde celular o desktop.

**Criterios de aceptacion (BDD)**

1. Validaciones de campos obligatorios y formato.
   - **Dado que:** Estoy en la pagina de contacto.
   - **Cuando:** Ingreso datos incompletos o con formato invalido (email/telefono).
   - **Entonces:** El formulario debe bloquear el envio y mostrar mensajes de validacion accionables por campo.

2. Feedback de estado durante envio y confirmacion final.
   - **Dado que:** Completo correctamente todos los campos requeridos.
   - **Cuando:** Presiono el CTA de envio.
   - **Entonces:** Debo ver estado de carga, resultado final y confirmacion de que mi solicitud fue recibida.

3. Escenario de error: timeout o caida del endpoint.
   - **Dado que:** El servicio de contacto no responde dentro del umbral esperado.
   - **Cuando:** Intento enviar mi solicitud.
   - **Entonces:** La interfaz debe mostrar error recuperable, conservar los datos ingresados y habilitar reintento sin recargar la pagina.

### HU-4.3: CTA de WhatsApp con mensaje contextual y registro minimo de intentos

- **Como:** Residente de obra o comprador.
- **Quiero:** Contactar por WhatsApp con un mensaje prellenado segun el contexto del producto/interes.
- **Para poder:** Iniciar conversacion comercial inmediata en el canal que uso diariamente.

**Criterios de aceptacion (BDD)**

1. Generacion de deeplink con mensaje contextual.
   - **Dado que:** Navego catalogo, detalle o contacto y selecciono iniciar WhatsApp.
   - **Cuando:** Hago clic en el CTA de WhatsApp.
   - **Entonces:** Debe abrirse el canal con un mensaje prellenado que incluya contexto minimo (producto o tipo de solicitud).

2. Cobertura consistente de CTA en vistas clave.
   - **Dado que:** Estoy en una vista publica habilitada para conversion.
   - **Cuando:** Interactuo con el boton de WhatsApp.
   - **Entonces:** El comportamiento debe ser consistente en mobile-first y respetar accesibilidad basica del control.

3. Escenario de error: imposibilidad de abrir canal WhatsApp.
   - **Dado que:** El dispositivo o entorno bloquea la apertura del deeplink.
   - **Cuando:** El usuario intenta iniciar contacto por WhatsApp.
   - **Entonces:** El sistema debe notificar de forma clara la incidencia y ofrecer alternativa inmediata de contacto (formulario email).

### HU-4.4: Dashboard admin de conversion omnicanal para explotar `contact_requests` + `whatsapp_cta_attempts`

- **Como:** Administrador comercial SIS.
- **Quiero:** Visualizar metricas y eventos de conversion de email/WhatsApp en una vista admin unica.
- **Para poder:** Priorizar seguimiento comercial y detectar cuellos de botella del funnel con evidencia operativa.

**Criterios de aceptacion (BDD)**

1. KPI cards de conversion omnicanal.
   - **Dado que:** Existen registros en `contact_requests` y `whatsapp_cta_attempts`.
   - **Cuando:** Accedo al modulo admin de conversion.
   - **Entonces:** Debo ver tarjetas KPI minimas (solicitudes por formulario, intentos WhatsApp, tasa aproximada formulario/intentos) para un rango temporal definido.

2. Tabla operativa con filtros.
   - **Dado que:** Necesito analizar eventos de contacto por origen/canal.
   - **Cuando:** Aplico filtros (fecha, canal, resultado apertura WhatsApp).
   - **Entonces:** Debo ver una tabla unificada con columnas de contexto, estado y fecha, manteniendo paginacion/ordenamiento basico y control de cierre de sesion visible en la parte superior del sidebar admin.

3. Escenario de error: fallo de consulta o falta de permisos.
   - **Dado que:** Ocurre un error en la lectura de datos o una denegacion por RLS.
   - **Cuando:** Intento cargar el dashboard.
   - **Entonces:** El sistema debe mostrar un estado de error recuperable, sin romper el layout admin, y permitir reintento.

## Acceptance Criteria (Feature Level)

- [x] El sitio permite capturar solicitudes por formulario con persistencia en `contact_requests` y envio real de correo a ventas.
- [x] El flujo UX de contacto y WhatsApp mantiene experiencia mobile-first, validaciones claras y manejo controlado de errores.
- [x] Existe trazabilidad minima de conversion omnicanal para medir solicitudes calificadas y respuesta comercial.

## Technical Notes

- **Data model impact:** Reutiliza `contact_requests` como entidad de trazabilidad de solicitudes y origen (`source`) del contacto.
- **Security considerations:** Inserciones anonimas acotadas por RLS en `contact_requests`; lectura/gestion completa solo para admins autenticados.
- **Dependencies:** Endpoint/API `functions/send-contact-email`, proveedor de email transaccional y configuracion de variables de entorno.
- **Cross-feature dependency:** Se apoya en FEAT-1/FEAT-3 para contexto de producto y en FEAT-2 para base de seguridad Supabase/RLS.

## Out of Scope

- Bandeja CRM completa con pipeline comercial avanzado y automatizaciones multietapa.
- Integracion bidireccional con ERP/CRM externo en tiempo real.
- Bots de WhatsApp, respuestas automaticas inteligentes o flujos conversacionales asistidos por IA.
