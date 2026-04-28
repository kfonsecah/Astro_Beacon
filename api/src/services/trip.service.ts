import mongoose from 'mongoose';
import { Trip, ITrip, TripStatus, IO2Adjustment } from '../models/trip.model.js';
import { AppError } from '../middlewares/error.middleware.js';
import { calculatePagination } from '../utils/pagination.js';
import type {
  CreateTripInput,
  UpdateTripInput,
  StartTripInput,
  EndTripInput,
  AddO2AdjustmentInput
} from '../schemas/trip.schema.js';

export class TripService {
  /**
   * Create a new trip
   */
  async create(userId: string, input: CreateTripInput): Promise<ITrip> {
    const trip = await Trip.create({
      ...input,
      userId: new mongoose.Types.ObjectId(userId),
      O2Config: input.O2Config ?? { baseRate: 1, manualAdjustments: [] },
      O2Consumed: 0
    });

    return trip;
  }

  /**
   * Find all trips for a user with pagination and optional status filter
   */
  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: TripStatus
  ) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, any> = { userId: userObjectId };
    if (status) {
      filter.status = status;
    }

    const [trips, total] = await Promise.all([
      Trip.find(filter)
        .sort({ lastModified: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Trip.countDocuments(filter)
    ]);

    const pagination = calculatePagination(page, limit, total);

    return {
      trips,
      pagination
    };
  }

  /**
   * Find a single trip by ID
   */
  async findOne(userId: string, tripId: string): Promise<ITrip> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const trip = await Trip.findOne({
      _id: new mongoose.Types.ObjectId(tripId),
      userId: userObjectId
    });

    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    return trip;
  }

  /**
   * Update a trip
   */
  async update(
    userId: string,
    tripId: string,
    input: UpdateTripInput
  ): Promise<ITrip> {
    // Verify ownership
    await this.findOne(userId, tripId);

    const trip = await Trip.findByIdAndUpdate(
      new mongoose.Types.ObjectId(tripId),
      {
        ...input,
        lastModified: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    return trip;
  }

  /**
   * Start a trip (status: planificado -> activo)
   */
  async start(userId: string, tripId: string, input?: StartTripInput): Promise<ITrip> {
    const trip = await this.findOne(userId, tripId);

    if (trip.status !== TripStatus.PLANIFICADO) {
      throw new AppError(
        `Cannot start trip with status ${trip.status}. Only 'planificado' trips can be started.`,
        400
      );
    }

    const startDate = input?.startDate ? new Date(input.startDate) : new Date();

    const updated = await Trip.findByIdAndUpdate(
      new mongoose.Types.ObjectId(tripId),
      {
        status: TripStatus.ACTIVO,
        startDate,
        lastModified: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new AppError('Trip not found', 404);
    }

    return updated;
  }

  /**
   * Complete a trip (status: activo -> completado)
   */
  async complete(userId: string, tripId: string, input?: EndTripInput): Promise<ITrip> {
    const trip = await this.findOne(userId, tripId);

    if (trip.status !== TripStatus.ACTIVO) {
      throw new AppError(
        `Cannot complete trip with status ${trip.status}. Only 'activo' trips can be completed.`,
        400
      );
    }

    const endDate = input?.endDate ? new Date(input.endDate) : new Date();
    
    // Calculate final O2 consumed
    const o2Consumed = this.calculateO2Consumed(trip);

    const updated = await Trip.findByIdAndUpdate(
      new mongoose.Types.ObjectId(tripId),
      {
        status: TripStatus.COMPLETADO,
        endDate,
        O2Consumed: o2Consumed,
        lastModified: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new AppError('Trip not found', 404);
    }

    return updated;
  }

  /**
   * Abort a trip (status: activo -> abortado)
   */
  async abort(userId: string, tripId: string, input?: EndTripInput): Promise<ITrip> {
    const trip = await this.findOne(userId, tripId);

    if (trip.status !== TripStatus.ACTIVO) {
      throw new AppError(
        `Cannot abort trip with status ${trip.status}. Only 'activo' trips can be aborted.`,
        400
      );
    }

    const endDate = input?.endDate ? new Date(input.endDate) : new Date();
    
    // Calculate final O2 consumed
    const o2Consumed = this.calculateO2Consumed(trip);

    const updated = await Trip.findByIdAndUpdate(
      new mongoose.Types.ObjectId(tripId),
      {
        status: TripStatus.ABORTADO,
        endDate,
        O2Consumed: o2Consumed,
        lastModified: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new AppError('Trip not found', 404);
    }

    return updated;
  }

  /**
   * Delete a trip
   */
  async delete(userId: string, tripId: string): Promise<void> {
    // Verify ownership
    await this.findOne(userId, tripId);

    const result = await Trip.findByIdAndDelete(new mongoose.Types.ObjectId(tripId));

    if (!result) {
      throw new AppError('Trip not found', 404);
    }
  }

  /**
   * Calculate O2 consumed for a trip
   * Base rate 1 unit/hour + manual adjustments
   */
  calculateO2Consumed(trip: ITrip): number {
    if (!trip.startDate) {
      return 0;
    }

    const endDate = trip.endDate || new Date();
    const durationHours = (endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60);
    
    // Base consumption: baseRate * duration in hours
    const baseConsumption = trip.O2Config.baseRate * durationHours;

    // Sum manual adjustments
    const manualAdjustments = trip.O2Config.manualAdjustments.reduce(
      (sum: number, adj: IO2Adjustment) => sum + adj.amount,
      0
    );

    return baseConsumption + manualAdjustments;
  }

  /**
   * Calculate O2 for a trip by ID
   */
  async calculateO2(tripId: string): Promise<number> {
    const trip = await Trip.findById(new mongoose.Types.ObjectId(tripId));
    
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    return this.calculateO2Consumed(trip);
  }

  /**
   * Add manual O2 adjustment to a trip
   */
  async addManualO2(
    userId: string,
    tripId: string,
    input: AddO2AdjustmentInput
  ): Promise<ITrip> {
    const trip = await this.findOne(userId, tripId);

    if (trip.status !== TripStatus.ACTIVO) {
      throw new AppError(
        `Cannot add O2 adjustment to trip with status ${trip.status}. Only 'activo' trips can have O2 adjustments.`,
        400
      );
    }

    // Add new adjustment
    const adjustment: IO2Adjustment = {
      amount: input.amount,
      note: input.note ?? '',
      timestamp: new Date()
    };

    const updated = await Trip.findByIdAndUpdate(
      new mongoose.Types.ObjectId(tripId),
      {
        $push: { 'O2Config.manualAdjustments': adjustment },
        lastModified: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new AppError('Trip not found', 404);
    }

    return updated;
  }
}

export const tripService = new TripService();