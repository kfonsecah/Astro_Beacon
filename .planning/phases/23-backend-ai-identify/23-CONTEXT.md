# Phase 23: Backend AI Identify Endpoint - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Implementar `POST /api/v1/species/identify` en el backend Express. El endpoint recibe una imagen en base64, la envía a Google Cloud Vision API, mapea los labels devueltos a los enums del dominio (`SpeciesClassification`, `DangerLevel`), y retorna un objeto de clasificación. Si Vision API falla o no hay API key configurada, un fallback determinístico retorna valores seguros sin lanzar excepción.

NO se modifica ninguna pantalla del frontend en esta fase.

</domain>

<decisions>
## Implementation Decisions

### Transporte de imagen
- **D-01:** La imagen viaja como base64 en el body JSON: `{ imageBase64: string }` (data URI o raw base64)
- **D-02:** NO se usa multer ni multipart/form-data — el frontend ya convierte a base64 con expo-image-picker
- **D-03:** Tamaño máximo aceptado: ~400 KB base64 (imagen comprimida quality 0.4, maxWidth 800 desde frontend)

### Google Cloud Vision API
- **D-04:** Usar `LABEL_DETECTION` feature de Vision API — lista de labels con score de confianza
- **D-05:** Endpoint REST de Vision API: `POST https://vision.googleapis.com/v1/images:annotate?key=API_KEY`
- **D-06:** API key almacenada en variable de entorno: `GOOGLE_VISION_API_KEY`
- **D-07:** Top 10 labels son suficientes para el mapeo

### Mapeo de labels a enums del dominio
- **D-08:** Mapeo por keywords en los labels devueltos por Vision:
  - `plant, flower, tree, vegetation, grass, leaf` → `SpeciesClassification.PLANTA`
  - `animal, mammal, bird, reptile, insect, creature, organism` → `SpeciesClassification.ANIMAL`
  - `mineral, rock, crystal, metal, ore` → `SpeciesClassification.RECURSO`
  - `bacteria, fungus, microorganism, spore` → `SpeciesClassification.MICROORGANISMO`
  - Sin match claro → `SpeciesClassification.DESCONOCIDO`
- **D-09:** DangerLevel se infiere por labels de peligro:
  - `dangerous, predator, toxic, venomous, threat` → `peligroso`
  - `warning, aggressive, caution` → `cauteloso`
  - `friendly, harmless, gentle` → `amigable`
  - Sin match → `cauteloso` (conservador por defecto)
- **D-10:** `confidence` = score del primer label de Vision (0.0–1.0), devuelto como número

### Fallback
- **D-11:** Si `GOOGLE_VISION_API_KEY` no existe, o si Vision API retorna error, el fallback retorna:
  ```json
  { "classification": "desconocido", "dangerLevel": "cauteloso", "name": "Especie Desconocida", "description": "Clasificación no disponible.", "confidence": 0 }
  ```
- **D-12:** El fallback NO lanza excepción — el endpoint siempre retorna 200 con datos válidos

### Schema de Zod — PROBLEMA CONOCIDO
- **D-13:** `createSpeciesSchema` en `api/src/schemas/species.schema.ts` valida `imageUrl` como `z.string().url()`.
  Las data URIs (`data:image/jpeg;base64,...`) NO pasan esta validación.
  **Fix:** Cambiar la validación de `imageUrl` a `z.string().optional()` en el plan 23-01 para aceptar base64.

### Estructura del response
```json
{
  "success": true,
  "data": {
    "classification": "planta",
    "dangerLevel": "amigable",
    "name": "Planta Desconocida",
    "description": "Organismo vegetal detectado con alta confianza.",
    "confidence": 0.91
  }
}
```

</decisions>

<canonical_refs>
## Canonical References

### Backend existente
- `api/src/routes/species.routes.ts` — Agregar ruta `POST /identify` ANTES de `/:id` para evitar conflicto de rutas
- `api/src/controllers/species.controller.ts` — Agregar `identifySpecies` controller
- `api/src/services/species.service.ts` — Agregar `identifyWithVision()` method + `buildFallbackResult()`
- `api/src/schemas/species.schema.ts` — Fix `imageUrl` validation: cambiar `.url()` a `.optional()`
- `api/src/models/species.model.ts` — `SpeciesClassification` y `DangerLevel` enums (referencia para mapeo)

### Variables de entorno
- `api/.env` o `api/.env.example` — Agregar `GOOGLE_VISION_API_KEY=`

### Requirements
- `.planning/REQUIREMENTS.md` §AI Camera Detection — AI-01, AI-02, AI-03

### Arquitectura documentada
- `docs/ARCHITECTURE-DESIGN.md` §4.2 — `POST /api/v1/species/identify` planificado
- `docs/ARCHITECTURE-DESIGN.md` §6 — Google Cloud Vision como servicio externo

</canonical_refs>

<code_context>
## Existing Code Insights

### species.routes.ts — orden crítico de rutas
```ts
// CORRECTO: /identify ANTES de /:id
router.post('/identify', identifySpecies);   // nueva ruta
router.post('/', createSpecies);
router.get('/:id', getSpeciesById);          // si /identify va después, Express lo trata como id="identify"
```

### species.service.ts — método a agregar
```ts
async identifyWithVision(imageBase64: string): Promise<IdentifyResult> {
  // 1. Llamar a Google Vision API
  // 2. Mapear labels a SpeciesClassification + DangerLevel
  // 3. Retornar { classification, dangerLevel, name, description, confidence }
}
```

### createSpeciesSchema — fix requerido
```ts
// ANTES (falla con base64):
imageUrl: z.string().url().optional().or(z.literal(''))

// DESPUÉS (acepta base64 y URLs):
imageUrl: z.string().optional().default('')
```

### Auth middleware ya protege todas las rutas
```ts
router.use(authenticate);  // todas las rutas de species requieren JWT
```

### Response envelope del backend
```ts
res.status(200).json({ success: true, data: result });
```

</code_context>

<specifics>
## Specific Notes

- Google Cloud Vision API free tier: 1,000 requests/month — suficiente para demo y defensa
- La imagen base64 se envía directamente a Vision sin guardarla en disco — el backend es stateless
- El `name` inferido es genérico (ej. "Planta Desconocida") — el usuario lo edita en el formulario del frontend
- NO instalar dependencias pesadas: una llamada HTTP con `axios` (ya instalado) a Vision API es suficiente
- Plan 23-02 incluye test manual con Postman/Thunder Client del endpoint antes de pasar a Phase 24

</specifics>

<deferred>
## Deferred Ideas

- Rate limiting por usuario para el endpoint `/identify` (demasiado para el scope del proyecto)
- Cachear resultados de Vision por hash de imagen (optimización futura)
- Usar Google Cloud Vision SDK de npm en vez de REST directo (más robusto pero agrega dependencia)
- `expo-speech` y animaciones de escaneo → Phase 25

</deferred>

---

*Phase: 23-backend-ai-identify*
*Context gathered: 2026-05-05*
