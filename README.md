# Portal de Onboarding RRSS (Next.js + Supabase)

MVP production-ready para gestionar onboarding de clientes de RRSS con:
- Auth por email/password (Supabase Auth)
- Roles `admin` y `client`
- Multi-tenant con RLS estricta (DB-first)
- Wizard Brand Intake (10 pasos, autosave draft, submit final)
- Gestión de assets en Storage
- Generación de Brandbook PDF versionado

## Stack
- Next.js (App Router) + TypeScript
- Supabase (Auth, Postgres, RLS, Storage)
- Tailwind + componentes estilo shadcn/ui
- Zod + react-hook-form
- `@react-pdf/renderer` para PDF server-side
- Vitest para tests básicos

## Estructura
```txt
app/
  (auth)/login/page.tsx
  (auth)/signup/page.tsx
  admin/layout.tsx
  admin/clients/page.tsx
  admin/clients/[id]/page.tsx
  client/layout.tsx
  client/page.tsx
  client/onboarding/page.tsx
  client/assets/page.tsx
  api/admin/create-client/route.ts
  api/client/intake/route.ts
  api/client/assets/route.ts
  api/brandbook/generate/route.ts
components/
  auth/*
  admin/*
  client/*
  ui/*
  step-layout.tsx
  summary-card.tsx
  file-uploader.tsx
lib/
  auth.ts
  db/*
  intake/*
  pdf/brandbook-document.tsx
  supabase/*
supabase/migrations/202602160001_init.sql
scripts/seed-admin.mjs
tests/*
```

## Setup local
1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables:
```bash
cp .env.example .env.local
```

3. Completar:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET` (opcional para utilidades avanzadas)
- `META_APP_ID` (recomendado para app Business con Facebook Login)
- `META_APP_SECRET` (recomendado para app Business con Facebook Login)
- `META_BUSINESS_CONFIG_ID` (Business Login Configuration ID de Meta)
- `META_OAUTH_SCOPES` (por defecto: `instagram_basic,pages_show_list,pages_read_engagement,business_management`)
- `META_BUSINESS_REDIRECT_URI` (ej: `http://localhost:3000/client/accounts/instagram/callback`)
- `INSTAGRAM_APP_ID` (fallback legacy)
- `INSTAGRAM_APP_SECRET` (fallback legacy)
- `INSTAGRAM_REDIRECT_URI` (fallback; usa la misma URL del callback cliente)
- `INSTAGRAM_TOKEN_ENCRYPTION_KEY` (secreto largo para cifrar tokens)
- `CRON_SECRET` (secreto para proteger endpoints de cron)

Para app Business:
- En `Facebook Login for Business -> Settings`, agrega `META_BUSINESS_REDIRECT_URI` en `Valid OAuth Redirect URIs`.
- En el flujo OAuth, envia `config_id` usando `META_BUSINESS_CONFIG_ID`.
- Solicita permisos segun tus endpoints. Base recomendada: `instagram_basic,pages_show_list,pages_read_engagement,business_management`.

4. Ejecutar migración en Supabase SQL Editor o CLI con `supabase/migrations/202602160001_init.sql`.

5. Crear admin inicial:
```bash
SEED_ADMIN_EMAIL=admin@demo.com \
SEED_ADMIN_PASSWORD='ChangeMe123!' \
SEED_ADMIN_FULL_NAME='Admin Demo' \
npm run seed:admin
```

6. Levantar app:
```bash
npm run dev
```

## Flujo funcional
- Admin entra a `/admin/clients`, crea cliente + usuario cliente.
- Cliente entra a `/client/onboarding`, completa wizard y autosave guarda draft en `intake_responses`.
- Cliente sube archivos en `/client/assets`, se registran en tabla `assets` y bucket `brand-assets`.
- Admin (o cliente con intake enviado) dispara `POST /api/brandbook/generate` para generar PDF y versionarlo en `brandbooks`.

## Snapshots diarios de RRSS
- Endpoint: `GET /api/cron/social-snapshots`
- Proteccion: header `Authorization: Bearer <CRON_SECRET>` o `x-cron-secret: <CRON_SECRET>`.
- En Vercel, `vercel.json` ejecuta este endpoint diariamente a las `06:00 UTC`.
- El endpoint guarda/actualiza snapshots en `social_account_daily_snapshots` por `social_account_id + snapshot_date`.

## Seguridad (RLS + Storage)
- RLS activada en todas las tablas de dominio.
- Políticas basadas en:
  - Admin propietario (`clients.owner_admin_id = auth.uid()`).
  - Miembro cliente (`client_users`).
- Storage buckets privados:
  - `brand-assets`
  - `brandbooks`
- Policies de Storage validan `client_id` desde prefijo de path (`<client_id>/...`) y membership/ownership.

## Decisiones de implementación
- Se usa API route para creación de cliente y generación de PDF (más control de permisos server-side).
- Wizard modela campos tipo lista como texto separado por coma en UI y lo transforma a arrays para persistencia.
- Generación PDF usa `@react-pdf/renderer` en `runtime = "nodejs"` para no depender de navegador.
- Se priorizó enforcement en DB (RLS/Storage) y simplicidad del frontend para MVP.

## Tests
Ejecutar:
```bash
npm run test
```

Incluye:
1. Validación de payload completo contra `intakeSchema`.
2. Cálculo de `completion_pct` por steps completados.
