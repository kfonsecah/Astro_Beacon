import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

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
    if (!mongoose.Types.ObjectId.isValid(speciesId)) {
      throw new AppError('Invalid ID format', 400);
    }

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
   * Identify a species using Gemini (Google AI Studio)
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
      if (!this.genAI) {
        console.warn('[Gemini AI] Missing API Key, returning fallback');
        return fallback;
      }

      // Detect MIME type and clean prefix
      const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

      const prompt = `
        Analiza esta imagen y clasifícala para una bitácora de supervivencia espacial.
        Debes responder ESTRICTAMENTE en formato JSON con la siguiente estructura:
        {
          "classification": "animal" | "planta" | "recurso" | "microorganismo",
          "dangerLevel": "amigable" | "cauteloso" | "peligroso" | "letal",
          "name": "Nombre científico o descriptivo",
          "description": "Reporte detallado sobre la morfología, hábitat probable y comportamiento observado del espécimen",
          "confidence": número entre 0 y 1
        }
        
        Reglas:
        1. Si no estás seguro, usa "classification": "desconocido" y "dangerLevel": "cauteloso".
        2. La "description" NO debe ser genérica. Debe sonar como una entrada de enciclopedia galáctica.
        3. El lenguaje debe ser profesional y técnico.
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: cleanBase64,
            mimeType
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response (handling potential markdown blocks or extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se pudo encontrar un bloque JSON en la respuesta de Gemini');
      }

      let aiResult;
      try {
        aiResult = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('[Gemini AI] JSON Parse Error:', parseError, 'Text:', text);
        throw new Error('La respuesta de Gemini no es un JSON válido');
      }

      // Normalize and validate enums
      const classification = Object.values(SpeciesClassification).includes(aiResult.classification?.toLowerCase() as SpeciesClassification)
        ? (aiResult.classification.toLowerCase() as SpeciesClassification)
        : SpeciesClassification.DESCONOCIDO;

      const dangerLevel = Object.values(DangerLevel).includes(aiResult.dangerLevel?.toLowerCase() as DangerLevel)
        ? (aiResult.dangerLevel.toLowerCase() as DangerLevel)
        : DangerLevel.CAUTELOSO;

      return {
        classification,
        dangerLevel,
        name: aiResult.name || 'Especie No Identificada',
        description: aiResult.description || 'No se pudo generar una descripción.',
        confidence: typeof aiResult.confidence === 'number' ? aiResult.confidence : 0.5,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[Gemini AI] Full Error:', error);
      console.warn('[Gemini AI] Failed to identify image, using fallback:', errorMessage);
      return fallback;
    }
  }
}

export const speciesService = new SpeciesService();
