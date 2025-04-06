/**
 * Typography configuration for Rusty application
 */

import { Platform } from 'react-native';

// Font families
const fontFamily = {
  // Primary fonts
  primary: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
    semiBold: Platform.OS === 'ios' ? 'System' : 'Roboto-SemiBold',
    light: Platform.OS === 'ios' ? 'System' : 'Roboto-Light',
  },
  
  // Secondary fonts (could be replaced with custom fonts later)
  secondary: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  },
};

// Font sizes
const fontSize = {
  // Headers
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  
  // Body text
  body1: 16, // Regular body text
  body2: 14, // Secondary body text
  caption: 12, // Captions and small text
  overline: 10, // Overline text (even smaller)
  
  // Button text
  button: 16,
  
  // Input text
  input: 16,
  
  // Label text
  label: 14,
};

// Line heights (multiplier of font size)
const lineHeight = {
  // For headers
  header: 1.4,
  
  // For body text
  body: 1.6,
  
  // For buttons and inputs
  control: 1.2,
  
  // For captions and small text
  small: 1.5,
};

// Font weights that match React Native's allowed values
type FontWeightType = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

// Font weights mapping to React Native compatible values
const fontWeight: Record<string, FontWeightType> = {
  light: '300',
  regular: 'normal',
  medium: '500',
  semiBold: '600',
  bold: 'bold',
};

// Letter spacing
const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  extraWide: 1,
};

// Text transform options
const textTransform = {
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
  none: 'none',
};

// Helper function to create a full text style
const createTextStyle = (
  size: number, 
  weight: keyof typeof fontWeight = 'regular',
  family: 'primary' | 'secondary' = 'primary',
  lineHeightMultiplier: number = lineHeight.body
) => {
  // Ensure the weight exists in the specified family
  const familyHasWeight = weight in fontFamily[family];
  const safeWeight = familyHasWeight ? weight : 'regular';
  
  return {
    fontSize: size,
    fontFamily: fontFamily[family][safeWeight as keyof typeof fontFamily[typeof family]],
    fontWeight: fontWeight[weight] as FontWeightType,
    lineHeight: size * lineHeightMultiplier,
  };
};

// Predefined text styles
const textStyles = {
  h1: createTextStyle(fontSize.h1, 'bold', 'primary', lineHeight.header),
  h2: createTextStyle(fontSize.h2, 'bold', 'primary', lineHeight.header),
  h3: createTextStyle(fontSize.h3, 'semiBold', 'primary', lineHeight.header),
  h4: createTextStyle(fontSize.h4, 'semiBold', 'primary', lineHeight.header),
  h5: createTextStyle(fontSize.h5, 'medium', 'primary', lineHeight.header),
  h6: createTextStyle(fontSize.h6, 'medium', 'primary', lineHeight.header),
  
  body1: createTextStyle(fontSize.body1, 'regular', 'primary', lineHeight.body),
  body2: createTextStyle(fontSize.body2, 'regular', 'primary', lineHeight.body),
  
  button: createTextStyle(fontSize.button, 'medium', 'primary', lineHeight.control),
  caption: createTextStyle(fontSize.caption, 'regular', 'primary', lineHeight.small),
  overline: createTextStyle(fontSize.overline, 'medium', 'primary', lineHeight.small),
  
  label: createTextStyle(fontSize.label, 'medium', 'primary', lineHeight.control),
};

const typography = {
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  textTransform,
  textStyles,
  createTextStyle,
};

export default typography; 