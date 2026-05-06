import { z } from 'zod';

// Enums matching frontend and models
export const speciesClassificationEnum = z.enum([
  'animal',
  'planta',
  'recurso',
  'microorganismo',
  'desconocido',
  'otro',
]);

export const dangerLevelEnum = z.enum([
  'amigable',
  'cauteloso',
  'peligroso',
  'letal',
  'desconocido',
]);

export type SpeciesClassification = z.infer<typeof speciesClassificationEnum>;
export type DangerLevel = z.infer<typeof dangerLevelEnum>;

// Create species schema
export const createSpeciesSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  classification: speciesClassificationEnum,
  dangerLevel: dangerLevelEnum.optional().default('amigable'),
  description: z.string().optional().default(''),
  imageUrl: z.string().optional().or(z.literal('')),
  notes: z.string().optional().default(''),
  iaConfidence: z.number().optional().default(0),
  classifiedByAI: z.boolean().optional().default(false),
});

// Identify species schema
export const identifySpeciesSchema = z.object({
  imageBase64: z.string().min(1, 'Base64 image string is required').max(533333, 'Image too large (max ~400KB)'),
});

// Update species schema (partial of create)
export const updateSpeciesSchema = createSpeciesSchema.partial();

// Query schemas
export const speciesQuerySchema = z.object({
  classification: speciesClassificationEnum.optional(),
  dangerLevel: dangerLevelEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// Export inferred types
export type CreateSpeciesInput = z.infer<typeof createSpeciesSchema>;
export type UpdateSpeciesInput = z.infer<typeof updateSpeciesSchema>;
export type SpeciesQueryInput = z.infer<typeof speciesQuerySchema>;
