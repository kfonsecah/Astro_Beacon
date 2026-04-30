import axios, { AxiosError, AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';

// Mock modules
jest.mock('@/stores/auth.store');
jest.mock('@/services/auth.service', () => ({
  __esModule: true,
  authService: {
    refresh: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
  API_BASE_URL: 'http://mock-api.com/api/v1',
}));

describe('API Client - Refresh Token Interceptor', () => {
  let mock: MockAdapter;
  let api: AxiosInstance;
  let mockStore: any;

  beforeEach(() => {
    jest.clearAllMocks();
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
    
    // Import fresh api module for each test
    const apiModule = require('@/services/api');
    api = apiModule.api;
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    if (mock) {
      mock.restore();
    }
  });

  it('should handle network error with user-friendly message', async () => {
    // Mock a network error (no response)
    mock.onGet('/test-endpoint').networkError();

    try {
      await api.get('/test-endpoint');
      fail('Should have thrown an error');
    } catch (error: any) {
      // Should have a user-friendly message
      expect(error.message).toBe('Network error. Please check your connection.');
    }
  });

  it('should call refresh token and retry on 401', async () => {
    // Mock the refresh call to succeed
    (authService.refresh as jest.Mock).mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    // Mock the original request to return 401 first, then succeed
    let callCount = 0;
    mock.onGet('/test-endpoint').reply(() => {
      callCount++;
      if (callCount === 1) {
        return [401, {}];
      }
      return [200, { success: true }];
    });

    // Make the request
    const response = await api.get('/test-endpoint');

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

  it('should queue parallel 401 requests', async () => {
    // Mock refresh to succeed
    (authService.refresh as jest.Mock).mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    // Track call counts for each endpoint
    const callCounts: Record<string, number> = {};
    
    // Mock endpoints to return 401 first, then succeed
    ['/endpoint1', '/endpoint2', '/endpoint3'].forEach(endpoint => {
      callCounts[endpoint] = 0;
      mock.onGet(endpoint).reply(() => {
        callCounts[endpoint]++;
        if (callCounts[endpoint] === 1) {
          return [401, {}];
        }
        return [200, { data: 'success' }];
      });
    });

    // Make parallel requests
    const promises = [
      api.get('/endpoint1'),
      api.get('/endpoint2'),
      api.get('/endpoint3'),
    ];

    const responses = await Promise.all(promises);

    // Verify refresh was called only ONCE (single refresh for all queued requests)
    expect(authService.refresh).toHaveBeenCalledTimes(1);
    
    // Verify all requests succeeded
    expect(responses[0].status).toBe(200);
    expect(responses[1].status).toBe(200);
    expect(responses[2].status).toBe(200);
  });

  it('should clear auth when refresh fails', async () => {
    // Mock refresh to fail with 401
    (authService.refresh as jest.Mock).mockRejectedValue({
      response: { status: 401 },
    });

    mock.onGet('/test-endpoint').reply(401);

    // Make the request and expect it to throw
    try {
      await api.get('/test-endpoint');
      fail('Should have thrown an error');
    } catch (error: any) {
      // Verify clearAuth was called
      expect(mockStore.clearAuth).toHaveBeenCalled();
    }
  });
});
