import mongoose, { Schema, Document } from 'mongoose';

// GeoPoint interface matching frontend
export interface GeoPoint {
  lat: number;
  lng: number;
}

// LogbookEntry interface
export interface ILogbookEntry extends Document {
  title: string;
  description?: string;
  photoUrl?: string;
  location?: GeoPoint;
  speciesId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
}

// GeoPoint subdocument schema
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

// LogbookEntry schema
const LogbookEntrySchema = new Schema<ILogbookEntry>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    photoUrl: {
      type: String,
      default: '',
    },
    location: {
      type: GeoPointSchema,
    },
    speciesId: {
      type: Schema.Types.ObjectId,
      ref: 'Species',
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
LogbookEntrySchema.index({ userId: 1, createdAt: -1 });
LogbookEntrySchema.index({ userId: 1, speciesId: 1 });

export const LogbookEntry = mongoose.model<ILogbookEntry>('LogbookEntry', LogbookEntrySchema);
