// Unified API configuration - single source of truth for API URL
const getApiBaseUrl = (): string => {
  // Check for Expo public env variable first
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log('[API Config] Using EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Fallback based on environment
  if (__DEV__) {
    // Development - use local IP
    const devUrl = "http://172.17.35.72:3000/api/v1";
    console.log('[API Config] Using DEV URL:', devUrl);
    return devUrl;
  }

  // Production - update this with your actual production API URL
  const prodUrl = "https://your-api-domain.com/api/v1";
  console.log('[API Config] Using PROD URL:', prodUrl);
  return prodUrl;
};

export const API_BASE_URL = getApiBaseUrl();
