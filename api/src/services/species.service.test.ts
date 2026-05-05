import { speciesService } from './species.service.js';
import { SpeciesClassification, DangerLevel } from '../models/species.model.js';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SpeciesService.identify', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv, GOOGLE_AI_API_KEY: 'test-api-key' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should identify "Flowering plant" as planta', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        responses: [
          {
            labelAnnotations: [
              { description: 'Flowering plant', score: 0.95 }
            ]
          }
        ]
      }
    });

    const result = await speciesService.identify('base64image');

    expect(result.classification).toBe(SpeciesClassification.PLANTA);
    expect(result.dangerLevel).toBe(DangerLevel.AMIGABLE);
    expect(result.name).toBe('Flowering plant');
    expect(result.confidence).toBe(0.95);
  });

  it('should identify animal with predator keyword as animal and peligroso', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        responses: [
          {
            labelAnnotations: [
              { description: 'Wild animal', score: 0.9 },
              { description: 'Carnivore predator', score: 0.85 }
            ]
          }
        ]
      }
    });

    const result = await speciesService.identify('base64image');

    expect(result.classification).toBe(SpeciesClassification.ANIMAL);
    expect(result.dangerLevel).toBe(DangerLevel.PELIGROSO);
    expect(result.name).toBe('Wild animal');
    expect(result.confidence).toBe(0.9);
  });

  it('should identify mineral as recurso and cauteloso (default)', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        responses: [
          {
            labelAnnotations: [
              { description: 'Shiny rock', score: 0.88 }
            ]
          }
        ]
      }
    });

    const result = await speciesService.identify('base64image');

    expect(result.classification).toBe(SpeciesClassification.RECURSO);
    expect(result.dangerLevel).toBe(DangerLevel.CAUTELOSO);
    expect(result.name).toBe('Shiny rock');
    expect(result.confidence).toBe(0.88);
  });

  it('should return fallback when API Key is missing', async () => {
    delete process.env.GOOGLE_AI_API_KEY;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const result = await speciesService.identify('base64image');

    expect(result.classification).toBe(SpeciesClassification.DESCONOCIDO);
    expect(result.dangerLevel).toBe(DangerLevel.CAUTELOSO);
    expect(result.confidence).toBe(0);
    expect(consoleSpy).toHaveBeenCalledWith('[Vision API] Missing API Key, returning fallback');

    consoleSpy.mockRestore();
  });

  it('should return fallback on axios network error', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const result = await speciesService.identify('base64image');

    expect(result.classification).toBe(SpeciesClassification.DESCONOCIDO);
    expect(result.dangerLevel).toBe(DangerLevel.CAUTELOSO);
    expect(result.confidence).toBe(0);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Vision API] Failed to identify image'), expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should return fallback if no labels are returned', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        responses: [
          {
            labelAnnotations: []
          }
        ]
      }
    });
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const result = await speciesService.identify('base64image');

    expect(result.classification).toBe(SpeciesClassification.DESCONOCIDO);
    expect(result.dangerLevel).toBe(DangerLevel.CAUTELOSO);
    expect(result.confidence).toBe(0);
    expect(consoleSpy).toHaveBeenCalledWith('[Vision API] No labels found, returning fallback');

    consoleSpy.mockRestore();
  });
});
