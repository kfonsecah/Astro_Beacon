import { z } from 'zod';

export const walkChallengeStatusEnum = z.enum([
  'available',
  'in_progress',
  'completed',
]);

export const rewardSchema = z.object({
  oxigeno: z.number().default(0),
  agua: z.number().default(0),
  comida: z.number().default(0),
  equipo: z.number().default(0),
});

export const gpsPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  timestamp: z.string().datetime().or(z.string()),
});

export const updateGpsPointsSchema = z.object({
  gpsPoints: z.array(gpsPointSchema),
});

export type Reward = z.infer<typeof rewardSchema>;
export type GpsPoint = z.infer<typeof gpsPointSchema>;
export type UpdateGpsPointsInput = z.infer<typeof updateGpsPointsSchema>;
