# Astro_Beacon — Arquitectura y Diseño del Sistema

**EIF411 — Diseño y Programación de Plataformas Móviles**
**Universidad Nacional, Sede Regional Brunca**
**Prof. Daniel Granados Murillo**

**Versión:** 1.0
**Fecha:** Abril 2026
**Fase:** Base Inicial (Entrega 1)

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Arquitectura General](#2-arquitectura-general)
3. [Frontend — React Native + Expo](#3-frontend--react-native--expo)
4. [Backend — API REST](#4-backend--api-rest)
5. [Comunicación Frontend-Backend](#5-comunicación-frontend-backend)
6. [Servicios Externos](#6-servicios-externos)
7. [Patrones de Diseño Aplicados](#7-patrones-de-diseño-aplicados)
8. [Decisiones Técnicas Justificadas](#8-decisiones-técnicas-justificadas)
9. [Consideraciones de Seguridad](#9-consideraciones-de-seguridad)
10. [Referencias](#10-referencias)

---

## 1. Introducción

Astro_Beacon es una aplicación móvil de exploración planetaria desarrollada como proyecto final de la materia EIF411. El sistema simula la asistencia a una astronauta varada en un planeta desconocido, proporcionando herramientas de supervivencia que incluyen:

- **Bitácora de descubrimientos:** Registro fotográfico con clasificación automática por IA
- **Gestión de recursos:** Control de oxígeno, agua, comida y suministros con alertas
- **Navegación GPS:** Mapa con ubicación de suministros enviados por la NASA
- **Soporte offline:** Funcionalidad sin conexión con sincronización automática
- **Narración por audio:** Descripción auditiva de especies descubiertas

Este documento presenta la arquitectura completa del sistema, los patrones de diseño aplicados y las justificaciones técnicas de cada decisión. Los diagramas de arquitectura se encuentran en `docs/diagrams/architecture.drawio` (abrir con [draw.io](https://app.diagrams.net/)).

---

## 2. Arquitectura General

### 2.1 Estilo Arquitectónico

El sistema sigue una **arquitectura cliente-servidor** con separación clara entre frontend y backend, cumpliendo con el requerimiento del curso de una "arquitectura moderna orientada a servicios":

```
┌─────────────────────┐       HTTPS/REST        ┌─────────────────────┐
│   Mobile App        │ ◄─────────────────────► │   API REST Server   │
│   React Native/Expo │       JSON + JWT        │   Node.js/Express   │
└─────────────────────┘                         └──────────┬──────────┘
                                                           │
                                          ┌────────────────┼────────────────┐
                                          │                │                │
                                   ┌──────▼──────┐  ┌─────▼──────┐  ┌────▼─────┐
                                   │  MongoDB    │  │  OpenAI    │  │  Maps    │
                                   │  Database   │  │  Vision    │  │  SDK     │
                                   └─────────────┘  └────────────┘  └──────────┘
```

### 2.2 Componentes del Sistema

| # | Componente | Tecnología | Responsabilidad |
|---|-----------|------------|-----------------|
| 1 | Frontend Mobile | React Native + Expo SDK 54 | Interfaz de usuario, lógica de presentación, device APIs |
| 2 | API REST | Node.js + Express v4 | Endpoints versionados, autenticación, lógica de negocio |
| 3 | Base de Datos | MongoDB + Mongoose | Persistencia de usuarios, especies, recursos, viajes |
| 4 | AI Classification | OpenAI GPT-4o Vision | Clasificación automática de especies fotografiadas |
| 5 | Maps/GPS | expo-maps / react-native-maps | Visualización de coordenadas y suministros |

### 2.3 Diagramas

Ver archivo `docs/diagrams/architecture.drawio` con 3 páginas:

1. **System Architecture:** Vista general del sistema con todos los componentes y flujos de datos
2. **Frontend Internal Architecture:** 6 capas internas del frontend (Routing → Screens → Hooks → Services → State → UI Components)
3. **Backend 3-Layer Architecture:** Arquitectura de 3 capas del backend (Routes → Controllers → Services → Repositories → MongoDB)

---

## 3. Frontend — React Native + Expo

### 3.1 Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Expo SDK | ~54.0.33 | Framework base con managed workflow |
| React Native | 0.81.5 | Framework de UI móvil |
| React | 19.1.0 | Biblioteca de componentes |
| TypeScript | ~5.9.2 | Tipado estático |
| expo-router | ~6.0.23 | File-based routing |
| Zustand | 5.x | State management global |
| @tanstack/react-query | ^5.x | Server state y caching |
| react-native-reanimated | ~4.1.1 | Animaciones a 60fps |
| react-native-gesture-handler | ~2.28.0 | Gestos y touch |
| zod | ^3.x | Validación de esquemas |

### 3.2 Organización de Carpetas

La estructura sigue la organización definida por la cátedra, combinando **layer-first** con **feature-based sub-grouping**:

```
project/
├── app/                          # expo-router (SOLO rutas)
│   ├── (auth)/                   # Grupo público: login, register
│   ├── (app)/                    # Grupo protegido
│   │   ├── (tabs)/               # Bottom tabs: Dashboard, Bitácora, Mapa, Recursos, Perfil
│   │   ├── species/[id].tsx      # Species detail (stack)
│   │   ├── exploration/index.tsx # Active trip tracking
│   │   └── log-resource/index.tsx
│   └── _layout.tsx               # Root layout con auth guard
│
├── src/                          # Lógica de la app
│   ├── components/
│   │   ├── ui/                   # Primitivas genéricas: Button, Card, Input
│   │   ├── common/               # Compartidos: AppHeader, Loading, EmptyState
│   │   └── space/                # Dominio: ResourceBar, SpaceCard, HudIndicator
│   ├── hooks/                    # Custom hooks: useAuth, useResources, useSpecies
│   ├── services/                 # Comunicación externa: api.ts, sync.service.ts
│   ├── context/                  # React Context providers
│   ├── stores/                   # Zustand stores: authStore, resourceStore
│   ├── constants/                # colors.ts, spacing.ts, typography.ts
│   ├── theme/                    # dark.ts, light.ts, fonts.ts
│   ├── types-dtos/               # TypeScript interfaces y DTOs
│   ├── utils/                    # Pure helpers: formatters, validators
│   └── screens/                  # Screen components con .styles.ts
│
├── api/                          # Backend API (proyecto separado)
├── docs/                         # Documentación
└── assets/                       # Imágenes, fuentes, iconos
```

### 3.3 Patrón Presentación-Contenedor

Se aplica el patrón **smart/dumb components** donde:

- **Componentes de presentación (dumb):** Reciben datos vía props, no manejan estado ni lógica de negocio. Son reutilizables y testeables.
- **Contenedores (smart):** Pantallas y hooks que manejan estado, efectos secundarios y lógica de negocio.

**Ejemplo:**

```tsx
// DUMB: src/components/space/ResourceBar.tsx
interface ResourceBarProps {
  label: string;
  value: number;
  max: number;
  criticalThreshold?: number;
}

export function ResourceBar({ label, value, max, criticalThreshold = 15 }: ResourceBarProps) {
  const percentage = (value / max) * 100;
  const isCritical = percentage < criticalThreshold;
  return (
    <View style={styles.container}>
      <Text style={[styles.label, isCritical && styles.critical]}>{label}</Text>
      <View style={styles.bar}>{/* segmentos */}</View>
      <Text style={styles.value}>{Math.round(percentage)}%</Text>
    </View>
  );
}

// SMART: app/(app)/(tabs)/resources.tsx
export default function ResourcesScreen() {
  const { resources, isLoading } = useResources();
  if (isLoading) return <LoadingScreen />;
  return (
    <ScrollView>
      {resources.map((r) => (
        <ResourceBar key={r.id} label={r.name} value={r.current} max={r.max} />
      ))}
    </ScrollView>
  );
}
```

### 3.4 Custom Hooks como Capa de Abstracción

Los custom hooks encapsulan la lógica de negocio entre las pantallas y los servicios:

| Hook | Responsabilidad |
|------|----------------|
| `useAuth` | Estado de autenticación, session timeout, login/logout |
| `useResources` | CRUD de recursos, alertas de umbral crítico |
| `useSpecies` | Bitácora, identificación por IA, caché offline |
| `useOffline` | Detección de conectividad, estado de sync |
| `useLocation` | GPS, tracking de expediciones |
| `useTheme` | Toggle dark/light HUD theme |

### 3.5 Service Layer

Todos los accesos externos (API, storage, device APIs) pasan por servicios. Las pantallas y hooks **nunca** llaman `fetch`, `AsyncStorage` o device APIs directamente.

```tsx
// src/services/api.ts
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: attach JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(error);
  }
);
```

### 3.6 State Management con Zustand

Se utiliza **Zustand** sobre Redux/Context porque:

- **Menos boilerplate:** Un solo `create()` vs actions + reducers + store
- **Sin providers:** No necesita envolver la app en `<Provider>`
- **Persist middleware:** Integración nativa con AsyncStorage para offline
- **Selectores granulares:** Evita re-renders innecesarios

```tsx
const useResourceStore = create<ResourceStore>()(
  persist(
    (set) => ({
      resources: [/* initial */],
      updateResource: (id, delta) => set((state) => ({
        resources: state.resources.map((r) =>
          r.id === id ? { ...r, current: r.current + delta } : r
        ),
      })),
    }),
    { name: 'astro-beacon-resources', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

### 3.7 Navegación con expo-router

expo-router proporciona **file-based routing** con route groups para separar flujos:

- `(auth)/` — Pantallas públicas (login, register)
- `(app)/(tabs)/` — Bottom tabs protegidos (Dashboard, Bitácora, Mapa, Recursos, Perfil)
- `(app)/species/[id].tsx` — Rutas dinámicas para detalle de especies

El root layout (`app/_layout.tsx`) actúa como **auth guard**, redirigiendo según el estado de autenticación.

### 3.8 Animaciones

**react-native-reanimated 4** reemplaza a framer-motion (web-only del reference project). Todas las animaciones se ejecutan en el UI thread mediante worklets, garantizando 60fps:

- Transiciones de entrada en pantallas
- Efectos HUD (glow, scanlines adaptados a RN)
- Animaciones de escaneo de especies
- Feedback de gestos

---

## 4. Backend — API REST

### 4.1 Arquitectura de 3 Capas

El backend sigue el patrón **Controller → Service → Repository**:

```
Request → Routes → Controllers → Middleware → Services → Repositories → MongoDB
Response ← Routes ← Controllers ← Services ← Repositories ← MongoDB
```

| Capa | Responsabilidad | Ejemplo |
|------|----------------|---------|
| **Routes** | Definición de endpoints HTTP | `GET /api/v1/species` |
| **Controllers** | Manejo de request/response HTTP | `SpeciesController.getAll()` |
| **Services** | Lógica de negocio, llamadas externas | `SpeciesService.classifyWithAI()` |
| **Repositories** | Acceso a datos (Mongoose) | `SpeciesRepository.findByUser()` |

### 4.2 Endpoints Planificados (v1)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/auth/login` | POST | Autenticación con JWT |
| `/api/v1/auth/register` | POST | Registro de astronauta |
| `/api/v1/auth/refresh` | POST | Refresh de token |
| `/api/v1/species` | GET | Listar especies del usuario |
| `/api/v1/species` | POST | Crear entrada de bitácora |
| `/api/v1/species/identify` | POST | Clasificar imagen con IA |
| `/api/v1/resources` | GET | Obtener recursos actuales |
| `/api/v1/resources/log` | POST | Registrar ingreso/egreso |
| `/api/v1/trips` | POST | Iniciar expedición |
| `/api/v1/trips/:id/end` | PUT | Finalizar expedición |
| `/api/v1/sync/push` | POST | Sincronizar datos offline |
| `/api/v1/sync/pull` | GET | Obtener datos actualizados |

### 4.3 Documentación API

Se utiliza **Swagger/OpenAPI** con `swagger-jsdoc` y `swagger-ui-express`. La documentación se genera automáticamente desde anotaciones JSDoc en los controladores, proporcionando:

- Interfaz interactiva para probar endpoints
- Esquemas de request/response tipados
- Ejemplos de uso

### 4.4 Base de Datos

**MongoDB** fue seleccionado por:

- **Schema flexible:** Ideal para la bitácora donde las especies pueden tener atributos variables
- **Compatibilidad con JSON:** Los documentos BSON mapean directamente a objetos JavaScript
- **MongoDB Atlas:** Hosting gratuito en la nube, sin instalación local
- **Mongoose ODM:** Validación de esquemas, middleware, population de relaciones

**Colecciones principales:**

| Colección | Contenido |
|-----------|-----------|
| `users` | Astronautas, credenciales, configuración |
| `species` | Entradas de bitácora con fotos y clasificación |
| `resources` | Registro histórico de recursos |
| `trips` | Expediciones con coordenadas y consumo |
| `sync_queue` | Operaciones pendientes de sincronización |

---

## 5. Comunicación Frontend-Backend

### 5.1 Protocolo

- **HTTPS/REST** como protocolo principal
- **JSON** como formato de datos
- **JWT Bearer Token** para autenticación
- **Pagination** en endpoints que retornan listas

### 5.2 Manejo de Errores

**Respuesta de error estandarizada:**

```json
{
  "success": false,
  "error": {
    "code": "SPECIES_NOT_FOUND",
    "message": "No se encontró la especie con ID xyz",
    "details": {}
  }
}
```

**Estrategia en frontend:**

- Interceptor de axios maneja 401 (logout automático)
- React Query maneja retries con exponential backoff
- UI muestra error states con componentes dedicados

### 5.3 Offline Sync Strategy

1. **Detección:** `@react-native-community/netinfo` monitorea conectividad
2. **Cola:** Operaciones offline se encolan en Zustand store con persist
3. **Flush:** Al reconectar, se procesan operaciones en orden (mutex para evitar race conditions)
4. **Resolución:** Last-write-wins para conflictos simples

---

## 6. Servicios Externos

| Servicio | Propósito | Integración |
|----------|-----------|-------------|
| **OpenAI GPT-4o Vision** | Clasificación automática de especies | API REST desde backend (SpeciesService) |
| **expo-maps / react-native-maps** | Visualización GPS de suministros | SDK nativo en frontend |
| **expo-camera / expo-image-picker** | Captura de fotos para bitácora | SDK nativo en frontend |
| **expo-speech** | Narración de especies por audio | SDK nativo en frontend |
| **expo-location** | Coordenadas GPS del astronauta | SDK nativo en frontend |

---

## 7. Patrones de Diseño Aplicados

### 7.1 Presentación-Contenedor (Smart/Dumb)

**Por qué:** Separa la lógica de negocio de la presentación. Los componentes dumb son puros, reutilizables y testeables. Los smart components manejan estado y efectos.

**Dónde:** Todas las pantallas y componentes del proyecto.

### 7.2 Repository Pattern (Backend)

**Por qué:** Abstrae el acceso a datos. Si se cambia de MongoDB a otra base de datos, solo se modifica el repository, no los services ni controllers.

**Dónde:** `api/src/repositories/` — Un repository por entidad.

### 7.3 Service Layer Abstraction

**Por qué:** Centraliza toda comunicación externa. Facilita testing (mocking de servicios), caching, y manejo de errores consistente.

**Dónde:** `src/services/` en frontend y `api/src/services/` en backend.

### 7.4 Observer Pattern

**Por qué:** Zustand stores y NetInfo usan el patrón Observer — los componentes se suscriben a cambios de estado y se actualizan automáticamente.

**Dónde:** Suscripciones a Zustand stores, listener de NetInfo para offline/online.

### 7.5 Middleware Pattern

**Por qué:** Permite procesar requests de forma encadenada (auth → validation → rate limit → handler). Cada middleware tiene una responsabilidad única.

**Dónde:** Pipeline de Express en el backend.

### 7.6 Adapter Pattern

**Por qué:** Los servicios actúan como adaptadores entre la app y APIs externas (OpenAI, Maps, Camera). Si cambia el proveedor, solo se adapta el servicio.

**Dónde:** `species.service.ts` adapta la llamada a OpenAI Vision.

---

## 8. Decisiones Técnicas Justificadas

| Decisión | Opción A | Opción B | Justificación |
|----------|----------|----------|---------------|
| **State Management** | Zustand | Redux Toolkit | Zustand requiere 80% menos boilerplate, no necesita providers, tiene persist integrado. Redux es overkill para este proyecto. |
| **Routing** | expo-router | React Navigation manual | expo-router es el estándar oficial de Expo, genera rutas desde el sistema de archivos, soporta typed routes y deep linking. |
| **Base de Datos** | MongoDB | PostgreSQL | MongoDB ofrece schema flexible para la bitácora (especies con atributos variables), mapeo directo a JSON, y MongoDB Atlas gratuito. |
| **Validación** | Zod | Yup / manual | Zod es TypeScript-first, genera tipos automáticamente desde esquemas, y es composable. |
| **Almacenamiento de Tokens** | expo-secure-store | AsyncStorage | expo-secure-store usa Keychain (iOS) y Keystore (Android) — cifrado nativo. AsyncStorage es texto plano. |
| **Server State** | TanStack Query | SWR / manual | React Query ofrece caching automático, stale-while-revalidate, optimistic updates y soporte offline superior. |
| **Animaciones** | react-native-reanimated | react-native-animated | Reanimated 4 ejecuta en UI thread (60fps), soporta worklets, y es compatible con React 19 y New Architecture. |
| **API Documentation** | Swagger/OpenAPI | Redocly / manual | Swagger es el estándar de la industria, genera UI interactiva automáticamente, y es ampliamente conocido. |
| **Backend Framework** | Express | FastAPI | Express es el estándar en Node.js, el equipo tiene experiencia en JavaScript/TypeScript, y facilita la defensa del proyecto. |
| **Organización de Código** | Layer-first + feature sub-groups | Feature-first | La estructura del profesor es layer-first. Se agregan feature sub-groups dentro de cada capa para mantenibilidad. |

### 8.1 Adaptación del Reference Project

El proyecto `astro-beacon-reference/` (generado por Lovable) define la estética visual pero usa tecnologías web incompatibles con React Native:

| Reference (Web) | Equivalente React Native | Notas |
|-----------------|-------------------------|-------|
| Tailwind CSS | StyleSheet.create() + design system | Tailwind no es nativo en RN |
| Framer Motion | react-native-reanimated | Framer Motion es web-only |
| shadcn/ui | Componentes UI custom en `src/components/ui/` | Adaptar patrones visuales, no el código |
| React Router DOM | expo-router | expo-router es file-based, no declarativo |
| Google Fonts | expo-font + IBM Plex Mono / Space Grotesk | Cargar fuentes como assets |
| Recharts | react-native-svg + custom charts | O simplificar con barras de progreso nativas |

---

## 9. Consideraciones de Seguridad

### 9.1 Autenticación

- **JWT tokens** con expiración configurada
- **expo-secure-store** para almacenamiento cifrado de tokens
- **Session timeout** por inactividad (requerimiento del curso)
- **Route guards** en expo-router que protegen rutas `(app)/`

### 9.2 Validación de Entrada

- **Zod schemas** en frontend para validar inputs de usuario
- **Validación en backend** con middleware de Zod antes de procesar requests
- **Sanitización** de datos antes de almacenar en MongoDB

### 9.3 Comunicación Segura

- **HTTPS obligatorio** para todas las comunicaciones con la API
- **Bearer tokens** en cada request (vía interceptor de axios)
- **Refresh tokens** para renovación silenciosa de sesión

---

## 10. Referencias

### Documentación Oficial

- [Expo Router](https://docs.expo.dev/router/introduction/) — File-based routing
- [Zustand](https://github.com/pmndrs/zustand) — State management
- [TanStack Query](https://tanstack.com/query/latest) — Server state
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) — Animaciones
- [MongoDB](https://www.mongodb.com/docs/) — Base de datos NoSQL
- [Express.js](https://expressjs.com/) — Framework backend

### Proyecto

- `project-requirements.md` — Requerimientos del curso
- `docs/diagrams/architecture.drawio` — Diagramas de arquitectura
- `.planning/PROJECT.md` — Contexto del proyecto
- `.planning/ROADMAP.md` — Roadmap de fases
- `astro-beacon-reference/` — Proyecto de referencia visual (Lovable)

---

*Documento elaborado como parte de la Entrega 1 — Base Inicial (10%)*
*EIF411 — Diseño y Programación de Platauntas Móviles — UNACR*
