/**
 * Theme exports for Rusty application
 */

import colors from './colors';
import typography from './typography';
import spacing from './spacing';

// Export theme components individually
export { colors, typography, spacing };

// Export as a complete theme object
const theme = {
  colors,
  typography,
  spacing,
};

export default theme; 