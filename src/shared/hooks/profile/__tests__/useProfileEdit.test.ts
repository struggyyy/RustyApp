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
import * as ImagePicker from "expo-image-picker";

// Internal imports
import { useProfileEdit } from "../useProfileEdit";

// Mocks
const mockUpdateUserProfile = jest.fn();
const mockUploadProfileImage = jest.fn();
const mockShowAlert = jest.fn();
const mockUser = { uid: "test-uid", photoURL: "old-url" };

jest.mock("@/core/context/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    profile: { displayName: "Old Name" },
    updateUserProfile: mockUpdateUserProfile,
    uploadProfileImage: mockUploadProfileImage,
  }),
}));

jest.mock("@/core/context/AlertContext", () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

jest.mock("@/lib/firebase/firebase", () => ({
  storage: {},
}));

jest.mock("firebase/storage", () => ({
  ref: jest.fn(),
  deleteObject: jest.fn(),
}));

describe("useProfileEdit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates edited nickname state", () => {
    const { result } = renderHook(() => useProfileEdit({ t: (key) => key }));

    act(() => {
      result.current.handleEditedNicknameChange("New Name");
    });

    expect(result.current.editedNickname).toBe("New Name");
  });

  it("handles image selection", async () => {
    jest
      .spyOn(ImagePicker, "requestMediaLibraryPermissionsAsync")
      .mockResolvedValue({
        status: ImagePicker.PermissionStatus.GRANTED,
        granted: true,
        canAskAgain: true,
        expires: "never",
      });
    jest.spyOn(ImagePicker, "launchImageLibraryAsync").mockResolvedValue({
      canceled: false,
      assets: [{ uri: "new-image-uri", width: 100, height: 100 }],
    });

    const { result } = renderHook(() => useProfileEdit({ t: (key) => key }));

    await act(async () => {
      await result.current.handleChoosePhoto();
    });

    expect(result.current.tempImageUri).toBe("new-image-uri");
  });

  it("saves profile with new nickname", async () => {
    const { result } = renderHook(() => useProfileEdit({ t: (key) => key }));

    act(() => {
      result.current.setEditedNickname("Updated Name");
    });

    await act(async () => {
      await result.current.handleSaveProfile();
    });

    expect(mockUpdateUserProfile).toHaveBeenCalledWith({
      displayName: "Updated Name",
    });
  });

  it("validates nickname length", async () => {
    const { result } = renderHook(() => useProfileEdit({ t: (key) => key }));

    act(() => {
      result.current.setEditedNickname("A"); // Too short
    });

    await act(async () => {
      await result.current.handleSaveProfile();
    });

    expect(mockUpdateUserProfile).not.toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.anything(),
      "validation.nicknameTooShort",
    );
  });
});
