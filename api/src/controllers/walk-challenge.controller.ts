import { Request, Response, NextFunction } from 'express';
import { walkChallengeService } from '../services/walk-challenge.service.js';
import { updateGpsPointsSchema } from '../schemas/walk-challenge.schema.js';

export async function getChallenges(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const challenges = await walkChallengeService.findAll(userId);
    res.status(200).json({ success: true, data: challenges });
  } catch (error) {
    next(error);
  }
}

export async function startWalk(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const challenge = await walkChallengeService.startWalk(userId, req.params.id as string);
    res.status(200).json({ success: true, data: challenge });
  } catch (error) {
    next(error);
  }
}

export async function updateGps(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const body = updateGpsPointsSchema.parse(req.body);
    const challenge = await walkChallengeService.updateGps(userId, req.params.id as string, body.gpsPoints);
    res.status(200).json({ success: true, data: challenge });
  } catch (error) {
    next(error);
  }
}

export async function completeWalk(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const challenge = await walkChallengeService.completeWalk(userId, req.params.id as string);
    res.status(200).json({ success: true, data: challenge });
  } catch (error) {
    next(error);
  }
}
