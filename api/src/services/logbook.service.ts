import mongoose from 'mongoose';
import { LogbookEntry, ILogbookEntry } from '../models/logbook.model.js';
import { AppError } from '../utils/AppError.js';
import { calculatePagination } from '../utils/pagination.js';
import type {
  CreateLogbookInput,
  UpdateLogbookInput
} from '../schemas/logbook.schema.js';

export class LogbookService {
  /**
   * Create a new logbook entry
   */
  async create(
    userId: string,
    input: CreateLogbookInput,
    speciesId?: string
  ): Promise<ILogbookEntry> {
    const data: any = {
      ...input,
      userId: new mongoose.Types.ObjectId(userId)
    };

    // Link species if provided
    if (speciesId || input.speciesId) {
      data.speciesId = new mongoose.Types.ObjectId(speciesId || input.speciesId);
    }

    const entry = await LogbookEntry.create(data);

    return entry;
  }

  /**
   * Find all logbook entries for a user with optional species filter
   */
  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
    speciesId?: string
  ) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, any> = { userId: userObjectId };
    if (speciesId) {
      filter.speciesId = new mongoose.Types.ObjectId(speciesId);
    }

    const [entries, total] = await Promise.all([
      LogbookEntry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('speciesId', 'name classification dangerLevel')
        .lean(),
      LogbookEntry.countDocuments(filter)
    ]);

    const pagination = calculatePagination(page, limit, total);

    return {
      entries,
      pagination
    };
  }

  /**
   * Find a single logbook entry by ID
   */
  async findOne(userId: string, entryId: string): Promise<ILogbookEntry> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const entry = await LogbookEntry.findOne({
      _id: new mongoose.Types.ObjectId(entryId),
      userId: userObjectId
    });

    if (!entry) {
      throw new AppError('Logbook entry not found', 404);
    }

    return entry;
  }

  /**
   * Update a logbook entry
   */
  async update(
    userId: string,
    entryId: string,
    input: UpdateLogbookInput
  ): Promise<ILogbookEntry> {
    // Verify ownership
    await this.findOne(userId, entryId);

    const updateData: any = {
      ...input,
      lastModified: new Date()
    };

    // Handle speciesId update
    if (input.speciesId !== undefined) {
      if (input.speciesId) {
        updateData.speciesId = new mongoose.Types.ObjectId(input.speciesId);
      } else {
        updateData.speciesId = undefined;
      }
    }

    const entry = await LogbookEntry.findByIdAndUpdate(
      new mongoose.Types.ObjectId(entryId),
      updateData,
      { new: true, runValidators: true }
    );

    if (!entry) {
      throw new AppError('Logbook entry not found', 404);
    }

    return entry;
  }

  /**
   * Delete a logbook entry
   */
  async delete(userId: string, entryId: string): Promise<void> {
    // Verify ownership
    await this.findOne(userId, entryId);

    await LogbookEntry.findByIdAndDelete(new mongoose.Types.ObjectId(entryId));
  }
}

export const logbookService = new LogbookService();
