/* global jest */
// Basic mock for libraries that might be used across the app

jest.mock("expo-font", () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("expo-asset", () => ({
  Asset: {
    loadAsync: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: {
    Error: "error",
  },
  ImpactFeedbackStyle: {
    Heavy: "heavy",
  },
}));
