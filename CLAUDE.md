# redes-next

Estudio PRIVADO de producción de contenido para redes con IA (no es un SaaS público:
sin precios, captación ni registro abierto). Next.js 15 (App Router) + Supabase + Tailwind/shadcn.

## Comandos
- `npm run typecheck`, `npm test` (vitest), `npm run build`, `npm run dev`.
- El build necesita `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.

## Reglas de producto
- Marca = fila de `clients`. Todo dato nuevo lleva `client_id` y RLS con `admin_owns_client` / `is_client_member`.
- El `client_id` se deriva de la sesión o se comprueba en servidor; nunca se confía en el navegador.
- Aprobación editorial, renderizado y publicación son estados distintos. Una publicación apunta a una versión concreta del vídeo.
- Los originales y las versiones no se sobrescriben; cada render es una versión nueva.
- No desplegar ni publicar en redes sin indicación explícita del usuario.

## Reglas de arquitectura
- Los trabajos largos (transcripción, render) van en un worker separado, nunca en una petición de Next/Vercel.
- Cola en Postgres: estados, intentos, errores y clave de idempotencia; un reintento no duplica renders ni publicaciones.
- Análisis, decisión de montaje y renderizado son etapas separadas.
- El modelo solo devuelve un plan de montaje en JSON; se valida (zod + tiempos dentro del original)
  y el worker construye los argumentos de ffmpeg. Nunca se ejecutan comandos generados por el modelo.
- Deduplicar originales por ID de archivo de Drive + versión/checksum.
- Credenciales solo en servidor (`server-only`, service role, tokens cifrados con `lib/security/encryption.ts`).

## Problemas conocidos
- RLS de `profiles`: `profiles_update_self` permite al usuario cambiar su propio `role` (escalada a admin).
  `clients_client_update_own` permite a un cliente cambiar `owner_admin_id`. Pendiente de migración correctiva.
- CI: typecheck y tests pasan; falla el paso Build porque faltan variables/secrets de Supabase en GitHub Actions.
- Las migraciones se aplican a mano en Supabase; no hay CLI de Supabase ni base de datos local de pruebas.

## Estado
- `docs/content-automation.md`: planificador semanal (PR #1, fusionada en main).
