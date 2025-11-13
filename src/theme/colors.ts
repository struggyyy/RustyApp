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
import { ReportStatus } from "../types/reports";

// Base color palette
const palette = {
  brand: {
    primary: "#BD5151", // Main brand color
  },

  // Neutral grays
  neutral: {
    50: "#FFFFFF", // White backgrounds, text on dark
    100: "#F5F5F5", // Light gray backgrounds
    200: "#D9D9D9", // Component backgrounds, borders
    300: "#9E9E9E", // Tertiary text, disabled states
    400: "#757575", // Secondary text
    500: "#656565", // Primary text
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
      return palette.neutral[500]; // primary text color
  }
};

// Theme color mappings
const colors = {
  // Brand
  primary: palette.brand.primary,

  // Backgrounds
  background: {
    primary: palette.neutral[50], // Main app background
    secondary: palette.neutral[200], // Component backgrounds
    tertiary: palette.neutral[100], // Alternative component backgrounds
  },

  // Text colors
  text: {
    primary: palette.neutral[500], // Main text color
    secondary: palette.neutral[400], // Secondary text
    tertiary: palette.neutral[300], // Tertiary text / placeholders
    inverse: palette.neutral[50], // Text on dark backgrounds
    disabled: palette.neutral[300], // Disabled text
    light: palette.neutral[300], // Light text (alias for tertiary)
  },

  // Interactive elements
  border: {
    default: palette.neutral[200], // Default borders
  },

  // Status colors
  status: palette.status,

  // Navigation
  navigation: palette.navigation,

  // Error states
  error: palette.error,

  // Utility
  white: palette.neutral[50],

  // Utility functions
  getStatusColor,
};

export default colors;
