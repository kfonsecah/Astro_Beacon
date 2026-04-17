import { Router } from 'express';
import {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  startTrip,
  completeTrip,
  abortTrip,
  getTripO2,
  addTripO2
} from '../controllers/trip.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/trips - List all trips (paginated, with status filter)
router.get('/', getTrips);

// GET /api/v1/trips/:id - Get single trip
router.get('/:id', getTrip);

// POST /api/v1/trips - Create trip
router.post('/', createTrip);

// PUT /api/v1/trips/:id - Update trip
router.put('/:id', updateTrip);

// DELETE /api/v1/trips/:id - Delete trip
router.delete('/:id', async (req, res, next) => {
  try {
    const { tripService } = await import('../services/trip.service.js');
    const userId = (req as any).user?.sub;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    await tripService.delete(userId, id);

    res.status(200).json({
      success: true,
      data: { message: 'Trip deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/trips/:id/start - Start trip
router.post('/:id/start', startTrip);

// POST /api/v1/trips/:id/complete - Complete trip
router.post('/:id/complete', completeTrip);

// POST /api/v1/trips/:id/abort - Abort trip
router.post('/:id/abort', abortTrip);

// GET /api/v1/trips/:id/o2 - Get calculated O2
router.get('/:id/o2', getTripO2);

// POST /api/v1/trips/:id/o2 - Add manual O2 adjustment
router.post('/:id/o2', addTripO2);

export default router;