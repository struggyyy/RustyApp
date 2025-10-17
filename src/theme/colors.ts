/**
 * Color palette for Rusty application
 */

const palette = {
  // Primary brand color
  brand: {
    500: '#BD5151', // Main brand color
  },
  
  // Secondary/accent colors
  gray: {
    300: '#D9D9D9', // Component background
    500: '#9E9E9E',
    600: '#757575',
    650: '#656565', // Main text color
  },
  
  // Semantic colors
  success: {
    dark: '#2E7D32',
  },
  error: {
    main: '#F44336',
  },
  info: {
    dark: '#1565C0',
  },
  
  // Base colors
  white: '#FFFFFF',
};

const colors = {
  // Theme colors mapping
  primary: palette.brand[500],
  secondaryLight: palette.gray[300],
  
  // Functional colors
  background: {
    primary: palette.white,
    secondary: palette.gray[300],
  },
  
  text: {
    primary: palette.gray[650],
    secondary: palette.gray[600],
    tertiary: palette.gray[500],
    disabled: palette.gray[500],
    light: palette.white,
  },
  
  border: {
    medium: palette.gray[300],
  },
  
  componentBackground: palette.gray[300],
  
  status: {
    inProcess: palette.info.dark,
    recycled: palette.success.dark,
  },

  error: {
    main: palette.error.main,
  },
  
  white: palette.white,
};

export default colors; 