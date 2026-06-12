import mongoose from 'mongoose';
import { WalkChallenge, IWalkChallenge } from '../models/walk-challenge.model.js';
import { Resource, MovementType } from '../models/resource.model.js';
import type { Reward, GpsPoint } from '../schemas/walk-challenge.schema.js';

const CHALLENGE_DEFS: { distance: number; reward: Reward }[] = [
  { distance: 1, reward: { oxigeno: 5, agua: 3, comida: 2, equipo: 1 } },
  { distance: 3, reward: { oxigeno: 15, agua: 9, comida: 6, equipo: 3 } },
  { distance: 5, reward: { oxigeno: 25, agua: 15, comida: 10, equipo: 5 } },
  { distance: 7, reward: { oxigeno: 35, agua: 21, comida: 14, equipo: 7 } },
  { distance: 10, reward: { oxigeno: 50, agua: 30, comida: 20, equipo: 10 } },
];

export class WalkChallengeService {
  async seedIfEmpty(userId: string): Promise<void> {
    const count = await WalkChallenge.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
    if (count > 0) return;

    const docs = CHALLENGE_DEFS.map(def => ({
      userId: new mongoose.Types.ObjectId(userId),
      distance: def.distance,
      name: `CAMINATA ${def.distance}KM`,
      reward: def.reward,
      status: 'available' as const,
      gpsPoints: [],
    }));

    await WalkChallenge.insertMany(docs);
  }

  async findAll(userId: string): Promise<IWalkChallenge[]> {
    await this.seedIfEmpty(userId);
    return WalkChallenge.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ distance: 1 })
      .lean() as unknown as IWalkChallenge[];
  }

  async startWalk(userId: string, challengeId: string): Promise<IWalkChallenge> {
    const challenge = await WalkChallenge.findOne({
      _id: new mongoose.Types.ObjectId(challengeId),
      userId: new mongoose.Types.ObjectId(userId),
      status: 'available',
    });

    if (!challenge) {
      throw new Error('Challenge not found or already started/completed');
    }

    challenge.status = 'in_progress';
    challenge.startedAt = new Date();
    await challenge.save();

    return challenge;
  }

  async updateGps(userId: string, challengeId: string, gpsPoints: GpsPoint[]): Promise<IWalkChallenge> {
    const challenge = await WalkChallenge.findOne({
      _id: new mongoose.Types.ObjectId(challengeId),
      userId: new mongoose.Types.ObjectId(userId),
      status: 'in_progress',
    });

    if (!challenge) {
      throw new Error('No active walk challenge found');
    }

    const formatted = gpsPoints.map(p => ({
      lat: p.lat,
      lng: p.lng,
      timestamp: new Date(p.timestamp),
    }));

    challenge.gpsPoints.push(...formatted);
    await challenge.save();

    return challenge;
  }

  async completeWalk(userId: string, challengeId: string): Promise<IWalkChallenge> {
    const challenge = await WalkChallenge.findOne({
      _id: new mongoose.Types.ObjectId(challengeId),
      userId: new mongoose.Types.ObjectId(userId),
      status: 'in_progress',
    });

    if (!challenge) {
      throw new Error('No active walk challenge found');
    }

    challenge.status = 'completed';
    challenge.completedAt = new Date();
    await challenge.save();

    // Credit resources to user
    await this.creditResources(userId, challenge.reward);

    return challenge;
  }

  private async creditResources(userId: string, reward: Reward): Promise<void> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const rewardEntries = [
      { category: 'oxigeno', amount: reward.oxigeno },
      { category: 'agua', amount: reward.agua },
      { category: 'comida', amount: reward.comida },
      { category: 'equipo', amount: reward.equipo },
    ];

    for (const entry of rewardEntries) {
      if (entry.amount <= 0) continue;
      const resource = await Resource.findOne({
        userId: userObjectId,
        category: entry.category,
      });

      if (resource) {
        const movement = {
          type: MovementType.INGRESO,
          amount: entry.amount,
          notes: 'Recompensa por caminata completada',
          timestamp: new Date(),
          previousAmount: resource.currentAmount,
          newAmount: resource.currentAmount + entry.amount,
        };
        resource.movements.push(movement as any);
        resource.currentAmount += entry.amount;
        resource.lastModified = new Date();
        await resource.save();
      }
    }
  }
}

export const walkChallengeService = new WalkChallengeService();
