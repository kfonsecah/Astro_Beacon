import mongoose from 'mongoose';
import { Resource, IResource, ResourceCategory, MovementType } from '../models/resource.model.js';
import { AppError } from '../utils/AppError.js';
import { calculatePagination } from '../utils/pagination.js';
import type {
  CreateResourceInput,
  UpdateResourceInput,
  CreateMovementInput
} from '../schemas/resource.schema.js';

export interface ResourceAlert {
  resourceId: string;
  name: string;
  category: ResourceCategory;
  currentAmount: number;
  threshold: number;
  percentage: number;
}

export class ResourceService {
  /**
   * Create a new resource
   */
  async create(userId: string, input: CreateResourceInput): Promise<IResource> {
    const resource = await Resource.create({
      ...input,
      userId: new mongoose.Types.ObjectId(userId),
      currentAmount: input.currentAmount ?? 0,
      unit: input.unit ?? 'unidades',
      movements: []
    });

    return resource;
  }

  /**
   * Find all resources for a user with pagination
   */
  async findAll(userId: string, page: number = 1, limit: number = 20) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      Resource.find({ userId: userObjectId })
        .sort({ lastModified: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Resource.countDocuments({ userId: userObjectId })
    ]);

    const pagination = calculatePagination(page, limit, total);

    return {
      resources,
      pagination
    };
  }

  /**
   * Find a single resource by ID
   */
  async findOne(userId: string, resourceId: string): Promise<IResource> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const resource = await Resource.findOne({
      _id: new mongoose.Types.ObjectId(resourceId),
      userId: userObjectId
    });

    if (!resource) {
      throw new AppError('Resource not found', 404);
    }

    return resource;
  }

  /**
   * Update a resource
   */
  async update(
    userId: string,
    resourceId: string,
    input: UpdateResourceInput
  ): Promise<IResource> {
    // Verify ownership
    await this.findOne(userId, resourceId);

    const resource = await Resource.findByIdAndUpdate(
      new mongoose.Types.ObjectId(resourceId),
      {
        ...input,
        lastModified: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!resource) {
      throw new AppError('Resource not found', 404);
    }

    return resource;
  }

  /**
   * Delete a resource
   */
  async delete(userId: string, resourceId: string): Promise<void> {
    // Verify ownership
    await this.findOne(userId, resourceId);

    await Resource.findByIdAndDelete(new mongoose.Types.ObjectId(resourceId));
  }

  /**
   * Record a movement (ingreso/egreso) on a resource
   */
  async recordMovement(
    userId: string,
    resourceId: string,
    input: CreateMovementInput
  ): Promise<IResource> {
    // Verify ownership
    const resource = await this.findOne(userId, resourceId);

    const previousAmount = resource.currentAmount;
    let newAmount: number;

    if (input.type === MovementType.INGRESO) {
      newAmount = previousAmount + input.amount;
    } else {
      newAmount = previousAmount - input.amount;
    }

    // Validate non-negative amount
    if (newAmount < 0) {
      throw new AppError(
        `Cannot record ${input.type} of ${input.amount}. Current amount is ${previousAmount}`,
        400
      );
    }

    // Create movement record
    const movement = {
      type: input.type,
      amount: input.amount,
      notes: input.notes ?? '',
      timestamp: new Date(),
      previousAmount,
      newAmount
    };

    // Update resource
    resource.movements.push(movement as any);
    resource.currentAmount = newAmount;
    resource.lastModified = new Date();

    await resource.save();

    return resource;
  }

  /**
   * Get all resources below their threshold (alerts)
   */
  async getAlerts(userId: string): Promise<ResourceAlert[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find all resources with a threshold set and below it
    const resources = await Resource.find({
      userId: userObjectId,
      threshold: { $gt: 0 } // Only resources with threshold > 0
    }).lean();

    // Filter to those below threshold
    const alerts: ResourceAlert[] = resources
      .filter(r => r.currentAmount < r.threshold)
      .map(r => ({
        resourceId: r._id.toString(),
        name: r.name,
        category: r.category as ResourceCategory,
        currentAmount: r.currentAmount,
        threshold: r.threshold,
        percentage: r.threshold > 0 ? (r.currentAmount / r.threshold) * 100 : 0
      }));

    return alerts;
  }
}

export const resourceService = new ResourceService();
