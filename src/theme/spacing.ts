/**
 * Spacing system for Rusty application
 * Provides consistent spacing throughout the app
 */

// Base unit for spacing (4px)
const BASE = 4;

// Calculate spacing values
const spacing = {
  // Base spacing units
  xxs: BASE * 0.5, // 2px
  xs: BASE,        // 4px
  sm: BASE * 2,    // 8px
  md: BASE * 4,    // 16px
  lg: BASE * 6,    // 24px
  xl: BASE * 8,    // 32px
  xxl: BASE * 12,  // 48px
  xxxl: BASE * 16, // 64px
  
  // Layout spacing
  layout: {
    screenPadding: BASE * 4, // 16px padding for screens
    sectionPadding: BASE * 6, // 24px padding between major sections
    cardPadding: BASE * 4, // 16px padding within cards
    listItemPadding: BASE * 3, // 12px padding for list items
  },
  
  // Form spacing
  form: {
    fieldMargin: BASE * 3, // 12px margin between form fields
    labelMargin: BASE * 1, // 4px margin after labels
    groupMargin: BASE * 6, // 24px margin between form groups
    inputPadding: BASE * 3, // 12px padding inside inputs
  },
  
  // Element spacing
  element: {
    buttonPadding: BASE * 3, // 12px padding within buttons
    iconPadding: BASE * 2, // 8px padding around icons
    chipPadding: BASE * 2, // 8px padding inside chips
  },
  
  // Component spacing
  component: {
    headerHeight: BASE * 14, // 56px default header height
    footerHeight: BASE * 16, // 64px default footer/tab bar height 
    modalPadding: BASE * 5, // 20px padding inside modals
    fabSize: BASE * 14, // 56px floating action button size
  },
  
  // Insets for safe area
  insets: {
    horizontal: BASE * 4, // 16px safe area inset
    vertical: BASE * 4, // 16px safe area inset
  },
  
  // Helper function to create custom spacing
  create: (multiplier: number) => BASE * multiplier,
};

export default spacing; 