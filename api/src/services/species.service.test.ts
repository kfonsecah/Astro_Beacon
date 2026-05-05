import { speciesService } from './species.service.js';
import { SpeciesClassification, DangerLevel } from '../models/species.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai');

describe('SpeciesService.identify', () => {
  const originalEnv = process.env;
  let mockGenerateContent: jest.Mock;
  let mockGetGenerativeModel: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, GOOGLE_AI_API_KEY: 'test-api-key' };

    mockGenerateContent = jest.fn();
    mockGetGenerativeModel = jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    });

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    }));

    // Access private member via casting to any
    (speciesService as any).genAI = new GoogleGenerativeAI('test-api-key');
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should identify "Flowering plant" as planta', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify({
          classification: 'planta',
          dangerLevel: 'amigable',
          name: 'Flowering plant',
          description: 'A beautiful flower',
          confidence: 0.95
        })
      }
    });

    const result = await speciesService.identify('base64image');

    expect(result.classification).toBe(SpeciesClassification.PLANTA);
    expect(result.dangerLevel).toBe(DangerLevel.AMIGABLE);
    expect(result.name).toBe('Flowering plant');
    expect(result.confidence).toBe(0.95);
  });

  it('should identify animal with predator keyword as animal and peligroso', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify({
          classification: 'animal',
          dangerLevel: 'peligroso',
          name: 'Wild animal',
          description: 'A dangerous beast',
          confidence: 0.9
        })
      }
    });

    const result = await speciesService.identify('base64image');

    expect(result.classification).toBe(SpeciesClassification.ANIMAL);
    expect(result.dangerLevel).toBe(DangerLevel.PELIGROSO);
    expect(result.name).toBe('Wild animal');
    expect(result.confidence).toBe(0.9);
  });

  it('should return fallback when API Key is missing', async () => {
    (speciesService as any).genAI = null;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const result = await speciesService.identify('base64image');

    expect(result.classification).toBe(SpeciesClassification.DESCONOCIDO);
    expect(result.dangerLevel).toBe(DangerLevel.CAUTELOSO);
    expect(consoleSpy).toHaveBeenCalledWith('[Gemini AI] Missing API Key, returning fallback');

    consoleSpy.mockRestore();
  });

  it('should return fallback on Gemini error', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Gemini Error'));
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await speciesService.identify('base64image');

    expect(result.classification).toBe(SpeciesClassification.DESCONOCIDO);
    expect(result.dangerLevel).toBe(DangerLevel.CAUTELOSO);
    expect(result.confidence).toBe(0);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Gemini AI] Failed to identify image, using fallback:'), expect.any(String));

    consoleSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
