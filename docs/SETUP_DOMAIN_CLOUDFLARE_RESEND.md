# Guia de configuracion: Dominio (AKKY) + Cloudflare + Resend

> Este documento se mantiene por trazabilidad historica.
> La fuente unica y vigente para setup/go-live es `docs/SETUP.md`.
>  
> Via aprobada: **AKKY (registrador) -> Cloudflare (DNS) -> Resend**.

---

## 1) Resumen ejecutivo

Para tu contexto actual:

- **AKKY:** solo se usa para administrar el registro del dominio y nameservers.
- **Cloudflare:** sera la zona DNS autoritativa para crear/editar SPF, DKIM y DMARC.
- **Resend:** verifica dominio/subdominio y envia correo transaccional desde API.

Ruta acordada:

1. Migrar nameservers de AKKY a Cloudflare.
2. Verificar que todos los registros DNS esten correctos en Cloudflare.
3. Configurar/verificar dominio de envio en Resend.
4. Probar envio real con API key.
5. (Opcional) habilitar Tunnel para `staging/demo`.

---

## 2) Via acordada (obligatoria): AKKY -> Cloudflare -> Resend

No se usara AKKY para edicion de registros DNS (SPF/DKIM/DMARC), porque no esta contratado DNS-P.

Reglas operativas:

- AKKY: solo cambio de nameservers.
- Cloudflare: gestion completa de zona DNS (A/CNAME/MX/TXT).
- Resend: validacion de dominio/subdominio de envio.

---

## 3) Arquitectura de dominio recomendada

Recomendacion para separar responsabilidades:

- **Produccion app:** `www.distribuidorasis.com.mx` (o raiz)
- **Staging/demo:** `staging.distribuidorasis.com.mx` o `demo.distribuidorasis.com.mx`
- **Correo transaccional Resend:** `mail.distribuidorasis.com.mx` (subdominio dedicado)
- **From sugerido:** `noreply@mail.distribuidorasis.com.mx` o `ventas@distribuidorasis.com.mx` (segun operacion)

Usar subdominio dedicado para envio ayuda a aislar reputacion de correo.

---

## 4) Paso a paso: Cloudflare + Resend

### 4.1 Crear y proteger API key

1. Crear cuenta/proyecto en Resend.
2. Ir a **API Keys** y generar key de servidor.
3. Guardar como variable secreta:
   - `RESEND_API_KEY=...`
4. Nunca usar `VITE_RESEND_API_KEY` ni exponerla en frontend.

### 4.2 Preparar DNS en Cloudflare

1. Crear cuenta en Cloudflare y agregar `distribuidorasis.com.mx`.
2. Importar/verificar todos los registros actuales de AKKY (A, CNAME, MX, TXT).
3. Confirmar que no falte ningun registro critico de web/correo.
4. En AKKY, reemplazar nameservers por los que entrega Cloudflare.
5. Esperar propagacion y validar resolucion global.

### 4.3 Verificar dominio o subdominio en Resend

1. En Resend: **Domains -> Add Domain**.
2. Elegir:
   - `mail.distribuidorasis.com.mx` (recomendado), o
   - `distribuidorasis.com.mx` (si prefieres dominio principal).
3. Resend te pedira registros DNS (SPF/DKIM, y segun caso MAIL FROM).

### 4.4 Cargar DNS de Resend en Cloudflare

1. En Cloudflare DNS, crear exactamente los registros que pide Resend.
2. Reglas clave:
   - **SPF:** debe existir **un solo** TXT SPF por host.
   - Si ya hay SPF, integrar `include:resend.com` en el existente.
   - **DKIM:** crear todos los selectores solicitados por Resend.
   - **DMARC (recomendado):** agregar politica inicial suave:
     - Host: `_dmarc`
     - Valor: `v=DMARC1; p=none; rua=mailto:postmaster@distribuidorasis.com.mx`
3. Para registros de correo, mantener **DNS only** (sin proxy).
4. Esperar propagacion y en Resend presionar **Verify**.

### 4.5 Smoke test de envio

Cuando el dominio este `Verified`, probar:

```bash
curl -sS https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "'"$CONTACT_EMAIL_FROM"'",
    "to": ["'"$CONTACT_EMAIL_TO"'"],
    "subject": "FEAT-4 setup validation",
    "html": "<p>Resend setup validated for distribuidorasis.</p>"
  }'
```

Criterio de exito:
- respuesta con `id`,
- correo recibido en `ventas@distribuidorasis.com.mx`.

---

## 5) Cloudflare Tunnel para entorno no productivo (opcional)

### 5.1 Crear subdominio no productivo via Tunnel

Objetivo: exponer tu `localhost:8080` como `staging.distribuidorasis.com.mx`.

Pasos de alto nivel:

1. Instalar `cloudflared`.
2. Autenticar:
   - `cloudflared tunnel login`
3. Crear tunel:
   - `cloudflared tunnel create distribuidorasis-staging`
4. En Cloudflare DNS, crear CNAME:
   - `staging -> <tunnel-id>.cfargotunnel.com`
5. Configurar ruta local (ejemplo conceptual):
   - host `staging.distribuidorasis.com.mx` -> `http://localhost:8080`
6. Levantar tunel:
   - `cloudflared tunnel run distribuidorasis-staging`

Uso recomendado:
- demos internas/QA,
- validaciones de callback/redirect en dominio real no productivo.

No recomendado:
- como entorno productivo final.

---

## 6) Variables de entorno por ambiente

Segun `docs/SETUP.md`, FEAT-4 requiere:

- `CONTACT_EMAIL_TO`
- `CONTACT_EMAIL_FROM`
- `RESEND_API_KEY`
- `VITE_WHATSAPP_PHONE_E164`

Sugerencia operativa:

- **Local:** `.env.local` en `app/`.
- **Staging/Prod:** variables en plataforma de hosting (Railway/Netlify).
- Mantener `CONTACT_EMAIL_TO=ventas@distribuidorasis.com.mx` en prod y usar buzon de pruebas en staging.

---

## 7) Checklist de ejecucion (orden recomendado)

1. Cloudflare como DNS autoritativo:
   - [ ] Zona creada e importada en Cloudflare.
   - [ ] Nameservers de Cloudflare configurados en AKKY.
   - [ ] Resolucion web/correo validada post-cambio.
2. Resend:
   - [ ] API key creada y guardada.
   - [ ] Dominio/subdominio agregado.
   - [ ] SPF correcto (sin duplicados).
   - [ ] DKIM completo.
   - [ ] DMARC inicial agregado.
   - [ ] Estado `Verified`.
3. Variables:
   - [ ] Variables FEAT-4 cargadas en local.
   - [ ] Variables FEAT-4 cargadas en staging/prod (si aplica).
4. Smoke test:
   - [ ] API responde con `id`.
   - [ ] Correo llega a ventas.
5. (Opcional) Tunnel:
   - [ ] Subdominio staging/demo publicado.
   - [ ] Tunnel estable hacia localhost.

---

## 8) Troubleshooting rapido

## Resend no verifica dominio

- revisar host exacto del registro (Cloudflare a veces autocompleta dominio),
- revisar SPF duplicado (solo uno permitido),
- revisar que todos los DKIM esten creados,
- esperar propagacion y validar con `dig`/MXToolbox antes de reintentar.

## Correo no llega aunque API devuelve `id`

- revisar spam/quarantine en destino,
- validar `from` permitido por dominio verificado,
- revisar politicas DMARC/SPF de destino.

## Tunnel inestable

- validar que `cloudflared` siga corriendo,
- revisar DNS CNAME hacia el tunnel correcto,
- probar primero con host unico (`staging`) antes de agregar mas rutas.

---

## 9) Relacion con documentos del proyecto

- Base de setup general: `docs/SETUP.md`
- Referencia usada: `docs/ref-setup-resend.md`
- Feature objetivo: `.spec/work/FEAT-4/README.md`

## 10) Decision registrada

La unica via aprobada para FEAT-4 es:

**AKKY (registrador, nameservers) -> Cloudflare (DNS autoritativo) -> Resend (correo transaccional)**.

Estado operativo actual (HU-4.1 pre-apply):
- DNS de Cloudflare delegado desde AKKY.
- Registros de Resend (DKIM + `send` SPF/MX + DMARC) configurados.
- `Cloudflare Tunnel` y `www` (A/CNAME hacia Railway) quedan pendientes hasta preparar despliegue.

