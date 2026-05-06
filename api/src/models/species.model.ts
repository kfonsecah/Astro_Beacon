import mongoose, { Schema, Document } from 'mongoose';

// Enums matching frontend
export enum SpeciesClassification {
  ANIMAL = 'animal',
  PLANTA = 'planta',
  RECURSO = 'recurso',
  MICROORGANISMO = 'microorganismo',
  DESCONOCIDO = 'desconocido',
  OTRO = 'otro',
}

export enum DangerLevel {
  AMIGABLE = 'amigable',
  CAUTELOSO = 'cauteloso',
  PELIGROSO = 'peligroso',
  LETAL = 'letal',
  DESCONOCIDO = 'desconocido',
}

// Species interface
export interface ISpecies extends Document {
  name: string;
  classification: SpeciesClassification;
  dangerLevel: DangerLevel;
  description?: string;
  imageUrl?: string;
  notes?: string;
  iaConfidence?: number;
  classifiedByAI?: boolean;
  userId: mongoose.Types.ObjectId;
  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Species schema
const SpeciesSchema = new Schema<ISpecies>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    classification: {
      type: String,
      enum: SpeciesClassification,
      required: true,
    },
    dangerLevel: {
      type: String,
      enum: DangerLevel,
      default: DangerLevel.AMIGABLE,
    },
    description: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    iaConfidence: {
      type: Number,
      default: 0,
    },
    classifiedByAI: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lastModified: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SpeciesSchema.index({ userId: 1, classification: 1 });
SpeciesSchema.index({ userId: 1, name: 1 });
SpeciesSchema.index({ userId: 1, dangerLevel: 1 });

export const Species = mongoose.model<ISpecies>('Species', SpeciesSchema);
