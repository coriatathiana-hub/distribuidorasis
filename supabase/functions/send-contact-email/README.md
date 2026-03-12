# send-contact-email

Supabase Edge Function for HU-4.1:
- persists a contact request in `public.contact_requests`
- sends transactional email to sales inbox via Resend

## Auth Configuration

- This function is invoked from public route `/contacto`.
- In Supabase Dashboard, configure the function with JWT verification disabled:
  - `verify_jwt = false`

## Required Environment Variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `CONTACT_EMAIL_TO`
- `CONTACT_EMAIL_FROM`

## Local Invocation (example)

```bash
supabase functions serve send-contact-email
```

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
