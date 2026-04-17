import mongoose, { Schema, Document } from 'mongoose';

// Enums matching frontend
export enum TripStatus {
  PLANIFICADO = 'planificado',
  ACTIVO = 'activo',
  COMPLETADO = 'completado',
  ABORTADO = 'abortado',
}

// O2 manual adjustment interface
export interface IO2Adjustment {
  amount: number;
  note: string;
  timestamp: Date;
}

// O2 configuration interface
export interface IO2Config {
  baseRate: number;
  manualAdjustments: IO2Adjustment[];
}

// Trip interface
export interface ITrip extends Document {
  name?: string;
  destination?: string;
  status: TripStatus;
  startDate?: Date;
  endDate?: Date;
  plannedDuration?: number;
  O2Config: IO2Config;
  O2Consumed: number;
  userId: mongoose.Types.ObjectId;
  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
}

// O2Adjustment subdocument schema
const O2AdjustmentSchema = new Schema<IO2Adjustment>(
  {
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    note: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// O2Config subdocument schema
const O2ConfigSchema = new Schema<IO2Config>(
  {
    baseRate: {
      type: Number,
      default: 1,
      min: 0,
    },
    manualAdjustments: {
      type: [O2AdjustmentSchema],
      default: [],
    },
  },
  { _id: false }
);

// Trip schema
const TripSchema = new Schema<ITrip>(
  {
    name: {
      type: String,
      trim: true,
    },
    destination: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: TripStatus,
      default: TripStatus.PLANIFICADO,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    plannedDuration: {
      type: Number,
    },
    O2Config: {
      type: O2ConfigSchema,
      default: () => ({ baseRate: 1, manualAdjustments: [] }),
    },
    O2Consumed: {
      type: Number,
      default: 0,
      min: 0,
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
TripSchema.index({ userId: 1, status: 1 });
TripSchema.index({ userId: 1, startDate: -1 });

export const Trip = mongoose.model<ITrip>('Trip', TripSchema);
