import { z } from 'zod';

// Enums matching frontend and models
export const astronautStatusEnum = z.enum(['activo', 'inactivo', 'emergencia']);

export type AstronautStatus = z.infer<typeof astronautStatusEnum>;

// Create astronaut schema
export const createAstronautSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Name is required').trim(),
  status: astronautStatusEnum.optional().default('activo'),
  birthDate: z.string().optional(), // ISO date string
  specializations: z.array(z.string()).optional().default([]),
});

// Update astronaut schema (partial of create)
export const updateAstronautSchema = createAstronautSchema.partial();

// Export inferred types
export type CreateAstronautInput = z.infer<typeof createAstronautSchema>;
export type UpdateAstronautInput = z.infer<typeof updateAstronautSchema>;
