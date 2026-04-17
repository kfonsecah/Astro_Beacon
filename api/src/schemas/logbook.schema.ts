import { z } from 'zod';

// GeoPoint schema
export const geoPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

// Create logbook entry schema
export const createLogbookSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().optional().default(''),
  photoUrl: z.string().url().optional().or(z.literal('')),
  location: geoPointSchema.optional(),
  speciesId: z.string().optional(), // ObjectId string
});

// Update logbook entry schema (partial of create)
export const updateLogbookSchema = createLogbookSchema.partial();

// Query schemas
export const logbookQuerySchema = z.object({
  speciesId: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// Export inferred types
export type CreateLogbookInput = z.infer<typeof createLogbookSchema>;
export type UpdateLogbookInput = z.infer<typeof updateLogbookSchema>;
export type LogbookQueryInput = z.infer<typeof logbookQuerySchema>;
