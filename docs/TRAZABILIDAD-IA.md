# Trazabilidad del Uso de IA en el Desarrollo de Astro_Beacon
**Fase:** Base Inicial (Entrega 1)  
**Curso:** EIF411 — Diseño y Programación de Plataformas Móviles (UNACR)  
**Fecha:** Abril 2026  
**Herramientas:** OpenCode CLI + GSD Framework + Modelos de IA Asistida  

---

## 1. Introducción

El desarrollo de la **Base Inicial** de Astro_Beacon se realizó bajo un enfoque de **desarrollo asistido por IA**, donde la inteligencia artificial actuó como copiloto técnico. La IA **no generó código ciegamente**; cada salida fue investigada, planificada, revisada por un humano, validada con pruebas UAT y finalmente integrada al repositorio.

Este documento traza cómo se utilizó la IA en cada etapa, cómo se aplicó el framework **Get-Shit-Done (GSD)**, el rol de **OpenCode**, el proceso de verificación humana y la estrategia de **UAT por fase**. La carpeta .planning guarda el historial de decisiones y modificaciones ejecutadas en cada una de las fases del Milestone implementado, con su plan, contexto y research definidos antes de la ejecucion de la fase.

---

## 2. Ecosistema de Herramientas

| Herramienta | Rol en el Desarrollo |
|-------------|----------------------|
| **OpenCode CLI** | Entorno de ejecución principal. Orquesta agentes de IA, gestiona contextos, ejecuta comandos y mantiene trazabilidad de decisiones. |
| **Framework GSD** | Metodología de desarrollo iterativo: `Research → Plan → Discuss → Execute → Verify`. Garantiza que cada fase tenga objetivos claros, planes ejecutables y criterios de éxito medibles. |
| **Modelos de IA** | Investigación técnica, generación de scaffolding, detección de deuda técnica, simulación de flujos de usuario, generación de documentación y escaneo de código. |
| **Reference Project** | `astro-beacon-reference/` (generado por Lovable). Usado como guía visual/UX, adaptado manualmente a React Native. |

---

## 3. Flujo de Trabajo por Fases (Trace de IA + Humano)

-**Project.md:** Contiene la visión general, objetivos y requerimientos del proyecto. La IA lo usó para entender el contexto global antes de cada fase.
-**Roadmap.md:** Desglosa el proyecto en hitos y fases. La IA generó planes detallados para cada fase basándose en este roadmap.
-**State.md:** Registro de decisiones, cambios y aprendizajes. La IA actualizó este documento con cada iteración, mientras que el humano validaba y corregía la información.

### 🔹 Phase 1: Arquitectura y Diseño
- **IA:** Investigó patrones de arquitectura RN, redactó `ARCHITECTURE-DESIGN.md`.
- **Humano:** Validó que los diagramas cumplieran "esfuerzo alto" de la rúbrica, ajustó la separación frontend/backend, aprobó la estructura de 3 capas.
- **UAT:** Revisión cruzada de diagramas vs requerimientos. Compilación de `tsconfig.json` verificada.

### 🔹 Phase 2: Diseño de Datos
- **IA:** Generó diagrama ER (Mermaid), diseñó 8 entidades con atributos tipados, creó 10 archivos TypeScript en `src/types-dtos/`.
- **Humano:** Verificó relaciones 1:N y N:M, alineó entidades con requerimientos de bitácora/recursos/viajes, aprobó estrategia offline sync.
- **UAT:** `tsc --noEmit` pasó sin errores. Validación de DTOs contra flujos de usuario reales.

### 🔹 Phase 3: Diseño Móvil (Mockups)
- **IA:** Investigó metáforas móviles, mapeó 13 pantallas web a estructura expo-router, documentó flujos en `MOCKUPS.md`.
- **Humano:** Adaptó layouts web (`max-w-lg`, fixed nav) a patrones nativos (bottom tabs, stack nav), validó accesibilidad táctil.
- **UAT:** Navegación manual en Expo Go. Verificación de 5 flujos de usuario. Prueba de pull-to-refresh y FAB.

### 🔹 Phase 4: Design System
- **IA:** Extrajo paleta del reference, creó `constants/`, `theme/`, 8 componentes UI reutilizables.
- **Humano:** Ajustó contraste para dark/light, verificó spacing consistente, aprobó zero border-radius como principio HUD.
- **UAT:** Toggle de tema en simulador. Renderizado de componentes en aislamiento. Verificación de `useTheme()` en todos los archivos.

### 🔹 Phase 5: Base App + Conexión API
- **IA:** Scaffold de rutas expo-router, `api.ts` con interceptores, `auth.context.tsx` con SecureStore.
- **Humano:** Corrigió placement de `AuthProvider` (movido a `_layout.tsx`), ajustó `KeyboardAvoidingView` para iOS/Android, validó Expo compatibility.
- **UAT:** Login → Dashboard flow. Verificación de redirect automático. Prueba de `npx expo start --offline`.

### 🔹 Phase 6: Refactorización de Estilos
- **IA:** Escaneó código en busca de hex hardcodeados, migró 5 pantallas a `tc.*`, corrigió componentes UI.
- **Humano:** Revisó manualmente cada archivo, arregló scanlines cortados, ajustó `ScrollView` para evitar sobreposición con teclado.
- **UAT:** `grep -r "#[0-9A-Fa-f]{6}" app/` → 0 resultados en producción. Prueba visual dark/light en 6 pantallas.

### 🔹 Phase 7: Verificación de Design System
- **IA:** Ejecutó auditoría, generó métricas de compliance, validó cross-platform.
- **Humano:** Revisión final de rúbrica, ajuste de estrellas fugaces, validación de `Platform.OS` en todos los layouts.
- **UAT:** Walkthrough completo de la app. Verificación de 32/32 puntos en rúbrica. Generación de `AUDITORIA-INTEGRIDAD.md`.

---

## 4. Rol del Humano en el Ciclo (Human-in-the-Loop)

La IA **asistió**, pero NOSOTROS **decidimos, validamos y corregimos**.

| Etapa | Intervención Humana |
|-------|---------------------|
| **Pre-execución** | Revisión de cada `PLAN.md` antes de ejecutar. Aprobación de dependencias y arquitectura. |
| **Correcciones Manuales** | Resolución de conflictos de casing, ajuste de `KeyboardAvoidingView`, fix de scanlines, validación de `Platform.OS`. |
| **Decisiones Arquitectónicas** | Elección de Expo Router vs React Navigation, Zustand vs Redux, MongoDB vs PostgreSQL. |
| **Code Ownership** | Todo código generado fue leído, comprendido y adaptado. Cero `copy-paste` ciego. |
| **Justificacion** | El humano entiende cada línea, patrón y decisión. La IA es herramienta, no autor. |

---

## 5. Estrategia UAT por Fase

Cada fase incluyó una **prueba de aceptación de usuario (UAT)** específica para validar que el entregable cumplía su objetivo funcional.

| Fase | UAT Realizado | Criterio de Éxito | Resultado |
|------|---------------|-------------------|-----------|
| 1. Arquitectura | Revisión de diagramas vs rúbrica | "Esfuerzo alto" en relaciones de componentes | ✅ Aprobado |
| 2. Datos | Compilación TS + validación de DTOs | `tsc --noEmit` sin errores | ✅ Aprobado |
| 3. Mockups | Navegación manual en Expo Go | 5 flujos completos, 0 rutas rotas | ✅ Aprobado |
| 4. Design System | Toggle dark/light + render components | 0 hardcodeados, colores consistentes | ✅ Aprobado |
| 5. Base App | Login → Dashboard flow | AuthContext funciona, redirect correcto | ✅ Aprobado |
| 6. Refactorización | `grep` de hex + visual check | 100% `tc.*` en producción | ✅ Aprobado |
| 7. Verificación | Walkthrough completo + rúbrica | 32/32 puntos, cross-platform OK | ✅ Aprobado |

**UAT Adicional:** `reanimated-test.tsx` → Pantalla dedicada para verificar animaciones Reanimated 4 con New Architecture.

---

## 6. Métricas de Uso de IA

| Métrica | Valor |
|---------|-------|
| Fases completadas con asistencia de IA | 7/7 |
| Planes generados por IA | 18 |
| Archivos creados/modificados | ~49 |
| Commits con revisión humana previa | 100% |
| Blind merges (sin revisión) | 0 |
| Tiempo ahorrado vs desarrollo manual | ~60% |

---

## 7. Lecciones Aprendidas

1. **La IA acelera la iteración, no reemplaza el criterio arquitectónico.** Sin el framework GSD, la IA generaría código inconsistente.
2. **El contexto es rey.** OpenCode mantuvo `PROJECT.md`, `ROADMAP.md` y `STATE.md` actualizados para que cada fase partiera de información verificada.
3. **La validación humana es obligatoria.** Errores de casing, `Platform.OS` y layout overlaps solo se detectaron con revisión manual, ademas de la compatibilidad con modo claro y oscuro.
4. **UAT por fase evita deuda acumulada.** Verificar al final de cada fase redujo bugs en un ~80%.
5. **Referencia visual ≠ código copiable.** El proyecto Lovable se usó como guía estética, no como base técnica. La adaptación a RN requirió decisiones humanas constantes.

---

## 8. Conclusión

El desarrollo de la Base Inicial de Astro_Beacon demuestra que **la IA asistida, estructurada por un framework de ingeniería y supervisada por un humano, produce código de calidad profesional**. Cada fase fue investigada, planificada, ejecutada, verificada y aceptada con trazabilidad completa.

El proyecto está listo con:
- ✅ Código limpio y documentado
- ✅ Design system 100% compliant
- ✅ Cross-platform iOS/Android
- ✅ UAT por fase verificada
- ✅ Trazabilidad completa de decisiones

---

*Documento elaborado para Entrega 1 — Base Inicial (10%)*  
*EIF411 — Diseño y Programación de Plataformas Móviles — UNACR*  
*Abril 2026*
