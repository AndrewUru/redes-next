# Adaptación de redes-next a producción de contenido

## Entrega: planificación editorial

`/client/content` genera un plan para una semana (lunes, Europe/Madrid), reutilizando el onboarding validado, inventario de tipos de materiales, hasta cuatro planes anteriores y hasta catorce snapshots recientes. Funciona sin una cuenta conectada ni métricas; las ideas se presentan como hipótesis, no como tendencias verificadas. Los snapshots son de cuenta, no atribución de resultados a un plan.

Se conserva el proveedor OpenAI ya integrado. No se ha añadido Claude, un servidor MCP ni un generador de vídeo. Se puede exportar el plan JSON para llevarlo al proceso externo de producción.

Cada pieza contiene día, formato, tema, objetivo, gancho, guion/diapositivas, copy y materiales necesarios. Los planes se editan y se aprueban como lote. Aprobar significa autorización editorial para producción, no programación ni publicación. Editar un plan aprobado lo devuelve a borrador en el editor; hay que guardar los cambios.

## Activación

1. Aplicar las migraciones existentes y `supabase/migrations/202611120001_content_plans.sql` en el Supabase del proyecto.
2. Configurar `OPENAI_API_KEY` y, opcionalmente, `OPENAI_MODEL`, reutilizando la configuración actual. Las llamadas a la API tienen coste independiente de las suscripciones de chat.
3. Entrar con un usuario cliente, completar onboarding y abrir Contenido.
4. Seleccionar el lunes y entre una y siete piezas. Generar, editar, guardar o aprobar y exportar JSON.

La API usa la sesión de Supabase y el client_id del usuario, nunca un client_id enviado por el navegador. RLS conserva el aislamiento por cliente y el acceso del admin propietario. La UI de esta entrega es para clientes; el administrador no tiene aún editor de planes en su ficha de cliente. Un índice único impide guardar dos planes para la misma semana. Las ediciones usan una revisión para detectar conflictos entre pestañas. Dos generaciones simultáneas podrían consumir dos llamadas de IA aunque solo se guarde un plan: antes de habilitar ejecución desatendida se debe añadir reserva transaccional, límites de gasto y cola de trabajos.

## Siguientes integraciones, pendientes

1. **Generación semanal desatendida:** configuración explícita por cliente (habilitación, día/hora, zona horaria, frecuencia, presupuesto), cola con reserva transaccional, reintentos y alertas. Reutilizar el generador de planes, pero no ejecutar lotes largos dentro de una sola petición de Vercel.
2. **Vídeo:** identificar la herramienta actual. Un adaptador envía guiones y material autorizado, registra el trabajo, recibe un callback autenticado y guarda el archivo final con su vista previa. Si son vídeos creados con código, usar un worker de renderizado separado.
3. **Carpetas compartidas:** elegir Drive u otro proveedor y obtener OAuth propio para esta aplicación. Los conectores disponibles en el chat no se transfieren automáticamente al servidor de redes-next. Registrar el ID y versión del archivo para no importar duplicados.
4. **Publicación:** ampliar permisos de Meta según el flujo OAuth existente; verificar el permiso de publicación y reautorizar cuentas. Añadir piezas con activos terminados, fecha y cuenta de destino; crear y consultar el contenedor de Instagram antes de publicar. Guardar IDs remotos y reconciliar timeouts antes de reintentar para evitar duplicados. Tokens solo en servidor.
5. **MCP opcional:** exponer operaciones limitadas por cliente (listar planes, proponer cambios, registrar entregables); no entregar credenciales globales. La aprobación y publicación se controlan en el backend.

## Validación manual con servicios conectados

- Cliente A genera un plan y Cliente B no puede leerlo ni editarlo.
- Semana duplicada devuelve 409; falta de briefing devuelve 422.
- Editar desde dos pestañas devuelve 409 a la revisión desactualizada.
- La exportación coincide con el último plan guardado.
- Aprobar no ejecuta llamadas a Instagram.

Las pruebas locales de esquema no sustituyen comprobar las policies con una base de datos real. No se han aplicado migraciones ni realizado llamadas de IA o publicación durante el desarrollo.
