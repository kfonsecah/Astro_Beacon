import mongoose, { Schema, Document } from 'mongoose';

export interface IGpsPoint {
  lat: number;
  lng: number;
  timestamp: Date;
}

export interface IReward {
  oxigeno: number;
  agua: number;
  comida: number;
  equipo: number;
}

export interface IWalkChallenge extends Document {
  userId: mongoose.Types.ObjectId;
  distance: number;
  name: string;
  reward: IReward;
  status: 'available' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  gpsPoints: IGpsPoint[];
}

const gpsPointSchema = new Schema<IGpsPoint>({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  timestamp: { type: Date, required: true },
}, { _id: false });

const walkChallengeSchema = new Schema<IWalkChallenge>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  distance: { type: Number, required: true },
  name: { type: String, required: true },
  reward: {
    oxigeno: { type: Number, default: 0 },
    agua: { type: Number, default: 0 },
    comida: { type: Number, default: 0 },
    equipo: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ['available', 'in_progress', 'completed'],
    default: 'available',
  },
  startedAt: Date,
  completedAt: Date,
  gpsPoints: [gpsPointSchema],
}, { timestamps: true });

export const WalkChallenge = mongoose.model<IWalkChallenge>('WalkChallenge', walkChallengeSchema);
