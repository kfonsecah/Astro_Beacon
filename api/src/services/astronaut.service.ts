import mongoose from 'mongoose';
import { Astronaut, IAstronaut, AstronautStatus } from '../models/astronaut.model.js';
import { Trip, TripStatus } from '../models/trip.model.js';
import { Species } from '../models/species.model.js';
import { Resource } from '../models/resource.model.js';
import { AppError } from '../middlewares/error.middleware.js';
import type {
  CreateAstronautInput,
  UpdateAstronautInput
} from '../schemas/astronaut.schema.js';

export interface DashboardStats {
  resourcesCount: number;
  activeTrips: number;
  speciesDiscovered: number;
}

export class AstronautService {
  /**
   * Create or update astronaut profile
   */
  async createOrUpdate(
    userId: string,
    input: CreateAstronautInput
  ): Promise<IAstronaut> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if astronaut exists
    const existing = await Astronaut.findOne({ userId: userObjectId });

    if (existing) {
      // Update existing
      const updated = await Astronaut.findByIdAndUpdate(
        existing._id,
        {
          ...input,
          lastModified: new Date()
        },
        { new: true, runValidators: true }
      );
      return updated!;
    }

    // Create new
    const astronaut = await Astronaut.create({
      ...input,
      userId: userObjectId
    });

    return astronaut;
  }

  /**
   * Find astronaut by userId
   */
  async findByUser(userId: string): Promise<IAstronaut | null> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return Astronaut.findOne({ userId: userObjectId });
  }

  /**
   * Find astronaut by ID and update
   */
  async update(
    userId: string,
    astronautId: string,
    input: UpdateAstronautInput
  ): Promise<IAstronaut> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Verify ownership
    const existing = await Astronaut.findOne({
      _id: new mongoose.Types.ObjectId(astronautId),
      userId: userObjectId
    });

    if (!existing) {
      throw new AppError('Astronaut not found', 404);
    }

    const astronaut = await Astronaut.findByIdAndUpdate(
      new mongoose.Types.ObjectId(astronautId),
      {
        ...input,
        lastModified: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!astronaut) {
      throw new AppError('Astronaut not found', 404);
    }

    return astronaut;
  }

  /**
   * Get dashboard stats for astronaut
   */
  async getDashboard(userId: string): Promise<DashboardStats> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [resourcesCount, activeTrips, speciesDiscovered] = await Promise.all([
      Resource.countDocuments({ userId: userObjectId }),
      Trip.countDocuments({
        userId: userObjectId,
        status: TripStatus.ACTIVO
      }),
      Species.countDocuments({ userId: userObjectId })
    ]);

    return {
      resourcesCount,
      activeTrips,
      speciesDiscovered
    };
  }
}

export const astronautService = new AstronautService();