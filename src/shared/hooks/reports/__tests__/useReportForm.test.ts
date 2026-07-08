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
import { useReportForm } from "../useReportForm";
import { createReport, uploadReportImage } from "@/lib/firebase/reports";

// Mocks
const mockShowAlert = jest.fn();
const mockReplace = jest.fn();

jest.mock("@/core/context/AuthContext", () => ({
  useAuth: () => ({
    user: { uid: "test-uid", email: "test@example.com" },
  }),
}));

jest.mock("@/core/context/AlertContext", () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
  }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("@/lib/firebase/reports", () => ({
  createReport: jest.fn(),
  uploadReportImage: jest.fn(),
}));

jest.mock("@/shared/hooks/common/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("useReportForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("checks form readiness", () => {
    const { result } = renderHook(() => useReportForm());

    expect(result.current.isFormReady(null, null)).toBe(false);

    // Valid data
    const location = { coords: { latitude: 10, longitude: 10 } } as any;
    act(() => {
      result.current.setDescription("Valid description");
    });

    expect(result.current.isFormReady("image-uri", location)).toBe(true);
  });

  it("handles successful submission", async () => {
    (uploadReportImage as jest.Mock).mockResolvedValue("uploaded-image-url");
    (createReport as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useReportForm());

    act(() => {
      result.current.setDescription("Valid description");
    });

    const location = { coords: { latitude: 10, longitude: 10 } } as any;

    await act(async () => {
      await result.current.handleSubmit("image-uri", location);
    });

    expect(uploadReportImage).toHaveBeenCalled();
    expect(createReport).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Valid description",
        imageUrl: "uploaded-image-url",
        location: { latitude: 10, longitude: 10 },
      }),
    );
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.anything(),
      "reports.reportSubmittedSuccess",
      expect.anything(),
    );
  });

  it("validates input before submission", async () => {
    const { result } = renderHook(() => useReportForm());

    // Empty description
    await act(async () => {
      await result.current.handleSubmit("image-uri", {} as any);
    });

    expect(uploadReportImage).not.toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.anything(),
      "reports.descriptionRequired",
    );
  });
});
