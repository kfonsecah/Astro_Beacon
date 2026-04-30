import axios, { AxiosError, AxiosInstance } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import MockAdapter from 'axios-mock-adapter';

// Mock modules
jest.mock('@/stores/auth.store');
jest.mock('@/services/auth.service');

describe('API Client - Refresh Token Interceptor', () => {
  let mock: MockAdapter;
  let api: AxiosInstance;
  let mockStore: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset modules to get fresh api instance
    jest.resetModules();
    
    // Mock auth store
    mockStore = {
      accessToken: 'old-access-token',
      refreshToken: 'refresh-token-123',
      user: { id: '1', nombre: 'Test', email: 'test@test.com', rol: 'user' },
      isAuthenticated: true,
      isLoading: false,
      setAuth: jest.fn(),
      clearAuth: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn(),
      setLoading: jest.fn(),
    };
    
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector?: any) => {
      if (selector) {
        return selector(mockStore);
      }
      return mockStore;
    });
    
    (useAuthStore.getState as jest.Mock) = jest.fn(() => mockStore);
  });

  afterEach(() => {
    if (mock) {
      mock.restore();
    }
  });

  describe('Test 1: 401 triggers single refresh call and retries original request', () => {
    it('should call refresh token and retry the original request on 401', async () => {
      // This test will fail initially because we need to implement the interceptor
      // Reset modules to import fresh api
      const { api: freshApi } = require('@/services/api');
      mock = new MockAdapter(freshApi);

      // Mock the refresh call to succeed
      (authService.refresh as jest.Mock).mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      // Mock the original request to return 401 first, then succeed
      let callCount = 0;
      mock.onAny('/test-endpoint').replyOnce(401).onAny('/test-endpoint').reply(200, { success: true });

      // Make the request
      const response = await freshApi.get('/test-endpoint');

      // Verify refresh was called
      expect(authService.refresh).toHaveBeenCalledWith('refresh-token-123');
      
      // Verify setAuth was called with new tokens
      expect(mockStore.setAuth).toHaveBeenCalledWith(
        'new-access-token',
        'new-refresh-token',
        mockStore.user
      );
      
      // Verify the request was retried and succeeded
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });

  describe('Test 2: Parallel 401s wait on refresh queue', () => {
    it('should queue parallel 401 requests and retry them after single refresh', async () => {
      const { api: freshApi } = require('@/services/api');
      mock = new MockAdapter(freshApi);

      // Mock refresh to succeed
      (authService.refresh as jest.Mock).mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      // Mock multiple endpoints that return 401
      mock.onGet('/endpoint1').reply(401);
      mock.onGet('/endpoint2').reply(401);
      mock.onGet('/endpoint3').reply(401);

      // Override to make them succeed after refresh
      let callCounts = { endpoint1: 0, endpoint2: 0, endpoint3: 0 };
      
      mock.onGet('/endpoint1').reply(() => {
        callCounts.endpoint1++;
        if (callCounts.endpoint1 === 1) return [401, {}];
        return [200, { data: 'success1' }];
      });
      
      mock.onGet('/endpoint2').reply(() => {
        callCounts.endpoint2++;
        if (callCounts.endpoint2 === 1) return [401, {}];
        return [200, { data: 'success2' }];
      });
      
      mock.onGet('/endpoint3').reply(() => {
        callCounts.endpoint3++;
        if (callCounts.endpoint3 === 1) return [401, {}];
        return [200, { data: 'success3' }];
      });

      // Make parallel requests
      const promises = [
        freshApi.get('/endpoint1'),
        freshApi.get('/endpoint2'),
        freshApi.get('/endpoint3'),
      ];

      const responses = await Promise.all(promises);

      // Verify refresh was called only ONCE (single refresh for all queued requests)
      expect(authService.refresh).toHaveBeenCalledTimes(1);
      
      // Verify all requests succeeded
      expect(responses[0].status).toBe(200);
      expect(responses[1].status).toBe(200);
      expect(responses[2].status).toBe(200);
    });
  });

  describe('Test 3: Refresh failure clears auth and rejects request', () => {
    it('should clear auth and reject when refresh fails with 401/403', async () => {
      const { api: freshApi } = require('@/services/api');
      mock = new MockAdapter(freshApi);

      // Mock refresh to fail with 401
      (authService.refresh as jest.Mock).mockRejectedValue({
        response: { status: 401 },
      });

      mock.onGet('/test-endpoint').reply(401);

      // Make the request
      await expect(freshApi.get('/test-endpoint')).rejects.toThrow();

      // Verify clearAuth was called
      expect(mockStore.clearAuth).toHaveBeenCalled();
    });

    it('should handle network error with user-friendly message', async () => {
      const { api: freshApi } = require('@/services/api');
      
      // Mock a network error (no response)
      mock = new MockAdapter(freshApi);
      mock.onGet('/test-endpoint').networkError();

      try {
        await freshApi.get('/test-endpoint');
      } catch (error: any) {
        // Should have a user-friendly message
        expect(error.message).toBe('Network error. Please check your connection.');
      }
    });
  });
});
