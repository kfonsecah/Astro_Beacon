import mongoose, { Schema, Document } from 'mongoose';

// Enums matching frontend
export enum ResourceCategory {
  OXIGENO = 'oxigeno',
  AGUA = 'agua',
  COMIDA = 'comida',
  MEDICO = 'medico',
  EQUIPO = 'equipo',
  OTRO = 'otro',
}

export enum MovementType {
  INGRESO = 'ingreso',
  EGRESO = 'egreso',
}

// Default thresholds by category
const DEFAULT_THRESHOLDS: Record<ResourceCategory, number> = {
  [ResourceCategory.OXIGENO]: 20,
  [ResourceCategory.AGUA]: 15,
  [ResourceCategory.COMIDA]: 10,
  [ResourceCategory.MEDICO]: 0,
  [ResourceCategory.EQUIPO]: 0,
  [ResourceCategory.OTRO]: 0,
};

// Embedded ResourceMovement schema
export interface IResourceMovement {
  type: MovementType;
  amount: number;
  notes?: string;
  timestamp: Date;
  previousAmount: number;
  newAmount: number;
}

// Main Resource interface
export interface IResource extends Document {
  name: string;
  category: ResourceCategory;
  currentAmount: number;
  unit: string;
  threshold: number;
  movements: IResourceMovement[];
  userId: mongoose.Types.ObjectId;
  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ResourceMovement subdocument schema
const ResourceMovementSchema = new Schema<IResourceMovement>(
  {
    type: {
      type: String,
      enum: MovementType,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    previousAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    newAmount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

// Main Resource schema
const ResourceSchema = new Schema<IResource>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ResourceCategory,
      required: true,
    },
    currentAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      default: 'unidades',
    },
    threshold: {
      type: Number,
      default: function (this: IResource) {
        return DEFAULT_THRESHOLDS[this.category as ResourceCategory] || 0;
      },
      min: 0,
    },
    movements: {
      type: [ResourceMovementSchema],
      default: [],
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
ResourceSchema.index({ userId: 1, category: 1 });
ResourceSchema.index({ userId: 1, name: 1 });

export const Resource = mongoose.model<IResource>('Resource', ResourceSchema);
