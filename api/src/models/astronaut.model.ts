import mongoose, { Schema, Document } from 'mongoose';

// Enums matching frontend
export enum AstronautStatus {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  EMERGENCIA = 'emergencia',
}

// Astronaut interface
export interface IAstronaut extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  status: AstronautStatus;
  birthDate?: Date;
  specializations: string[];
  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Astronaut schema
const AstronautSchema = new Schema<IAstronaut>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: AstronautStatus,
      default: AstronautStatus.ACTIVO,
    },
    birthDate: {
      type: Date,
    },
    specializations: {
      type: [String],
      default: [],
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

// Index
AstronautSchema.index({ userId: 1 });

export const Astronaut = mongoose.model<IAstronaut>('Astronaut', AstronautSchema);
