# send-contact-email

Supabase Edge Function for HU-4.1:
- persists a contact request in `public.contact_requests`
- sends transactional email to sales inbox via Resend

## Auth Configuration

- This function is invoked from public route `/contacto`.
- In Supabase Dashboard, configure the function with JWT verification disabled:
  - `verify_jwt = false`
  - Reason: endpoint is public by design and executed with `anon` context from web form.

## Required Environment Variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `CONTACT_EMAIL_TO`
- `CONTACT_EMAIL_FROM`
- `ALLOWED_ORIGINS` (comma-separated)

## Local Invocation (example)

```bash
supabase functions serve send-contact-email
```

## Production Deployment (reference)

```bash
supabase functions deploy send-contact-email --no-verify-jwt
```

After deploy, set all required secrets in Supabase and run the smoke test from `docs/SETUP.md`.

## Security Baseline

- No app-level rate limiter is implemented in this function.
- Protection must be enforced by infrastructure controls:
  - strict `Access-Control-Allow-Origin` allowlist,
  - Cloudflare WAF/bot protections,
  - optional CAPTCHA/challenge at form layer.
- Treat this function as internet-exposed and monitor request spikes in the first 24h after go-live.

Request body expected by the function:

```json
{
  "full_name": "Juan Perez",
  "company": "Constructora ABC",
  "phone": "5512345678",
  "email": "juan@empresa.com",
  "request_type": "cotizacion",
  "message": "Me interesa cotizar productos de seguridad.",
  "source": "web_form",
  "status": "new"
}
```

Successful response:

```json
{
  "success": true,
  "requestId": "uuid",
  "emailId": "re_123"
}
```
