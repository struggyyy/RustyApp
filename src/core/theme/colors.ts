/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2025, @struggyyy                    *
 *                                                                         *
 *                             Project: Rusty                              *
 *                                                                         *
 *                         All Rights Reserved                             *
 *                                                                         *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *                                                                         *
 ************************************************************************** */
// Internal imports
import { ReportStatus } from "@/shared/types/reports";

// Base color palette
const palette = {
  brand: {
    primary: "#BD5151", // Main brand color
  },

  // Neutral grays
  neutral: {
    50: "#FFFFFF", // White backgrounds, text on dark
    100: "#CECECEFF", // Medium gray for backgrounds and borders
    200: "#9E9E9E", // Tertiary text, disabled states
    300: "#656565", // Primary text
    400: "#333333", // Dark gray text
    500: "#000000", // Black for shadows
  },

  // Status colors
  status: {
    Submitted: "#1976D2", // Blue for submitted
    Accepted: "#00796B", // Teal for accepted
    Completed: "#2E7D32", // Green for completed
    Canceled: "#C62828", // Red for canceled
  },

  // Navigation
  navigation: "#1565C0",

  // Error states
  error: "#C62828",
};

// Utility functions
export const getStatusColor = (
  status: ReportStatus | string | undefined
): string => {
  if (!status) return palette.status.Submitted;
  const safeStatus = status as ReportStatus;
  switch (safeStatus) {
    case "Submitted":
      return palette.status.Submitted;
    case "Accepted":
      return palette.status.Accepted;
    case "Completed":
      return palette.status.Completed;
    case "Canceled":
      return palette.status.Canceled;
    default:
      return palette.neutral[300]; // primary text color
  }
};

// Theme color mappings
const colors = {
  // Brand
  primary: palette.brand.primary,

  // Backgrounds
  background: {
    primary: palette.neutral[50], // Main app background
    secondary: palette.neutral[100], // Component backgrounds
    semiTransparent: "rgba(255, 255, 255, 0.9)", // Semi-transparent white
    overlay: "rgba(0, 0, 0, 0.5)", // Modal overlay
    overlayLight: "rgba(0, 0, 0, 0.3)", // Lighter modal overlay for nested modals
  },

  // Text colors
  text: {
    primary: palette.neutral[300], // Main text color
    tertiary: palette.neutral[200], // Tertiary text / placeholders
    inverse: palette.neutral[50], // Text on dark backgrounds
    dark: palette.neutral[400], // Dark text
  },

  // Interactive elements
  border: {
    default: palette.neutral[100], // Default borders
  },

  // Status colors
  status: palette.status,

  // Navigation
  navigation: palette.navigation,

  // Error states
  error: palette.error,
  success: palette.status.Completed,
  info: palette.status.Submitted,

  // Utility
  white: palette.neutral[50],
  black: palette.neutral[500],
  shadow: "rgba(0, 0, 0, 0.15)", // For gradients

  // Utility functions
  getStatusColor,
};

export default colors;
