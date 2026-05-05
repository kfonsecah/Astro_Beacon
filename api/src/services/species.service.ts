import mongoose from 'mongoose';
import { Species, ISpecies, SpeciesClassification, DangerLevel } from '../models/species.model.js';
import { AppError } from '../middlewares/error.middleware.js';
import { calculatePagination } from '../utils/pagination.js';
import type {
  CreateSpeciesInput,
  UpdateSpeciesInput
} from '../schemas/species.schema.js';

export class SpeciesService {
  /**
   * Create a new species
   */
  async create(userId: string, input: CreateSpeciesInput): Promise<ISpecies> {
    const species = await Species.create({
      ...input,
      userId: new mongoose.Types.ObjectId(userId),
      dangerLevel: input.dangerLevel ?? DangerLevel.AMIGABLE
    });

    return species;
  }

  /**
   * Find all species for a user with optional filters and pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    classification?: SpeciesClassification,
    dangerLevel?: DangerLevel
  ) {

    const skip = (page - 1) * limit;

    // Build filter - species are global, no userId filter
    const filter: Record<string, any> = {};
    if (classification) {
      filter.classification = classification;
    }
    if (dangerLevel) {
      filter.dangerLevel = dangerLevel;
    }

    const [species, total] = await Promise.all([
      Species.find(filter)
        .sort({ lastModified: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Species.countDocuments(filter)
    ]);

    const pagination = calculatePagination(page, limit, total);

    return {
      species,
      pagination
    };
  }

  /**
   * Find a single species by ID
   */
  async findOne(speciesId: string): Promise<ISpecies> {
    const species = await Species.findOne({
      _id: new mongoose.Types.ObjectId(speciesId),
    });

    if (!species) {
      throw new AppError('Species not found', 404);
    }

    return species;
  }

  /**
   * Update a species.
   * Species are globally shared — any authenticated user may update any species.
   * userId is accepted for API consistency but is not used for ownership filtering.
   */
  async update(
    userId: string,
    speciesId: string,
    input: UpdateSpeciesInput
  ): Promise<ISpecies> {
    // findOne throws AppError('Species not found', 404) if not found
    await this.findOne(speciesId);

    const species = await Species.findByIdAndUpdate(
      new mongoose.Types.ObjectId(speciesId),
      {
        ...input,
        lastModified: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!species) {
      throw new AppError('Species not found', 404);
    }

    return species;
  }

  /**
   * Delete a species.
   * Species are globally shared — any authenticated user may delete any species.
   * userId is accepted for API consistency but is not used for ownership filtering.
   */
  async delete(userId: string, speciesId: string): Promise<void> {
    // findOne throws AppError('Species not found', 404) if not found
    await this.findOne(speciesId);

    await Species.findByIdAndDelete(new mongoose.Types.ObjectId(speciesId));
  }

  /**
   * Get species by classification
   */
  async getByClassification(
    classification: SpeciesClassification
  ) {
    return this.findAll(1, 100, classification);
  }
}

export const speciesService = new SpeciesService();
