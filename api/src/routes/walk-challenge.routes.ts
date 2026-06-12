import { Router } from 'express';
import {
  getChallenges,
  startWalk,
  updateGps,
  completeWalk,
} from '../controllers/walk-challenge.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getChallenges);
router.post('/:id/start', startWalk);
router.patch('/:id/gps', updateGps);
router.post('/:id/complete', completeWalk);

export default router;
