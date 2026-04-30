// Mock react-native setup that avoids Flow syntax issues
jest.mock('react-native', () => require('react-native/jest/mock'));

// Define globals
global.__DEV__ = true;

// Mock expo modules
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock other expo modules as needed
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    navigate: jest.fn(),
  }),
  Stack: {
    Protected: jest.fn(({ children }) => children),
  },
}));
