# Phase 22: Code Cleanup & Documentation - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Eliminar código muerto, artefactos de desarrollo expuestos en producción, y actualizar los documentos de tracking del proyecto para que reflejen el estado real después de completar el milestone v1.2.

Esta es la fase de cierre del milestone v1.2. No hay funcionalidad nueva ni cambios de comportamiento — solo limpieza estructural y sincronización de documentación.

**Código muerto a eliminar:**
- `src/services/token-refresh.ts` — nunca importado; la lógica fue inlineada en `api.ts` (decisión en Phase 13-02)
- `src/context/auth.context.tsx` — solo contiene `export {}` con comment de deprecación; fue migrado a Zustand en una fase anterior

**Artefactos de dev expuestos:**
- Botón `🧪 UAT: REANIMATED TEST` en `app/(tabs)/dashboard.tsx` (líneas ~155-161) — accede a `app/reanimated-test.tsx`, un archivo de prueba con hex hardcodeados que no debería ser accesible en la app final

**Documentación a actualizar:**
- `.planning/REQUIREMENTS.md` — checkboxes desactualizados; todos los requirements de Phase 13-02 (AUTH-01, 05, 06, 07, 08, API-02, 03, 05) y Phase 16 (UI-04, 06, 08, 10, 12) siguen marcados como `[ ]`; traceability de ERR-01-06 asignada incorrectamente a "Phase 17" en vez de "Phase 21"
- `.planning/STATE.md` — conteo de requirements completados desactualizado; status de phases incorrecto

**In scope:**
- Eliminar `token-refresh.ts` y `auth.context.tsx`
- Remover el bloque del botón reanimated-test del dashboard
- Actualizar checkboxes y traceability en REQUIREMENTS.md
- Actualizar STATE.md con conteos y status correctos

**Out of scope:**
- NO eliminar `app/reanimated-test.tsx` en sí — podría tener uso futuro como referencia de animaciones; solo remover el botón que lo expone
- NO modificar lógica funcional de ningún archivo
- NO cambiar el ROADMAP.md (ya está actualizado)
</domain>

<decisions>
## Implementation Decisions

### Eliminación de archivos

- **D-01:** Antes de eliminar `token-refresh.ts`, verificar con grep que no hay ningún import activo en el proyecto — si existe algún import, resolverlo primero
- **D-02:** Antes de eliminar `auth.context.tsx`, verificar con grep que no hay imports activos — el archivo exporta `{}` por lo que cualquier import del mismo rompería en TypeScript de todas formas
- **D-03:** Eliminar ambos archivos completamente — no dejar archivos vacíos ni stubs

### Remoción del botón de desarrollo

- **D-04:** Remover el bloque completo del botón `reanimated-test` en `dashboard.tsx` — incluye el `TouchableOpacity` y el comentario `{/* UAT: Reanimated Test */}`
- **D-05:** NO agregar feature flag ni `__DEV__` check — simplemente remover el bloque; si se necesita en el futuro se agrega de nuevo conscientemente
- **D-06:** NO modificar el archivo `app/reanimated-test.tsx` en esta fase

### Actualización de REQUIREMENTS.md

- **D-07:** Marcar como `[x]` todos los requirements confirmados como completados por sus respectivos SUMMARY.md:
  - Phase 13-02 completó: AUTH-01, AUTH-05, AUTH-06, AUTH-07, AUTH-08, API-02, API-03, API-05
  - Phase 16 completó: UI-04, UI-06, UI-08, UI-10, UI-12 (las 6 pantallas conectadas)
  - Phase 21 completará: ERR-01, ERR-02, ERR-03, ERR-04, ERR-06 (marcar como `[x]` después de Phase 21)
- **D-08:** Corregir la tabla de Traceability: ERR-01 a ERR-06 deben apuntar a "Phase 21" no "Phase 17"
- **D-09:** Actualizar el comentario `*Last updated*` al pie del archivo con la fecha actual

### Actualización de STATE.md

- **D-10:** Actualizar `progress.completed_plans` y `progress.completed_phases` con los totales reales del milestone v1.2 al momento del cierre
- **D-11:** Actualizar `milestone_name` si aplica y `last_updated` con timestamp actual
- **D-12:** Actualizar la sección `## Performance Metrics` con los requirements completados reales
- **D-13:** Registrar Phase 22 como completed en `## Current Position`

### The Agent's Discretion
- Orden exacto de las operaciones de cleanup (primero grep, luego eliminación)
- Si actualizar también `.planning/MILESTONES.md` con el estado de v1.2 (recomendado pero opcional)
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Archivos a eliminar (verificar imports primero)
- `src/services/token-refresh.ts` — verificar con grep: `import.*token-refresh` en todo el proyecto
- `src/context/auth.context.tsx` — verificar con grep: `import.*auth.context` en todo el proyecto

### Archivo a modificar (remover botón dev)
- `app/(tabs)/dashboard.tsx` — bloque `{/* UAT: Reanimated Test */}` y `TouchableOpacity` que navega a `/reanimated-test` (líneas ~155-161)

### Documentos a actualizar
- `.planning/REQUIREMENTS.md` — checkboxes + traceability table
- `.planning/STATE.md` — conteos y status

### SUMMARY.md de referencia para verificar qué fue completado
- `.planning/phases/13-auth-integration/13-02-SUMMARY.md` — lista requirements completados: AUTH-01, 05, 06, 07, 08, API-02, 03, 05
- `.planning/phases/16-screen-integration/16-01-SUMMARY.md` a `16-06-SUMMARY.md` — screens conectadas
- `.planning/phases/21-error-handling-offline/` — completados al terminar Phase 21

### Decisión documentada (por qué token-refresh.ts es dead code)
- `.planning/phases/13-auth-integration/13-02-SUMMARY.md` — "Implement refresh token queue directly in api.ts response interceptor rather than separate token-refresh.ts file"
- `.planning/STATE.md` — Key Decisions: "Implement refresh token queue directly in api.ts (not separate token-refresh.ts)"
</canonical_refs>

<code_context>
## Existing Code Insights

### Dead Code Confirmado

**`src/services/token-refresh.ts`:**
- Exporta `tokenRefresh` object y `refreshTokens` function
- NINGÚN archivo en el proyecto hace `import ... from './token-refresh'` ni `from '@/services/token-refresh'`
- La lógica de refresh está completamente en `src/services/api.ts` (variables `isRefreshing`, `failedQueue`, función `processQueue`)
- Seguro eliminar

**`src/context/auth.context.tsx`:**
- Contiene solo `export {}` con un JSDoc `@deprecated`
- El módulo no exporta nada útil — cualquier import existente ya fallaría en TypeScript
- Seguro eliminar

**Botón reanimated-test en dashboard.tsx:**
- Líneas ~155-161: `{/* UAT: Reanimated Test */}` + `TouchableOpacity` con `router.push("/reanimated-test")`
- Navega a `app/reanimated-test.tsx` que tiene todos los colores hardcodeados y es un archivo de testing
- El archivo `reanimated-test.tsx` queda en el repo pero sin forma de navegar a él desde la app

### Estado real de REQUIREMENTS.md vs código

Requirements completados que siguen marcados como `[ ]`:
- `AUTH-01` ✓ — login screen usa `useLogin` mutation (login.tsx)
- `AUTH-05` ✓ — JWT attachment via interceptor (api.ts:35-47)
- `AUTH-06` ✓ — Stack.Protected guards en _layout.tsx
- `AUTH-07` ✓ — 401 refresh interceptor con queue (api.ts:73-127)
- `AUTH-08` ✓ — `router.replace` en login (login.tsx:241)
- `API-02` ✓ — axios request interceptor para JWT (api.ts:35-47)
- `API-03` ✓ — error handling 401/403/400/500 (api.ts:130-148)
- `API-05` ✓ — EXPO_PUBLIC_API_URL en config/api.ts
- `UI-04` ✓ — resources.tsx con FlatList + pagination
- `UI-06` ✓ — logbook.tsx con FlatList + pagination
- `UI-08` ✓ — bestiary.tsx con FlatList + pagination
- `UI-10` ✓ — trips.tsx con FlatList
- `UI-12` ✓ — map.tsx con supplies list

### Established Patterns
- Los archivos de documentación `.planning/` no tienen formato estricto — seguir el estilo existente
- Los checkboxes en REQUIREMENTS.md son `- [ ]` y `- [x]`
- El STATE.md tiene formato YAML frontmatter + markdown
</code_context>

<specifics>
## Specific Ideas

- Ejecutar grep de verificación antes de cualquier eliminación:
  - `grep -r "token-refresh" src/ app/` → debe retornar 0 resultados
  - `grep -r "auth.context" src/ app/` → debe retornar 0 resultados
- Al actualizar REQUIREMENTS.md, añadir una nota al pie indicando la fecha de la última sincronización manual
- STATE.md: al final de la fase el milestone v1.2 debería poder marcarse como "complete" con fecha
- MILESTONES.md puede actualizarse para reflejar que v1.2 está completo si todas las fases 13-22 terminaron
</specifics>

<deferred>
## Deferred Ideas

- Eliminar `app/reanimated-test.tsx` completamente — deferido; podría ser útil como referencia para futuras animaciones
- Actualizar `docs/ARCHITECTURE-DESIGN.md` para corregir la referencia a `(app)/(tabs)/` que no existe — deferido; documento de Entrega 1 ya fue entregado al profesor
- Agregar `.planning/CHANGELOG.md` con historial de decisiones por milestone — deferido a v2
</deferred>

---
*Phase: 22-code-cleanup*
*Context gathered: 2026-05-04*
