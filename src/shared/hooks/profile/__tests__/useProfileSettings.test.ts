import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useProfileSettings } from "../useProfileSettings";

// Mocks
const mockUpdateUserProfile = jest.fn();
const mockChangeLanguage = jest.fn();
const mockShowAlert = jest.fn();

jest.mock("@/core/context/AuthContext", () => ({
  useAuth: () => ({
    updateUserProfile: mockUpdateUserProfile,
    profile: {
      notificationPreferences: { push: true, haptics: true },
    },
  }),
}));

jest.mock("@/core/context/LanguageContext", () => ({
  useLanguage: () => ({
    currentLanguage: "en",
    changeLanguage: mockChangeLanguage,
  }),
}));

jest.mock("@/core/context/AlertContext", () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

describe("useProfileSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with correct values", () => {
    const { result } = renderHook(() =>
      useProfileSettings({ t: (key) => key })
    );
    expect(result.current.notificationsEnabled).toBe(true);
    expect(result.current.hapticsEnabled).toBe(true);
  });

  it("toggles notifications and calls API", async () => {
    mockUpdateUserProfile.mockResolvedValue(true);
    const { result } = renderHook(() =>
      useProfileSettings({ t: (key) => key })
    );

    await act(async () => {
      await result.current.handleToggleNotifications(false);
    });

    expect(result.current.notificationsEnabled).toBe(false);
    expect(mockUpdateUserProfile).toHaveBeenCalledWith({
      notificationPreferences: expect.objectContaining({ push: false }),
    });
  });

  it("toggles haptics and calls API", async () => {
    mockUpdateUserProfile.mockResolvedValue(true);
    const { result } = renderHook(() =>
      useProfileSettings({ t: (key) => key })
    );

    await act(async () => {
      await result.current.handleToggleHaptics(false);
    });

    expect(result.current.hapticsEnabled).toBe(false);
    expect(mockUpdateUserProfile).toHaveBeenCalledWith({
      notificationPreferences: expect.objectContaining({ haptics: false }),
    });
  });

  it("toggles language", async () => {
    const { result } = renderHook(() =>
      useProfileSettings({ t: (key) => key })
    );

    await act(async () => {
      await result.current.handleToggleLanguage();
    });

    expect(mockChangeLanguage).toHaveBeenCalledWith("pl");
  });

  it("reverts state on API error", async () => {
    mockUpdateUserProfile.mockRejectedValue(new Error("API Error"));
    const { result } = renderHook(() =>
      useProfileSettings({ t: (key) => key })
    );

    await act(async () => {
      await result.current.handleToggleNotifications(false);
    });

    expect(result.current.notificationsEnabled).toBe(true); // Should revert to true
    expect(mockShowAlert).toHaveBeenCalled();
  });
});
