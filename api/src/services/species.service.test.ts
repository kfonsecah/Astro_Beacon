import { speciesService } from './species.service.js';
import axios from 'axios';

jest.mock('axios');

describe('SpeciesService', () => {
  it('should be defined', () => {
    expect(speciesService).toBeDefined();
  });
});
