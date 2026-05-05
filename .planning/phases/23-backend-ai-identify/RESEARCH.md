<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AI-01 | `POST /api/v1/species/identify` acepta `{ imageBase64: string }` y retorna `{ classification, dangerLevel, name, description, confidence }` | Added `identifySpeciesSchema` validation and controller logic mapping. Base64 size limits handled by `app.ts` (10mb limit exists). |
| AI-02 | Google Cloud Vision API analiza la imagen y mapea labels a enums `SpeciesClassification` y `DangerLevel` | Mapped `@google-cloud/vision` API responses to domain enums using a keyword matching dictionary. |
| AI-03 | Fallback determinístico retorna `{ classification: "desconocido", dangerLevel: "cauteloso", confidence: 0 }` si Vision API falla | Integrated `try/catch` in service layer to suppress Vision API errors and return the default object. |
</phase_requirements>

# Phase 23: Backend AI Identify - Research

**Researched:** 2026-05-05
**Domain:** Backend API, AI Integration, Google Cloud Vision
**Confidence:** HIGH

## Summary

The phase involves adding a new protected POST endpoint `/api/v1/species/identify` which accepts a base64 encoded image, passes it to the Google Cloud Vision API for label detection, and maps those labels to our domain specific enums. If the Vision API fails or lacks credentials, the system must return a deterministic fallback response. 

Additionally, because the images will now be stored in the database as base64 strings (per ROADMAP decision), the existing `species.schema.ts` needs to be updated. `imageUrl` currently requires a valid URL, which rejects data URIs and base64 strings.

**Primary recommendation:** Integrate `@google-cloud/vision`, relax `imageUrl` validation in Zod to accept base64 data URIs, and ensure the identify route is placed before any dynamic parameter routes in `species.routes.ts`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| AI Identification Route | API / Backend | — | New express endpoint `/api/v1/species/identify` inside `species.controller.ts` |
| Image Payload Parsing | API / Backend | — | `app.ts` already configures `express.json({ limit: '10mb' })`, perfectly handling ~300kb base64 payloads |
| External AI Service | External Service| API / Backend | `@google-cloud/vision` SDK called by `species.service.ts` |
| Data Validation | API / Backend | — | `species.schema.ts` must parse and validate `imageBase64` |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@google-cloud/vision` | 5.3.6 | Official Google Cloud SDK | Native support for label detection and buffer processing without building HTTP requests manually |

**Installation:**
```bash
npm install @google-cloud/vision
```

## Architecture Patterns

### Pattern 1: Base64 String Validation in Zod
**What:** The `imageUrl` attribute in `species.schema.ts` currently strictly requires `.url()`, which rejects Base64 strings. We need to allow data URIs.
**When to use:** When storing frontend-provided images directly in MongoDB as strings instead of uploading to S3/Cloudinary.
**Example:**
```typescript
// En species.schema.ts
// Remove .url() constraint to allow base64 string
export const createSpeciesSchema = z.object({
  // ... other fields
  imageUrl: z.string().optional().or(z.literal('')),
});

export const identifySpeciesSchema = z.object({
  imageBase64: z.string().min(1, 'Base64 image string is required'),
});
```

### Pattern 2: Deterministic Fallback on External API Failure
**What:** Wrapping the external API call in a `try/catch` and returning a mocked success response rather than throwing a 500 error.
**When to use:** When the application should degrade gracefully and still allow manual data entry if the AI service goes offline or runs out of quota.
**Example:**
```typescript
try {
  // Call Vision API
  const [result] = await visionClient.labelDetection({ image: { content: buffer } });
  // Process result...
} catch (error) {
  // Log but do not throw
  console.warn('[Vision API] Failed to identify image, using fallback', error);
  return {
    classification: SpeciesClassification.DESCONOCIDO,
    dangerLevel: DangerLevel.CAUTELOSO,
    name: 'Especie Desconocida',
    description: 'La identificación automática no está disponible en este momento.',
    confidence: 0
  };
}
```

### Pattern 3: Route Ordering for New Endpoints
**What:** Express routes are evaluated top-down. A route like `POST /identify` could conflict with `GET /:id` if methods matched, but it's still best practice to place static paths before dynamic ones.
**When to use:** Adding a specific endpoint to an existing router that also contains dynamic parameters.
**Example:**
```typescript
// In species.routes.ts
// Place BEFORE any /:id routes
router.post('/identify', identifySpecies);

// GET /api/v1/species/:id
router.get('/:id', getSpeciesById);
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Label Detection HTTP Client | Custom `fetch`/`axios` calls to `vision.googleapis.com` | `@google-cloud/vision` SDK | Handles authentication automatically if `GOOGLE_APPLICATION_CREDENTIALS` is present, and wraps base64 encoding/decoding efficiently |
| Base64 Prefix Parsing | Manual `string.replace('data:image/jpeg;base64,', '')` | Regex matching | The prefix can vary (`image/png`, `image/webp`). Use `replace(/^data:image\/\w+;base64,/, '')` to extract pure base64 for the API. |

## Common Pitfalls

### Pitfall 1: Passing the Data URI prefix to Vision API
**What goes wrong:** The Vision API throws an error because it expects raw base64 data, but Expo ImagePicker often includes `data:image/jpeg;base64,` at the start of the string.
**Why it happens:** Passing the full frontend data URI directly to the backend SDK.
**How to avoid:** Strip the prefix before sending to Google Cloud Vision:
`const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');`

### Pitfall 2: Payload Too Large Error
**What goes wrong:** Express rejects the `POST` request with a `413 Payload Too Large`.
**Why it happens:** The default `express.json()` limit is 100kb, and base64 strings inflate image size by ~33%.
**Prevention strategy:** This is **already mitigated**. `api/src/app.ts` contains `app.use(express.json({ limit: '10mb' }));`, which is plenty for the ~300kb requirement.

### Pitfall 3: Not Handling `null` Labels
**What goes wrong:** `Cannot read properties of null (reading 'description')`.
**Why it happens:** Vision API can return an empty array or `null` for `labelAnnotations` if the image is unrecognizable or completely black.
**How to avoid:** Use optional chaining and fallback: `const labels = result.labelAnnotations || [];`

## Code Examples

### Mapping Vision Labels to Domain Enums
```typescript
// Dictionary logic for mapping Google Cloud Vision labels to Domain Enums
const labelMap: Record<string, SpeciesClassification> = {
  'animal': SpeciesClassification.ANIMAL,
  'mammal': SpeciesClassification.ANIMAL,
  'bird': SpeciesClassification.ANIMAL,
  'plant': SpeciesClassification.PLANTA,
  'tree': SpeciesClassification.PLANTA,
  'mineral': SpeciesClassification.RECURSO,
  'water': SpeciesClassification.RECURSO,
  // add more as needed
};

// Example function to process labels
function processLabels(labels: any[]) {
  let classification = SpeciesClassification.DESCONOCIDO;
  let dangerLevel = DangerLevel.CAUTELOSO;
  let confidence = 0;
  
  for (const label of labels) {
    const desc = label.description?.toLowerCase() || '';
    if (labelMap[desc]) {
      classification = labelMap[desc];
      confidence = Math.round((label.score || 0) * 100);
      
      // Basic danger heuristic
      if (['predator', 'carnivore', 'wildlife'].includes(desc)) {
        dangerLevel = DangerLevel.PELIGROSO;
      }
      break; // Found our primary classification
    }
  }
  
  return { classification, dangerLevel, confidence };
}
```

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Backend | ✓ | Any > 18 | — |
| `@google-cloud/vision` | Identify Endpoint | ✗ | 5.3.6 | Fallback determinístico (implemented) |
| GCP Credentials | `@google-cloud/vision` | ✗ | — | Fallback determinístico (implemented) |

**Missing dependencies with fallback:**
- `@google-cloud/vision` needs to be installed (`npm install @google-cloud/vision`)
- Without `GOOGLE_APPLICATION_CREDENTIALS` (or corresponding API config), the service will throw on initialization or first call, which will correctly trigger the AI-03 deterministic fallback.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | jest 29.7.0 |
| Config file | `api/jest.config.js` (assumed based on `package.json`) |
| Quick run command | `npm test` |
| Full suite command | `npm run test:coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AI-01 | Accepts base64 image and returns object | unit | `npm test -- api/src/controllers/species.controller.test.ts` | ❌ Wave 0 |
| AI-02 | Vision API label mapping to enums | unit | `npm test -- api/src/services/species.service.test.ts` | ❌ Wave 0 |
| AI-03 | Deterministic fallback works when API fails | unit | `npm test -- api/src/services/species.service.test.ts` | ❌ Wave 0 |

## Sources

### Primary (HIGH confidence)
- `api/src/app.ts` - Verified payload limits (`10mb`).
- `api/src/schemas/species.schema.ts` - Verified current `imageUrl` `.url()` strict validation constraint.
- `api/src/routes/species.routes.ts` - Verified routing architecture and auth middleware.
- Google Cloud Vision Node.js documentation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - `google-cloud/vision` is the standard SDK.
- Architecture: HIGH - Mappings directly fulfill requirements.
- Pitfalls: HIGH - Base64 extraction is a standard hurdle in mobile-to-AI flows.

**Research date:** 2026-05-05
**Valid until:** 2026-11-05