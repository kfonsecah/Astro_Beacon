# Astro_Beacon — Pendientes y Gaps vs. Project Requirements

**Generado:** 2026-05-06
**Base:** Auditoría de `project-requirements.md` contra `.planning/ROADMAP.md`
**Entrega final:** semana 15, 3 de junio 2026

---

## Fase 27 — Tab de Recursos (planificada, pendiente de ejecutar)

Alineada con **Gestión de Recursos §3** del profesor:
> "Se debe categorizar los recursos, de forma que sea fácil agregar o disminuir los recursos, debe de tener un registro de estos ingresos y egresos."

| Plan | Qué hace |
|---|---|
| 27-01 | Corrige ProgressBar con `maxCapacity`, mueve historial dentro de las cards, fix colores hardcodeados |
| 27-02 | Añade colores/símbolo por categoría, completa validación de egreso en log-resource |

---

## Gaps sin fase asignada (ordenados por riesgo)

### ALTO — Gamificacion

**Requerimiento del profesor:**
> "La aplicación debe incluir elementos de gamificación, como progresos, niveles, logros o recompensas visuales, integrados de forma funcional a los procesos del sistema."

**Criterio de evaluación (defensa):**
> "La gamificación aporta valor real a la experiencia del usuario."

**Estado actual:** Ninguna fase en el roadmap aborda esto.

**Sugerencia de implementacion:**
- Indicador de "Dias sobrevividos" en el dashboard
- Sistema de logros desbloqueables (primera especie clasificada, primer viaje completado, recursos al 100%)
- Barra de progreso de misión con porcentaje de requerimientos cumplidos
- Feedback visual al completar acciones (animacion de éxito en log-resource, bestiary, etc.)

---

### MEDIO — siempreVisible en recursos

**Requerimiento del profesor:**
> "El estudiante debe definir más y deben identificar cuáles deben estar siempre a la vista."

**Estado actual:** El campo `siempreVisible: boolean` existe en el modelo de datos y el backend, pero la UI de recursos no lo usa. No se diferencia visualmente cuáles recursos son prioritarios.

**Fix sugerido:** En `resources.tsx`, mostrar recursos con `siempreVisible: true` primero (sort) y con un indicador visual distinto (borde más marcado o badge "PRIORITARIO").

---

### MEDIO — Session timeout por inactividad

**Requerimiento del profesor:**
> "La sesión del usuario debe expirar tras un período de inactividad, bloqueando el acceso hasta una nueva autenticación."

**Estado actual:** Phase 13 implementa JWT con refresh token, pero no hay lógica de timeout por inactividad en el frontend (AppState listener + timer que llame a logout si supera X minutos sin interacción).

**Fix sugerido:** En `auth.store.ts` o un hook global, registrar `lastActivity` y comparar en cada interacción. Si `now - lastActivity > TIMEOUT`, llamar a `logout()`.

---

### MEDIO — ESLint + Prettier + CSpell en el flujo

**Requerimiento del profesor:**
> "Se debe integrar el uso de ESLint, Prettier y CSpell como parte del flujo de trabajo."

**Estado actual:** Phase 22 (Code Cleanup) menciona eliminación de código muerto pero no configura explícitamente estas herramientas. El proyecto tiene ESLint (`eslint-config-expo`) pero Prettier y CSpell no están confirmados.

**Accion requerida:**
- Verificar que `.eslintrc` / `eslint.config.js` esté activo y pase sin warnings
- Agregar `prettier` + `.prettierrc` si no existe
- Agregar `cspell` + `cspell.json` con diccionario en español para términos del proyecto

---

### MEDIO — Pruebas de integracion

**Requerimiento del profesor (defensa):**
> "Se valora el cumplimiento de los requerimientos y se revisan las pruebas de integración y procesos."

**Estado actual:** Hay `jest-expo` en devDependencies y una carpeta `__tests__` en services, pero no hay fase dedicada a pruebas de integración end-to-end.

**Sugerencia:** Al menos tener pruebas de los hooks principales (`useLogin`, `useResources`, `useLogbookEntries`) con mocks de axios que cubran los flujos críticos. El proyecto ya tiene `axios-mock-adapter` instalado.

---

### BAJO-MEDIO — Bitacora busqueda inversa por foto

**Requerimiento del profesor:**
> "Debe tener la opción de investigar a un ser de nuestra bitácora con una foto, es decir, si ya existe en nuestra bitácora, debe ser detectado y mostrado al astronauta de forma fácil y clara."

**Estado actual:** Phase 25 implementa identificación IA (clasificar una nueva especie), pero no la comparación contra entradas existentes de la bitácora (deduplicación / búsqueda por similitud visual).

**Alcance posible:** El endpoint de identificación podría retornar un match si la clasificación coincide con una especie ya registrada. Es una mejora del flujo de `species/identify.tsx`.

---

## Requerimientos completamente cubiertos (referencia)

| Requerimiento | Fase |
|---|---|
| Bitácora: fotos + clasificación IA + guardar en registros | 23, 24, 25 |
| Bitácora: narración por audio | 25 |
| Bitácora: offline + sincronización al reconectar | 21 |
| Mapa GPS con suministros de la NASA | 17 |
| Viaje con countdown de oxígeno en tiempo real | 17 |
| Alertas de recursos bajo mínimo | 16-02 |
| Registro de ingresos y egresos de recursos | 26 + 27 |
| Dashboard con métricas del campamento | 16-01 |
| Gestos (minimo 2, justificados) | 26 |
| Seguridad + JWT + rutas protegidas | 13 |
| Paginación y carga diferida en listas | 16+ |
| Diseño HUD espacial + animaciones | 04, 20+ |
| Arquitectura orientada a servicios (API REST separada) | 08, 15 |
| React Native + TypeScript | base del proyecto |
| Uso de IA documentado y trazable | docs/TRAZABILIDAD-IA.md |

---

## Cronograma sugerido hasta la defensa

| Fecha aprox. | Tarea |
|---|---|
| 2026-05-06 a 05-10 | Ejecutar Phase 27 (recursos tab fix + log-resource) |
| 2026-05-10 a 05-17 | Gamificacion (nueva fase 28 recomendada) |
| 2026-05-17 a 05-24 | Session timeout + siempreVisible + ESLint/Prettier/CSpell |
| 2026-05-24 a 05-31 | Pruebas de integracion + Phase 22 Code Cleanup |
| 2026-06-01 a 06-03 | Ensayo de defensa, datos de prueba, documentacion final |

---

*Generado: 2026-05-06*
*Próxima revisión recomendada: tras ejecutar Phase 27*
