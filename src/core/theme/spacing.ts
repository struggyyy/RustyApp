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
// Simplified spacing system - direct pixel values for clarity
const spacing = {
  // Core spacing scale
  XXS: 2, // Very small gaps, fine adjustments
  XS: 4, // Extra small - icon padding, small gaps
  S: 8, // Small - margins, component padding
  M: 16, // Medium - standard padding, margins (most common)
  L: 24, // Large - section spacing, larger components
  XL: 32, // Extra large - major sections, big components

  // Border radius
  radius: {
    XS: 4,  // Small buttons, chips
    S: 8,   // Standard components
    M: 16,  // Cards, modals (increased from 12px for better rounded appearance)
    L: 20,  // Large containers (increased from 16px for better rounded appearance)
    XL: 24, // Special cases, large radius
    XXL: 40, // Circular images (80px diameter)
  },

  // Layout spacing - commonly used in layouts
  layout: {
    cardPadding: 16, // Standard card padding
    screenPadding: 16, // Screen edge padding
    sectionPadding: 24, // Between major sections
  },

  // Component spacing - specific to UI components
  component: {
    buttonPadding: 12, // Button vertical padding
    fabSize: 56, // Floating action button size
    modalPadding: 20, // Modal content padding
  },

  // Safe area insets
  insets: {
    horizontal: 16, // Safe area horizontal padding
    vertical: 16, // Safe area vertical padding
  },
};

export default spacing;
