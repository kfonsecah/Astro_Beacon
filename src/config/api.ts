// Unified API configuration - single source of truth for API URL
const getApiBaseUrl = (): string => {
  // Check for Expo public env variable first
  if (process.env.EXPO_PUBLIC_API_URL) {
    if (__DEV__) console.log('[API Config] Using EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Fallback based on environment
  if (__DEV__) {
    // Development - use local IP
    // NOTE: If using Expo tunnel, this IP must be accessible from your phone
    // For tunnel mode, update EXPO_PUBLIC_API_URL with your ngrok URL
    const devUrl = "http://172.17.35.72:3000/api/v1";
    if (__DEV__) console.log('[API Config] Using DEV URL:', devUrl);
    if (__DEV__) console.log('[API Config] If using Expo Go on physical device, make sure this IP is accessible from your phone');
    if (__DEV__) console.log('[API Config] Or use tunnel mode: npx expo start --tunnel');
    return devUrl;
  }

  // Production - EXPO_PUBLIC_API_URL must be set
  const prodUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!prodUrl) {
    throw new Error(
      '[API Config] EXPO_PUBLIC_API_URL must be set in production. ' +
      'Add it to your .env file or CI environment.'
    );
  }
  return prodUrl;
};

export const API_BASE_URL = getApiBaseUrl();

// Helper to change API URL at runtime (for debugging)
export const setApiBaseUrl = (url: string) => {
  if (__DEV__) console.log('[API Config] Runtime URL change to:', url);
  // Note: This won't change the axios instance after creation
  // Restart the app after changing .env or use tunnel mode
};
