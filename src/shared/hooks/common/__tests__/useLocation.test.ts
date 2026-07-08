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
import { useLocation } from "../useLocation";
import * as Location from "expo-location";

// Mocks
jest.mock("expo-location", () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
}));

describe("useLocation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches location successfully when permission granted", async () => {
    // Mock granted permissions
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });
    // Mock location
    const mockLocation = { coords: { latitude: 10, longitude: 20 } };
    (Location.getLastKnownPositionAsync as jest.Mock).mockResolvedValue(
      mockLocation,
    );

    const { result } = renderHook(() => useLocation());

    // Initially loading
    expect(result.current.isLocationLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLocationLoading).toBe(false);
    });

    expect(result.current.location).toEqual(mockLocation);
    expect(result.current.locationErrorMsg).toBeNull();
  });

  it("sets error when permission denied", async () => {
    // Mock denied permissions
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    const { result } = renderHook(() => useLocation());

    await waitFor(() => {
      expect(result.current.isLocationLoading).toBe(false);
    });

    expect(result.current.location).toBeNull();
    // Expect error message (translated key if mocked, or string)
    // Since translation mock isn't explicit here, it uses real keys or mock return.
    // Assuming useTranslation is mocked globally or returns keys.
    expect(result.current.locationErrorMsg).toBeTruthy();
  });

  it("retries permission request when forceRetry is true", async () => {
    // First check says denied
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });
    // Request returns granted
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(
      { status: "granted" },
    );

    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { lat: 1, long: 1 },
    });

    const { result } = renderHook(() => useLocation());

    await waitFor(() => {
      expect(result.current.isLocationLoading).toBe(false);
    });

    // Initial fetch failed (denied)
    expect(result.current.location).toBeNull();

    // Call fetchLocation with forceRetry=true
    await act(async () => {
      await result.current.fetchLocation(true);
    });

    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    // Should now succeed (or try to)
    // Note: implementation gets location after permission grant
  });
});
