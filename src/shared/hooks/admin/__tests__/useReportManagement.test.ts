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
import { useReportManagement } from "../useReportManagement";
import { getAllReports, deleteReport } from "@/lib/firebase/reports";

// Mocks
jest.mock("@/lib/firebase/reports", () => ({
  getAllReports: jest.fn(),
  updateReportStatus: jest.fn(),
  deleteReport: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useFocusEffect: (cb: any) => jest.requireActual("react").useEffect(cb, []), // Run once on mount
}));

describe("useReportManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches reports if admin", async () => {
    const mockReports = [{ id: "1" }];
    (getAllReports as jest.Mock).mockResolvedValue(mockReports);

    const { result } = renderHook(() => useReportManagement(true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.reports).toEqual(mockReports);
  });

  it("deletes report", async () => {
    const mockReports = [{ id: "1", imageUrl: "url" }];
    (getAllReports as jest.Mock).mockResolvedValue(mockReports);

    const { result } = renderHook(() => useReportManagement(true));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.reports.length).toBe(1);
    });

    await act(async () => {
      await result.current.handleReportDelete("1");
    });

    expect(deleteReport).toHaveBeenCalledWith("1", "url");
    expect(result.current.reports.length).toBe(0);
  });
});
