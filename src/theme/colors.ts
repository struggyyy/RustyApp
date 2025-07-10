/**
 * Color palette for Rusty application
 */

const palette = {
  // Primary brand color
  brand: {
    50: '#F7E5E5',
    100: '#EECCCC',
    200: '#E5B2B2',
    300: '#DB9999',
    400: '#D27F7F',
    500: '#BD5151', // Main brand color
    600: '#A84848',
    700: '#933F3F',
    800: '#7E3535',
    900: '#692C2C',
  },
  
  // Secondary/accent colors
  gray: {
    50: '#F8F8F8',
    100: '#F1F1F1',
    200: '#E6E6E6',
    300: '#D9D9D9', // Component background
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    650: '#656565', // Main text color
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Semantic colors
  success: {
    light: '#A5D6A7',
    main: '#4CAF50',
    dark: '#2E7D32',
  },
  warning: {
    light: '#FFE082',
    main: '#FFC107',
    dark: '#FFA000',
  },
  error: {
    light: '#EF9A9A',
    main: '#F44336',
    dark: '#C62828',
  },
  info: {
    light: '#90CAF9',
    main: '#2196F3',
    dark: '#1565C0',
  },
  
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

const colors = {
  danger: palette.error.dark, // Add danger color for delete buttons

  // Theme colors mapping
  primary: palette.brand[500],
  primaryLight: palette.brand[300],
  primaryDark: palette.brand[700],
  
  secondary: palette.gray[500],
  secondaryLight: palette.gray[300],
  secondaryDark: palette.gray[700],
  
  // Functional colors
  background: {
    primary: palette.white,
    secondary: palette.gray[300],
    dark: palette.gray[900],
  },
  
  text: {
    primary: palette.gray[650],
    secondary: palette.gray[600],
    tertiary: palette.gray[500],
    light: palette.white,
    disabled: palette.gray[400],
  },
  
  border: {
    light: palette.gray[200],
    medium: palette.gray[300],
    dark: palette.gray[400],
  },
  
  componentBackground: palette.gray[300],
  
  status: {
    submitted: palette.info.main,
    awaiting: palette.warning.main,
    verified: palette.brand[500],
    inProcess: palette.info.dark,
    removed: palette.success.main,
    recycled: palette.success.dark,
  },
  
  // Inherit palette
  ...palette,
};

export default colors; 