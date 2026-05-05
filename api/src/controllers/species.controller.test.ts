import { identifySpecies } from './species.controller.js';
import { speciesService } from '../services/species.service.js';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

jest.mock('../services/species.service.js', () => ({
  speciesService: {
    identify: jest.fn(),
  },
}));

describe('SpeciesController.identifySpecies', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {},
      user: { sub: 'user123' },
    } as any;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(identifySpecies).toBeDefined();
  });

  it('should throw validation error if base64 > 533333 characters', async () => {
    const largeImage = 'a'.repeat(600000);
    req.body = { imageBase64: largeImage };

    await identifySpecies(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ZodError));
    const errorArgs = (next as jest.Mock).mock.calls[0][0];
    expect(errorArgs.issues[0].message).toBe('Image too large (max ~400KB)');
  });

  it('should call speciesService.identify with valid image', async () => {
    req.body = { imageBase64: 'valid_base64_string' };
    (speciesService.identify as jest.Mock).mockResolvedValueOnce({
      classification: 'desconocido',
      dangerLevel: 'cauteloso',
      confidence: 0,
    });

    await identifySpecies(req as Request, res as Response, next);

    expect(speciesService.identify).toHaveBeenCalledWith('valid_base64_string');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.any(Object),
    });
  });
});
