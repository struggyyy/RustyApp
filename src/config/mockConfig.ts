import { Report } from "@/shared/types/reports";
import { Timestamp, GeoPoint } from "firebase/firestore";
import { Image } from "react-native";

// TOGGLE THIS TO TRUE TO ENABLE MOCK MODE FOR MARKETING DEMO
export const IS_MOCK_MODE = true;

// Mock User Points
export const MOCK_USER_POINTS = 110;

export const MOCK_LOCATION = {
  coords: {
    latitude: 50.064412,
    longitude: 19.935563,
    altitude: 219,
    accuracy: 10,
    altitudeAccuracy: 10,
    heading: 0,
    speed: 0,
  },
  timestamp: Date.now(),
};

// Resolve local assets to URIs
const DELOREAN_URI = Image.resolveAssetSource(
  require("../../assets/images/Delorean.png")
).uri;
const CV2_URI = Image.resolveAssetSource(
  require("../../assets/images/2cv.png")
).uri;
const VW_BUS_URI = Image.resolveAssetSource(
  require("../../assets/images/VwBus.png")
).uri;

export const MOCK_REPORT_IMAGE_URL = VW_BUS_URI;

// Mock Reports
export const MOCK_REPORTS: Report[] = [
  {
    id: "mock-report-delorean",
    userId: "mock-user-001",
    userEmail: "marty@rustyapp.com",
    description:
      "This car has been floating here for ages... waiting to go back to the future! Needs removal before 1985.",
    location: new GeoPoint(50.064639, 19.928595),
    imageUrl: DELOREAN_URI,
    createdAt: Timestamp.fromDate(new Date("2025-12-18T10:00:00")),
    status: "Accepted",
    points: 10,
  },
  {
    id: "mock-report-2cv",
    userId: "mock-user-002",
    userEmail: "pierre@rustyapp.com",
    description:
      "Abandoned 2CV left on the side of the road. It's collecting rust and needs to be taken from the streets.",
    location: new GeoPoint(50.061451, 19.930459),
    imageUrl: CV2_URI,
    createdAt: Timestamp.fromDate(new Date("2025-11-15T14:30:00")), // Approx 1 month ago
    status: "Completed",
    points: 100,
  },
];

// Fallback for single report usage if needed, though we should prefer the array
export const MOCK_REPORT = MOCK_REPORTS[0];
