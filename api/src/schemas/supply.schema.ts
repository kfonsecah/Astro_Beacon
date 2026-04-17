import { z } from 'zod';

// Enums matching frontend and models
export const supplyStatusEnum = z.enum([
  'pendiente',
  'entregado',
  'recogido',
  'expirado',
]);

export type SupplyDropStatus = z.infer<typeof supplyStatusEnum>;

// GeoPoint schema
export const geoPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

// Create supply schema
export const createSupplySchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  description: z.string().optional().default(''),
  status: supplyStatusEnum.optional().default('pendiente'),
  location: geoPointSchema,
  contents: z.array(z.string()).optional().default([]),
  deliveredAt: z.string().optional(), // ISO date string
  expiresAt: z.string().optional(), // ISO date string
});

// Update supply schema (partial of create including status transition)
export const updateSupplySchema = createSupplySchema.partial();

// Collect supply schema (status transition to recogido)
export const collectSupplySchema = z.object({
  collectedAt: z.string().optional(), // ISO date string
});

// Nearby query schema for geospatial queries (SUPP-03)
export const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().int().positive().optional().default(1000), // meters
  status: supplyStatusEnum.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// Export inferred types
export type CreateSupplyInput = z.infer<typeof createSupplySchema>;
export type UpdateSupplyInput = z.infer<typeof updateSupplySchema>;
export type CollectSupplyInput = z.infer<typeof collectSupplySchema>;
export type NearbyQueryInput = z.infer<typeof nearbyQuerySchema>;
