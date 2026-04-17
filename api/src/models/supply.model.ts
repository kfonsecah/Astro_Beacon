import mongoose, { Schema, Document } from 'mongoose';

// Enums matching frontend
export enum SupplyDropStatus {
  PENDIENTE = 'pendiente',
  ENTREGADO = 'entregado',
  RECOGIDO = 'recogido',
  EXPIRADO = 'expirado',
}

// GeoPoint interface matching frontend
export interface GeoPoint {
  lat: number;
  lng: number;
}

// Supply interface
export interface ISupply extends Document {
  name: string;
  description?: string;
  status: SupplyDropStatus;
  location: GeoPoint;
  contents: string[];
  deliveredAt?: Date;
  collectedAt?: Date;
  expiresAt?: Date;
  userId: mongoose.Types.ObjectId;
  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
}

// GeoPoint subdocument schema with 2dsphere index
const GeoPointSchema = new Schema<GeoPoint>(
  {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

// Supply schema
const SupplySchema = new Schema<ISupply>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: SupplyDropStatus,
      default: SupplyDropStatus.PENDIENTE,
    },
    location: {
      type: GeoPointSchema,
      required: true,
    },
    contents: {
      type: [String],
      default: [],
    },
    deliveredAt: {
      type: Date,
    },
    collectedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
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

// 2dsphere index for geospatial queries (SUPP-03)
SupplySchema.index({ location: '2dsphere' });

// Additional indexes
SupplySchema.index({ userId: 1, status: 1 });
SupplySchema.index({ userId: 1, expiresAt: 1 });

export const Supply = mongoose.model<ISupply>('Supply', SupplySchema);
