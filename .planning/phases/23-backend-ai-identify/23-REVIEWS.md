---
phase: 23
reviewers: [gemini, claude, codex, cursor]
reviewed_at: 2026-05-05T20:15:00Z
plans_reviewed: [23-01-PLAN.md, 23-02-PLAN.md]
---

# Cross-AI Plan Review — Phase 23: Backend AI Identify Endpoint

## Consensus Summary

The implementation plans for Phase 23 are technically sound and correctly sequence the necessary infrastructure changes before behavioral logic. All reviewers agree that the identification of the route-ordering issue (placing `/identify` before `/:id`) and the decision to relax the `imageUrl` validation in Zod are critical and well-handled. The use of a deterministic fallback to prevent system crashes is also highly praised as a key factor for system resilience.

However, a major consensus concern emerged regarding the **label mapping algorithm**. The current plan implies an exact-match dictionary lookup, which will likely fail against real-world multi-word Vision API labels (e.g., "Flowering plant" vs "plant"). Additionally, the plans lack explicit **payload size enforcement** and **robust testing for fallback scenarios**, particularly those involving missing credentials or SDK-level failures.

### Agreed Strengths
- **Graceful Degradation:** Use of `try/catch` to ensure the API returns a safe fallback rather than failing on external dependency errors.
- **Route Integrity:** Proactive management of Express route ordering to avoid path shadowing.
- **TDD-First for Mapping:** Recognizing the complexity of label-to-enum translation and prioritizing unit tests for this logic.
- **Schema Alignment:** Correctly identifying the need to support Base64 strings in the existing `imageUrl` field.

### Agreed Concerns
- **Algorithm Flaw (HIGH):** Exact string matching for labels is insufficient; substring or keyword inclusion matching is required for multi-word labels.
- **Validation Gap (HIGH):** Lack of explicit `400 KB` limit enforcement in the Zod schema for the `imageBase64` payload.
- **Testing Gaps (MEDIUM):** No explicit tests for fallback triggered by missing environment variables or SDK constructor failures.
- **Logging (MEDIUM):** Silent error suppression without logging makes debugging production issues (like quota exhaustion) impossible.

### Divergent Views
- **Wave 1 Output:** Claude specifically flagged that Wave 1 might produce incomplete service output if the service is wired to the controller before mapping logic is injected. Other reviewers found the separation acceptable as an integration stub.
- **Zod Schema Drift:** Gemini pointed out a drift in `DangerLevel.DESCONOCIDO` between the Mongoose model and the Zod schema that should be unified.

## Recommendations for Improvement

1. **Refine Mapping Algorithm:** Update Plan 23-02 to use `includes()` matching instead of exact key lookups.
2. **Enforce Payload Limits:** Add a `max()` constraint to the `imageBase64` field in `identifySpeciesSchema` (approx. 533,333 characters for 400KB).
3. **Enhance Fallback Testing:** Include test cases that specifically mock the absence of `GOOGLE_VISION_API_KEY` and SDK-level errors.
4. **Improve Observability:** Update Task 2 in Plan 23-01 to ensure errors are logged (e.g., `console.warn`) before returning the fallback result.
5. **Contract Definition:** Explicitly define whether the response should be wrapped in the standard `{ success: true, data: { ... } }` envelope.

---

To incorporate this feedback into planning:
  `/gsd:plan-phase 23 --reviews`
