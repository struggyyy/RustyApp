import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useAdminFilters } from "../useAdminFilters";
import { Report, ReportStatus } from "@/shared/types/reports";

// Mocks
const mockUpdateUserProfile = jest.fn();

const mockProfile = {
  adminPreferences: { selectedStatuses: [], maxDistance: 10 },
};

jest.mock("@/core/context/AuthContext", () => ({
  useAuth: () => ({
    profile: mockProfile,
    updateUserProfile: mockUpdateUserProfile,
  }),
}));

const mockLocation = { coords: { latitude: 52.2297, longitude: 21.0122 } };

jest.mock("@/shared/hooks/common/useLocation", () => ({
  useLocation: () => ({
    location: mockLocation,
    isLocationLoading: false,
  }),
}));

// Mock mapUtils
jest.mock("@/shared/utils/mapUtils", () => ({
  getDistance: jest.fn((lat1, lon1, lat2, lon2) => {
    // Simple mock: if coords match return 0, else return 5000 meters (5km)
    if (lat1 === lat2 && lon1 === lon2) return 0;
    return 5000;
  }),
}));

describe("useAdminFilters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockReports: Report[] = [
    {
      id: "1",
      status: "Submitted",
      location: { latitude: 52.2297, longitude: 21.0122 },
    } as unknown as Report,
    {
      id: "2",
      status: "Completed",
      location: { latitude: 0, longitude: 0 },
    } as unknown as Report, // Far away
  ];

  it("initializes from profile preferences", async () => {
    const { result } = renderHook(() => useAdminFilters(mockReports));
    await waitFor(() => {
      expect(result.current.maxDistance).toBe(10);
    });
  });

  it("filters by status", () => {
    const { result } = renderHook(() => useAdminFilters(mockReports));

    act(() => {
      result.current.handleStatusFilterChange(["Submitted"]);
    });

    expect(result.current.selectedStatuses).toEqual(["Submitted"]);
    // Should filter out 'Completed'
    expect(result.current.filteredReports.length).toBe(1);
    expect(result.current.filteredReports[0].id).toBe("1");
    expect(mockUpdateUserProfile).toHaveBeenCalled();
  });

  it("filters by distance", () => {
    const { result } = renderHook(() => useAdminFilters(mockReports));

    // Set max distance to 1km (1000m)
    // Our mock returns 5000m for report 2, and 0m for report 1.
    act(() => {
      result.current.handleDistanceFilterChange(1);
    });

    expect(result.current.filteredReports.length).toBe(1);
    expect(result.current.filteredReports[0].id).toBe("1");
  });
});
