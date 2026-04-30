import mongoose from 'mongoose';
import { Supply, ISupply, SupplyDropStatus, GeoPoint } from '../models/supply.model.js';
import { AppError } from '../middlewares/error.middleware.js';
import { calculatePagination } from '../utils/pagination.js';
import type {
  CreateSupplyInput,
  UpdateSupplyInput,
  CollectSupplyInput,
  NearbyQueryInput
} from '../schemas/supply.schema.js';

export class SupplyService {
  /**
   * Create a new supply
   */
  async create(userId: string, input: CreateSupplyInput) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const supply = await Supply.create({
      ...input,
      userId: userObjectId,
      status: SupplyDropStatus.PENDIENTE
    });

    return supply;
  }

  /**
   * Find all supplies for a user with pagination and optional status filter
   */
  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: SupplyDropStatus
  ) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, any> = { userId: userObjectId };
    if (status) {
      filter.status = status;
    }

    const [supplies, total] = await Promise.all([
      Supply.find(filter)
        .sort({ lastModified: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Supply.countDocuments(filter)
    ]);

    const pagination = calculatePagination(page, limit, total);

    return {
      supplies,
      pagination
    };
  }

  /**
   * Find a single supply by ID
  SupplyDropStatus
   */
  async findOne(userId: string, supplyId: string): Promise<ISupply> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const supply = await Supply.findOne({
      _id: new mongoose.Types.ObjectId(supplyId),
      userId: userObjectId
    });

    if (!supply) {
      throw new AppError('Supply not found', 404);
    }

    return supply;
  }

  /**
   * Collect a supply (status: pendiente -> recogido)
   */
  async collect(userId: string, supplyId: string, input?: CollectSupplyInput): Promise<ISupply> {
    const supply = await this.findOne(userId, supplyId);

    if (supply.status !== SupplyDropStatus.PENDIENTE && 
        supply.status !== SupplyDropStatus.ENTREGADO) {
      throw new AppError(
        `Cannot collect supply with status ${supply.status}. Only 'pendiente' or 'entregado' supplies can be collected.`,
        400
      );
    }

    const collectedAt = input?.collectedAt 
      ? new Date(input.collectedAt) 
      : new Date();

    const updated = await Supply.findByIdAndUpdate(
      new mongoose.Types.ObjectId(supplyId),
      {
        status: SupplyDropStatus.RECOGIDO,
        collectedAt,
        lastModified: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new AppError('Supply not found', 404);
    }

    return updated;
  }

  /**
   * Update a supply (partial update)
   */
  async update(
    userId: string,
    supplyId: string,
    input: UpdateSupplyInput
  ): Promise<ISupply> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const existing = await Supply.findOne({
      _id: new mongoose.Types.ObjectId(supplyId),
      userId: userObjectId
    });

    if (!existing) {
      throw new AppError('Supply not found', 404);
    }

    const updated = await Supply.findByIdAndUpdate(
      new mongoose.Types.ObjectId(supplyId),
      {
        ...input,
        lastModified: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new AppError('Supply not found', 404);
    }

    return updated;
  }

  /**
   * Delete a supply
   */
  async delete(userId: string, supplyId: string): Promise<void> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const existing = await Supply.findOne({
      _id: new mongoose.Types.ObjectId(supplyId),
      userId: userObjectId
    });

    if (!existing) {
      throw new AppError('Supply not found', 404);
    }

    await Supply.findByIdAndDelete(new mongoose.Types.ObjectId(supplyId));
  }

  /**
   * Expire a supply (status: pendiente -> expirado)
   */
  async expire(supplyId: string): Promise<ISupply> {
    const supply = await Supply.findById(new mongoose.Types.ObjectId(supplyId));

    if (!supply) {
      throw new AppError('Supply not found', 404);
    }

    if (supply.status !== SupplyDropStatus.PENDIENTE) {
      throw new AppError(
        `Cannot expire supply with status ${supply.status}. Only 'pendiente' supplies can be expired.`,
        400
      );
    }

    const updated = await Supply.findByIdAndUpdate(
      new mongoose.Types.ObjectId(supplyId),
      {
        status: SupplyDropStatus.EXPIRADO,
        lastModified: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new AppError('Supply not found', 404);
    }

    return updated;
  }

  /**
   * Find nearby supplies using geospatial query
   */
  async findNearby(
    userId: string,
    lat: number,
    lng: number,
    radius: number = 1000,
    status?: SupplyDropStatus
  ) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Build filter with geospatial query
    const filter: Record<string, unknown> = {
      userId: userObjectId,
      location: {
        $geoWithin: {
          $centerSphere: [
            [lng, lat], // GeoJSON uses [lng, lat] order
            radius / 6378100 // Convert meters to radians (Earth radius in meters ≈ 6378100)
          ]
        }
      }
    };

    if (status) {
      filter.status = status;
    }

    const supplies = await Supply.find(filter).lean();

    return supplies;
  }
}

export const supplyService = new SupplyService();