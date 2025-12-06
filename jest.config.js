module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["./jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@screens/(.*)$": "<rootDir>/src/screens/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@context/(.*)$": "<rootDir>/src/core/context/$1",
    "^@api/(.*)$": "<rootDir>/src/api/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@utils/(.*)$": "<rootDir>/src/shared/utils/$1",
    "^@theme/(.*)$": "<rootDir>/src/core/theme/$1",
    "^@navigation/(.*)$": "<rootDir>/src/navigation/$1",
    "^@assets/(.*)$": "<rootDir>/assets/$1",
  },
};
