module.exports = {
  // Don't use jest-expo preset to avoid Flow syntax issues
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { 
      presets: [
        '@babel/preset-env', 
        '@babel/preset-typescript', 
        ['@babel/preset-react', { runtime: 'automatic' }]
      ] 
    }],
  },
  
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.(ts|tsx|js|jsx)', '**/*.(test|spec).(ts|tsx|js|jsx)'],
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-native$': 'react-native/jest/mock.js',
    '^expo-secure-store$': '<rootDir>/__mocks__/expo-secure-store.js',
    '^expo-router$': '<rootDir>/__mocks__/expo-router.js',
  },
  
  transformIgnorePatterns: [
    'node_modules/(?!(jest-expo|expo|expo-|@expo/|react-native|react-native-|@react-navigation|@react-native-community|@tanstack|zustand|axios)/)',
  ],
  
  setupFiles: ['<rootDir>/jest.setup.js'],
  
  // Don't collect coverage for now
  collectCoverage: false,
};
