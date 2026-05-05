---
phase: 23-backend-ai-identify
reviewed: 2026-05-05T17:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - api/package.json
  - api/.env.example
  - api/src/schemas/species.schema.ts
  - api/src/services/species.service.ts
  - api/src/controllers/species.controller.ts
  - api/src/routes/species.routes.ts
  - api/src/services/species.service.test.ts
  - api/src/controllers/species.controller.test.ts
  - api/jest.config.js
findings:
  critical: 1
  warning: 4
  info: 2
  total: 7
status: issues_found
---

# Phase 23: Code Review Report

**Reviewed:** 2026-05-05
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

The implementation of the AI identification service is inconsistent. While the service code implements a Gemini AI-based solution using the `@google/generative-ai` SDK, the unit tests are written for a completely different implementation (Google Vision API via axios). This results in a broken test suite. Additionally, there are several robustness issues regarding AI response validation and input handling.

## Critical Issues

### CR-01: Implementation-Test Mismatch (Broken Tests)

**File:** `api/src/services/species.service.test.ts`
**Issue:** The service implementation in `species.service.ts` uses Gemini AI with the official SDK, but the tests mock `axios` and expect the response structure of the Google Vision API (e.g., `labelAnnotations`).
**Fix:** Rewrite `species.service.test.ts` to mock `GoogleGenerativeAI` from `@google/generative-ai` instead of `axios`, and update assertions to match the Gemini implementation's logic and response format.

## Warnings

### WR-01: Unvalidated AI Response Values

**File:** `api/src/services/species.service.ts:187-193`
**Issue:** The service parses JSON from the AI response but does not validate that `classification` and `dangerLevel` match the expected enum values. If the AI returns an unexpected string (e.g., "Animal" capitalized or "predator"), subsequent database saves will fail with Mongoose validation errors.
**Fix:**
```typescript
      const aiResult = JSON.parse(jsonMatch[0]);

      // Normalize and validate
      const classification = Object.values(SpeciesClassification).includes(aiResult.classification?.toLowerCase()) 
        ? aiResult.classification.toLowerCase() as SpeciesClassification 
        : SpeciesClassification.DESCONOCIDO;

      const dangerLevel = Object.values(DangerLevel).includes(aiResult.dangerLevel?.toLowerCase())
        ? aiResult.dangerLevel.toLowerCase() as DangerLevel
        : DangerLevel.CAUTELOSO;

      return {
        classification,
        dangerLevel,
        name: aiResult.name || 'Especie No Identificada',
        description: aiResult.description || 'No se pudo generar una descripción.',
        confidence: aiResult.confidence || 0.5,
      };
```

### WR-02: Fragile JSON Extraction from AI Output

**File:** `api/src/services/species.service.ts:182`
**Issue:** Using `text.match(/\{[\s\S]*\}/)` to extract JSON is fragile. If the AI provides additional text or multiple curly-brace blocks, `JSON.parse` might fail.
**Fix:** Use a more robust parsing method or improve the prompt to encourage cleaner output, and add a try-catch block specifically around the JSON parsing to handle malformed AI output gracefully by returning the fallback.

### WR-03: Unhandled ObjectId Conversion Errors

**File:** `api/src/services/species.service.ts:74, 98, 120`
**Issue:** `new mongoose.Types.ObjectId(speciesId)` is called directly on user-provided strings from the URL. If the string is not a valid 24-character hex ID, Mongoose throws a `BSONError` which results in a 500 Internal Server Error instead of a 400 Bad Request.
**Fix:** Add Zod validation for the `id` parameter in the controller or use a utility to validate the ObjectId before conversion:
```typescript
if (!mongoose.Types.ObjectId.isValid(speciesId)) {
  throw new AppError('Invalid ID format', 400);
}
```

### WR-04: Hardcoded MIME Type in AI Request

**File:** `api/src/services/species.service.ts:175`
**Issue:** The MIME type is hardcoded to `image/jpeg`. If the frontend sends a PNG or another supported format, the AI might misinterpret it or the SDK might complain.
**Fix:** Detect the MIME type from the base64 prefix or allow it to be passed from the controller.
```typescript
const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
```

## Info

### IN-01: Confusing Environment Variable Naming

**File:** `api/src/services/species.service.ts:28` and `api/.env.example:22`
**Issue:** `GOOGLE_VISION_API_KEY` is used to initialize `GoogleGenerativeAI` (Gemini). While functional, it is misleading as these are different Google services.
**Fix:** Rename to `GOOGLE_AI_API_KEY` or `GEMINI_API_KEY`.

### IN-02: Requirement vs. Implementation Mismatch

**File:** `api/src/services/species.service.ts`
**Issue:** The phase instructions specified using "Google Cloud Vision API via REST calls with axios", but the code implements "Gemini AI via the @google/generative-ai SDK".
**Fix:** Ensure the change in technology is documented and approved, as it significantly differs from the original plan and affects how the AI is billed and configured.

---

_Reviewed: 2026-05-05_
_Reviewer: gsd-code-reviewer_
_Depth: standard_
