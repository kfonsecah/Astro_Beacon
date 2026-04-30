import axios from 'axios';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

export const tokenRefresh = {
  subscribe: subscribeTokenRefresh,
  notify: onTokenRefreshed,

  get isRefreshing() {
    return isRefreshing;
  },

  set isRefreshing(val: boolean) {
    isRefreshing = val;
  },
};

export async function refreshTokens(
  refreshToken: string,
  apiBaseUrl: string,
  updateToken: (token: string) => void
): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => resolve(token));
    });
  }

  isRefreshing = true;

  try {
    const response = await axios.post<{
      success: boolean;
      data: { accessToken: string };
    }>(
      `${apiBaseUrl}/auth/refresh`,
      { refreshToken },
      { timeout: 15000 }
    );
    const newAccessToken = response.data.data.accessToken;
    updateToken(newAccessToken);
    onTokenRefreshed(newAccessToken);
    return newAccessToken;
  } catch {
    updateToken('');
    return null;
  } finally {
    isRefreshing = false;
  }
}