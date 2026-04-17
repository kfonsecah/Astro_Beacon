import { z } from 'zod';

// Enums matching frontend and models
export const resourceCategoryEnum = z.enum([
  'oxigeno',
  'agua',
  'comida',
  'medico',
  'equipo',
  'otro',
]);

export const movementTypeEnum = z.enum(['ingreso', 'egreso']);

export type ResourceCategory = z.infer<typeof resourceCategoryEnum>;
export type MovementType = z.infer<typeof movementTypeEnum>;

// Movement schema
export const movementSchema = z.object({
  type: movementTypeEnum,
  amount: z.number().min(0, 'Amount must be non-negative'),
  notes: z.string().optional(),
  timestamp: z.date().optional(),
  previousAmount: z.number().min(0),
  newAmount: z.number().min(0),
});

// Create resource schema
export const createResourceSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  category: resourceCategoryEnum,
  currentAmount: z.number().min(0).optional().default(0),
  unit: z.string().optional().default('unidades'),
  threshold: z.number().min(0).optional(),
});

// Update resource schema (partial of create)
export const updateResourceSchema = createResourceSchema.partial();

// Create movement schema (for adding movement to existing resource)
export const createMovementSchema = z.object({
  type: movementTypeEnum,
  amount: z.number().min(0, 'Amount must be non-negative'),
  notes: z.string().optional(),
});

// Query schemas
export const resourceQuerySchema = z.object({
  category: resourceCategoryEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// Export inferred types
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type CreateMovementInput = z.infer<typeof createMovementSchema>;
export type ResourceQueryInput = z.infer<typeof resourceQuerySchema>;
