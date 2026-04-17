import { z } from 'zod';

// Enums matching frontend and models
export const tripStatusEnum = z.enum([
  'planificado',
  'activo',
  'completado',
  'abortado',
]);

export type TripStatus = z.infer<typeof tripStatusEnum>;

// O2 adjustment schema
export const o2AdjustmentSchema = z.object({
  amount: z.number().default(0),
  note: z.string().default(''),
  timestamp: z.date().optional(),
});

// O2 config schema
export const o2ConfigSchema = z.object({
  baseRate: z.number().min(0).default(1),
  manualAdjustments: z.array(o2AdjustmentSchema).default([]),
});

// Create trip schema
export const createTripSchema = z.object({
  name: z.string().trim().optional(),
  destination: z.string().optional().default(''),
  status: tripStatusEnum.optional().default('planificado'),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  plannedDuration: z.number().int().positive().optional(),
  O2Config: o2ConfigSchema.optional(),
});

// Update trip schema
export const updateTripSchema = createTripSchema.partial();

// Start trip schema (status transition from planificado to activo)
export const startTripSchema = z.object({
  startDate: z.string().optional(), // ISO date string
});

// End trip schema (status transition from activo to completado/abortado)
export const endTripSchema = z.object({
  status: z.enum(['completado', 'abortado']),
  endDate: z.string().optional(), // ISO date string
});

// O2 adjustment input (for adding manual adjustment during trip)
export const addO2AdjustmentSchema = z.object({
  amount: z.number(),
  note: z.string().optional(),
});

// Export inferred types
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type StartTripInput = z.infer<typeof startTripSchema>;
export type EndTripInput = z.infer<typeof endTripSchema>;
export type AddO2AdjustmentInput = z.infer<typeof addO2AdjustmentSchema>;
