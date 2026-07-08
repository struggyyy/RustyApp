/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2026, @struggyyy                    *
 *
 *                              Project: Rusty                             *
 *
 *                         All Rights Reserved                             *
 *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *
 ************************************************************************** */
// Test-specific imports
import { renderHook, act } from "@testing-library/react-native";

// Internal imports
import { useProfileActions } from "../useProfileActions";

// Mocks
const mockLogOut = jest.fn();
const mockDeleteAccount = jest.fn();
const mockShowAlert = jest.fn();

jest.mock("@/core/context/AuthContext", () => ({
  useAuth: () => ({
    logOut: mockLogOut,
    deleteAccount: mockDeleteAccount,
  }),
}));

jest.mock("@/core/context/AlertContext", () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("useProfileActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handleLogout calls logOut", async () => {
    const { result } = renderHook(() => useProfileActions({ t: (key) => key }));

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(mockLogOut).toHaveBeenCalled();
  });

  it("handleDeleteAccount shows confirmation alert", () => {
    const { result } = renderHook(() => useProfileActions({ t: (key) => key }));

    act(() => {
      result.current.handleDeleteAccount();
    });

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.anything(),
      "profile.deleteAccountConfirm",
      expect.arrayContaining([
        expect.objectContaining({
          text: "common.delete",
          style: "destructive",
        }),
      ]),
    );
  });

  it("confirms account deletion", async () => {
    // Setup mock to simulate user clicking "Delete"
    mockShowAlert.mockImplementation(async (title, msg, buttons) => {
      const deleteButton = buttons.find((b: any) => b.style === "destructive");
      if (deleteButton && deleteButton.onPress) {
        await deleteButton.onPress();
      }
    });

    const { result } = renderHook(() => useProfileActions({ t: (key) => key }));

    await act(async () => {
      result.current.handleDeleteAccount();
    });

    expect(mockDeleteAccount).toHaveBeenCalled();
  });

  it("handles delete account errors", async () => {
    const error = { code: "auth/requires-recent-login" };
    mockDeleteAccount.mockRejectedValue(error);

    // Setup mock to simulate user clicking "Delete"
    mockShowAlert.mockImplementation((title, msg, buttons) => {
      const deleteButton = buttons.find((b: any) => b.style === "destructive");
      if (deleteButton) {
        deleteButton.onPress(); // Trigger deletion
      }
    });
    // We need to re-mock in the second call to verify the error alert
    // But showAlert is called twice (confirm -> error).
    // A better way is to inspect the calls.

    const { result } = renderHook(() => useProfileActions({ t: (key) => key }));

    await act(async () => {
      result.current.handleDeleteAccount();
    });

    // First call is confirmation, second should be error
    expect(mockShowAlert).toHaveBeenCalledTimes(2);
    expect(mockShowAlert).toHaveBeenLastCalledWith(
      expect.anything(),
      "profile.deleteAccountAuthRequired",
      expect.anything(),
    );
  });
});
