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
import { renderHook, act, waitFor } from "@testing-library/react-native";

// Internal imports
import { useReports } from "../useReports";
import { getReportsByUserId } from "@/lib/firebase/reports";

// Mocks

jest.mock("@/core/context/AuthContext", () => ({
  useAuth: () => ({
    user: { uid: "test-uid" },
  }),
}));

jest.mock("@/lib/firebase/reports", () => ({
  getReportsByUserId: jest.fn(),
}));

jest.mock("@/shared/hooks/common/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("useReports", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches reports on mount", async () => {
    const mockReports = [{ id: "1", description: "test" }];
    (getReportsByUserId as jest.Mock).mockResolvedValue(mockReports);

    const { result } = renderHook(() => useReports());

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Trigger fetch
    await act(async () => {
      await result.current.fetchReports();
    });

    expect(result.current.reports).toEqual(mockReports);
    expect(result.current.loading).toBe(false);
  });

  it("handles fetch errors", async () => {
    (getReportsByUserId as jest.Mock).mockRejectedValue(
      new Error("Fetch failed"),
    );

    const { result } = renderHook(() => useReports());

    await act(async () => {
      await result.current.fetchReports();
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.loading).toBe(false);
  });
});
