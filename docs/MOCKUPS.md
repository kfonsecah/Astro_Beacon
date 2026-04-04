# Astro_Beacon — Diseño Móvil y Navegación

**EIF411 — Diseño y Programación de Plataformas Móviles**
**Fase:** Base Inicial (Entrega 1)
**Fecha:** Abril 2026

---

## 1. Árbol de Navegación

```
Root Stack (app/_layout.tsx)
├── (auth)/                         # Grupo: Pantallas públicas
│   └── login.tsx                   #   Login con ID de agente
│
├── (tabs)/                         # Grupo: App principal con bottom tabs
│   ├── dashboard.tsx               #   Tab 1: Panel de control HUD
│   ├── bestiary.tsx                #   Tab 2: Catálogo de especies
│   ├── resources.tsx               #   Tab 3: Gestión de recursos
│   ├── map.tsx                     #   Tab 4: Mapa de exploración
│   └── logbook.tsx                 #   Tab 5: Registros de misión
│
├── species/                        # Stack: Pantallas de detalle
│   ├── [id].tsx                    #   Detalle de especie
│   └── identify.tsx                #   Identificación por foto (modal)
│
├── exploration/                    # Stack: Flujo de expedición
│   └── index.tsx                   #   Tracking de viaje activo
│
└── +not-found.tsx                  # Fallback 404
```

---

## 2. Tabla de Rutas

| Ruta | Tipo | Pantalla | Cómo llegar | Descripción |
|------|------|----------|-------------|-------------|
| `/(auth)/login` | Stack | Login | AuthGuard en _layout.tsx redirige si no autenticado | Autenticación con ID de agente + contraseña |
| `/(tabs)/dashboard` | Tab | Dashboard | Tab 1 (Panel) | Panel principal con recursos, alertas, progreso de misión |
| `/(tabs)/bestiary` | Tab | Bitácora | Tab 2 (Bitácora) | Catálogo de especies descubiertas con clasificación IA |
| `/(tabs)/resources` | Tab | Recursos | Tab 3 (Recursos) | Inventario completo e historial de movimientos |
| `/(tabs)/map` | Tab | Mapa | Tab 4 (Mapa) | Mapa GPS con suministros y expediciones |
| `/(tabs)/logbook` | Tab | Registros | Tab 5 (Registros) | Timeline de entradas de misión con sync status |
| `/species/[id]` | Stack push | Species Detail | Tap en tarjeta de especie | Detalle completo con foto, clasificación, audio |
| `/species/identify` | Modal | Identificación | FAB en Bitácora | Captura de foto para clasificación por IA |
| `/exploration/` | Stack push | Expedición | Botón "Iniciar Expedición" en Mapa | Tracking de viaje con consumo de O₂ |
| `/log-resource` | Stack push | Registrar Recurso | Botón en Recursos | Formulario de ingreso/egreso de recursos |

---

## 3. Descripción de Pantallas

### 3.1 Login (`/(auth)/login.tsx`)
**Implementada:** ✅
- Fondo con estrellas parpadeantes (50 estrellas con animación de opacidad)
- Estrellas fugaces (5 estrellas que cruzan la pantalla diagonalmente)
- Overlay de scanlines (efecto HUD)
- Logo ASTRO_BEACON con fade-in escalonado
- Campo ID DE AGENTE con cursor parpadeante al enfocar
- Campo CLAVE DE ACCESO con toggle mostrar/ocultar (👁)
- Botón [ AUTENTICAR ] con efecto tap (scale 0.98)
- Estado "AUTENTICANDO..." con texto pulsante
- Indicador de conexión: punto pulsante + "ENLACE ESTABLECIDO — SEÑAL DÉBIL"
- Dark/Light mode fully supportado
- KeyboardAvoidingView con Platform.OS específico (iOS + Android)

### 3.2 Dashboard (`/(tabs)/dashboard.tsx`)
**Implementada:** ✅
- Header: "PANEL DE CONTROL" + día en planeta
- Alertas de recursos (banner naranja)
- 4 barras de recursos segmentadas (O₂, Agua, Comida, Médico)
- Tarjeta de progreso de misión (estado, señal, próximo suministro)
- Quick actions: Expedición + Tomar Foto

### 3.3 Bitácora (`/(tabs)/bestiary.tsx`)
**Implementada:** ✅
- Header: "BITÁCORA DE ESPECIES" + contador
- Grid de tarjetas con: thumbnail, nombre, badge de clasificación, indicador de peligro, confianza IA
- Pull-to-refresh
- 6 especies mock con diferentes clasificaciones y niveles de peligro

### 3.4 Recursos (`/(tabs)/resources.tsx`)
**Implementada:** ✅
- Header: "GESTIÓN DE RECURSOS"
- 5 recursos con barras segmentadas y alertas de nivel crítico
- Historial de movimientos (ingreso/egreso) con iconos, razón y fecha
- Colores: verde para ingresos, rojo para egresos

### 3.5 Mapa (`/(tabs)/map.tsx`)
**Implementada:** ✅
- Header: "MAPA DE EXPLORACIÓN" + coordenadas
- Placeholder de mapa con grid overlay
- Marcadores: ubicación actual, suministros, base camp
- Lista de suministros con status badge (pendiente/entregado/recogido), distancia, ETA

### 3.6 Registros (`/(tabs)/logbook.tsx`)
**Implementada:** ✅
- Header: "REGISTROS DE MISIÓN" + contador
- Timeline de entradas con: fecha, descripción, especie asociada, sync status
- Indicadores: ✅ Sincronizado / ⏳ Pendiente
- FAB (+) para nueva entrada
- Pull-to-refresh

### 3.7 Species Detail (`/species/[id].tsx`)
**Implementada:** ❌ Documentada
- Foto grande de la especie
- Nombre, clasificación, nivel de peligro
- Descripción detallada
- Coordenadas de descubrimiento
- Botón de narración por audio
- Confianza de la IA

### 3.8 Species Identify (`/species/identify.tsx`)
**Implementada:** ❌ Documentada
- Vista de cámara a pantalla completa
- Overlay de escaneo (animación)
- Resultado de clasificación IA después de captura
- Opción de confirmar o corregir clasificación

### 3.9 Exploration (`/exploration/index.tsx`)
**Implementada:** ❌ Documentada
- Timer de consumo de O₂ en tiempo real
- Distancia al destino
- Botón de emergencia (abortar viaje)
- Resumen al completar: O₂ consumido, recursos recolectados, duración

### 3.10 Log Resource (`/log-resource/index.tsx`)
**Implementada:** ❌ Documentada
- Selector de recurso
- Selector de tipo (ingreso/egreso)
- Campo de cantidad
- Campo de razón
- Vinculación opcional a viaje

---

## 4. Flujos de Usuario

### Flujo 1: Autenticación
```
App → AuthGuard (_layout.tsx) → Si no auth → Login
→ [Ingresar ID + contraseña] → AuthContext.login()
→ Si auth → Redirect → Dashboard
```

### Flujo 2: Exploración Completa
```
Dashboard → Tab Mapa → [Ver suministros] → Iniciar Expedición
→ /exploration/ → [Tracking de O₂] → Completar viaje
→ Resumen → Registrar recursos recolectados
```

### Flujo 3: Descubrimiento de Especie
```
Dashboard → Tab Bitácora → [Ver especies] → Tap en especie
→ /species/[id] → [Ver detalle] → [Escuchar narración]
→ Volver
```

### Flujo 4: Clasificación por IA
```
Tab Bitácora → FAB "Nueva Entrada" → /species/identify
→ [Tomar foto] → [IA clasifica] → [Confirmar/Corregir]
→ Guardar en bitácora
```

### Flujo 5: Gestión de Recursos Offline
```
Tab Recursos → [Ver inventario] → Registrar movimiento
→ Si offline: se encola localmente
→ Al reconectar: se sincroniza automáticamente
→ Status cambia a "Sincronizado"
```

---

## 5. Metáforas Móviles

| Metáfora | Dónde Aplicada | Por Qué |
|----------|---------------|---------|
| **Bottom Tabs** | Navegación principal (5 tabs) | Patrón primario de navegación móvil, accesible con el pulgar |
| **Stack Navigation** | Species detail, exploration, login | Patrón drill-down con botón back nativo |
| **Pull-to-Refresh** | Bitácora, Registros | Gesto estándar para actualizar listas en móvil |
| **FAB (Floating Action Button)** | Registros (nueva entrada) | Acceso rápido a la acción principal, patrón Material Design |
| **Haptic Feedback** | Tab presses (expo-haptics instalado) | Confirmación táctil al cambiar de tab |
| **Segmented Progress Bars** | Recursos en Dashboard y Recursos | Visualización HUD de niveles, reemplaza circular progress |
| **Status Badges** | Suministros, entradas de bitácora | Indicadores visuales de estado (pendiente/sincronizado) |
| **Safe Area Handling** | Todas las pantallas (SafeAreaView) | Maneja notches y home indicators en dispositivos modernos |
| **Skeleton Loading** | Placeholder para datos async | Estado de carga estándar en apps móviles |

---

## 6. Estética HUD

### Paleta de Colores
| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `background` | `#0B1120` | `#F3F4F6` | Fondo principal |
| `surface` | `#111827` | `#FFFFFF` | Tarjetas y contenedores |
| `border` | `#1F2937` | `#E5E7EB` | Bordes de tarjetas |
| `primary` | `#6EE7B7` | `#059669` | Acentos, headers, datos activos |
| `warning` | `#FB923C` | `#EA580C` | Alertas, suministros pendientes |
| `success` | `#22C55E` | `#16A34A` | Ingresos, especies amigables |
| `danger` | `#EF4444` | `#DC2626` | Egresos, niveles críticos, especies letales |
| `text` | `#E5E7EB` | `#111827` | Texto principal |
| `textMuted` | `#6B7280` | `#9CA3AF` | Texto secundario, labels |

### Tipografía
- **Familia:** Monospace (system monospace)
- **Headers:** 16-18px, letter-spacing 3-4
- **Labels:** 9-11px, letter-spacing 2
- **Data:** 12-14px, letter-spacing 1
- **Footer:** 8-9px, letter-spacing 1

### Principios de Layout
- **Zero border-radius:** Todos los elementos con esquinas rectas (estética HUD)
- **Card-based:** Contenido agrupado en tarjetas con bordes sutiles
- **Segmented bars:** Barras de progreso divididas en segmentos (estética militar/HUD)
- **Full-bleed:** Contenido ocupa todo el ancho (no max-width como en web)
- **Safe areas:** SafeAreaView en todas las pantallas (notch + home indicator)
- **Cross-platform:** Platform.OS para diferencias iOS/Android (KeyboardAvoidingView, offsets)

### Dark/Light Mode
- **Implementado:** ✅ Todos los componentes usan `useTheme()` + `tc.*`
- **Transición:** StatusBar cambia automáticamente (`light`/`dark`)
- **Tab bar:** Colores de fondo y tints responden al tema
- **0 colores hardcodeados** en producción (ver AUDITORIA-INTEGRIDAD.md)

---

## 7. Referencias

### Archivos Implementados
- `app/_layout.tsx` — Root Stack con route groups
- `app/index.tsx` — Redirect a login
- `app/(auth)/_layout.tsx` — Auth Stack
- `app/(auth)/login.tsx` — Pantalla de login
- `app/(tabs)/_layout.tsx` — Bottom Tabs (5 tabs)
- `app/(tabs)/dashboard.tsx` — Panel de control HUD
- `app/(tabs)/bestiary.tsx` — Catálogo de especies
- `app/(tabs)/resources.tsx` — Gestión de recursos
- `app/(tabs)/map.tsx` — Mapa de exploración
- `app/(tabs)/logbook.tsx` — Registros de misión

### Documentos Relacionados
- [ARCHITECTURE-DESIGN.md](./ARCHITECTURE-DESIGN.md) — Arquitectura del sistema
- [DATA-DESIGN.md](./DATA-DESIGN.md) — Diseño de datos
- `astro-beacon-reference/` — Proyecto de referencia visual (Lovable)

---

*Documento elaborado como parte de la Entrega 1 — Base Inicial (10%)*
*EIF411 — Diseño y Programación de Plataformas Móviles — UNACR*
