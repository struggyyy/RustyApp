import React from "react";
import { render, waitFor, act } from "@testing-library/react-native";
import { LanguageProvider, useLanguage } from "../LanguageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../AuthContext";
import i18n from "@/core/i18n/i18n";

// Mocks
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("@/core/i18n/i18n", () => ({
  changeLanguage: jest.fn(),
}));

jest.mock("../AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Test Component
const TestComponent = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  return <></>; // We inspect functionality via hooks or mocks, or we could render text
};

describe("LanguageContext", () => {
  const mockUpdateUserProfile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      profile: null,
      updateUserProfile: mockUpdateUserProfile,
    });
  });

  it("initializes to default 'en' if no storage or profile", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(i18n.changeLanguage).toHaveBeenCalledWith("en");
    });
  });

  it("initializes from AsyncStorage if no profile", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("pl");

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(i18n.changeLanguage).toHaveBeenCalledWith("pl");
    });
  });

  it("initializes from User Profile (highest priority)", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("en");
    (useAuth as jest.Mock).mockReturnValue({
      profile: { language: "pl" },
      updateUserProfile: mockUpdateUserProfile,
    });

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(i18n.changeLanguage).toHaveBeenCalledWith("pl");
      // Should also sync to storage
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("appLanguage", "pl");
    });
  });

  it("changes language and updates all storages", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("en");
    (useAuth as jest.Mock).mockReturnValue({
      profile: { language: "en" },
      updateUserProfile: mockUpdateUserProfile,
    });

    // We need to access the context function.
    // Usually we test via a child component that triggers the action.
    let changeLangFn: any;
    const TriggerComponent = () => {
      const { changeLanguage } = useLanguage();
      changeLangFn = changeLanguage;
      return null;
    };

    render(
      <LanguageProvider>
        <TriggerComponent />
      </LanguageProvider>
    );

    await waitFor(() => expect(changeLangFn).toBeDefined());

    await act(async () => {
      await changeLangFn("pl");
    });

    expect(i18n.changeLanguage).toHaveBeenCalledWith("pl");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("appLanguage", "pl");
    expect(mockUpdateUserProfile).toHaveBeenCalledWith({ language: "pl" });
  });
});
