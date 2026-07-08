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
// React-specific imports
import { Platform } from "react-native";

// Font families
const fontFamily = {
  primary: {
    regular: Platform.OS === "ios" ? "System" : "Roboto",
    medium: Platform.OS === "ios" ? "System" : "Roboto-Medium",
    bold: Platform.OS === "ios" ? "System" : "Roboto-Bold",
    semiBold: Platform.OS === "ios" ? "System" : "Roboto-SemiBold",
  },
};

// Font sizes
const fontSize = {
  // Display & Headings
  h1: 32, // Large titles, hero text
  h2: 28, // Main headings
  h3: 24, // Section headings - report cards, modals
  h4: 20, // Card titles, subheadings
  h5: 18, // Small headings - report dates
  h6: 16, // Small headings - status text

  // Body text
  body1: 16, // Regular body text - descriptions, details
  body2: 14, // Secondary body text - notes, secondary info

  // UI elements
  button: 16, // Button text
  input: 16, // Input field text
  caption: 12, // Captions, small labels - button text, metadata
  overline: 10, // Overline text - admin status buttons
};

// Typography object
const typography = {
  fontFamily,
  fontSize,

  // Helper function for creating custom text styles
  createTextStyle: (
    size: number,
    weight: keyof typeof fontFamily.primary = "regular",
  ) => ({
    fontSize: size,
    fontFamily: fontFamily.primary[weight],
  }),
};

export default typography;
