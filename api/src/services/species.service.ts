import mongoose from 'mongoose';
import axios from 'axios';
import { Species, ISpecies, SpeciesClassification, DangerLevel } from '../models/species.model.js';
import { AppError } from '../middlewares/error.middleware.js';
import { calculatePagination } from '../utils/pagination.js';
import type {
  CreateSpeciesInput,
  UpdateSpeciesInput
} from '../schemas/species.schema.js';

export interface IdentifyResult {
  classification: SpeciesClassification;
  dangerLevel: DangerLevel;
  name: string;
  description: string;
  confidence: number;
}

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

  /**
   * Identify a species using Google Cloud Vision API
   */
  async identify(imageBase64: string): Promise<IdentifyResult> {
    const fallback: IdentifyResult = {
      classification: SpeciesClassification.DESCONOCIDO,
      dangerLevel: DangerLevel.CAUTELOSO,
      name: 'Especie Desconocida',
      description: 'La identificación automática no está disponible en este momento.',
      confidence: 0,
    };

    try {
      const apiKey = process.env.GOOGLE_VISION_API_KEY;
      if (!apiKey) {
        console.warn('[Vision API] Missing API Key, returning fallback');
        return fallback;
      }

      // Clean prefix if it exists
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          requests: [
            {
              image: { content: cleanBase64 },
              features: [{ type: 'LABEL_DETECTION', maxResults: 10 }],
            },
          ],
        },
        { timeout: 5000 }
      );

      const labels = response.data.responses[0]?.labelAnnotations || [];
      if (labels.length === 0) {
        console.warn('[Vision API] No labels found, returning fallback');
        return fallback;
      }

      // Basic mapping placeholder for plan 1, will be refined in plan 2
      // At this stage, just returning unknown with the first label name and confidence
      let classification = SpeciesClassification.DESCONOCIDO;
      let dangerLevel = DangerLevel.CAUTELOSO;

      // Pass 1: Classification
      for (const label of labels) {
        const desc = label.description.toLowerCase();
        if (desc.includes('plant') || desc.includes('tree')) {
          classification = SpeciesClassification.PLANTA;
          break;
        }
        if (desc.includes('animal') || desc.includes('mammal') || desc.includes('bird')) {
          classification = SpeciesClassification.ANIMAL;
          break;
        }
        if (desc.includes('mineral') || desc.includes('rock') || desc.includes('water')) {
          classification = SpeciesClassification.RECURSO;
          break;
        }
      }

      // Pass 2: Danger Level
      // Start with amigable for plants if not matched, but let's default to cauteloso initially
      // Actually, plan says: "Los tests esperan que 'Flowering plant' retorne amigable".
      if (classification === SpeciesClassification.PLANTA) {
        dangerLevel = DangerLevel.AMIGABLE;
      }

      for (const label of labels) {
        const desc = label.description.toLowerCase();
        if (desc.includes('predator') || desc.includes('carnivore') || desc.includes('danger')) {
          dangerLevel = DangerLevel.PELIGROSO;
          break;
        }
      }

      return {
        classification,
        dangerLevel,
        name: labels[0].description,
        description: `Label detectado: ${labels[0].description}`,
        confidence: labels[0].score || 0,
      };

    } catch (error) {
      console.warn('[Vision API] Failed to identify image, using fallback', error);
      return fallback;
    }
  }
}

export const speciesService = new SpeciesService();
