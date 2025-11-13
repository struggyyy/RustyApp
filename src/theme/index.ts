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
import colors from "./colors";
import shadows from "./shadows";
import spacing from "./spacing";
import typography from "./typography";

// Export theme components individually
export { colors, typography, spacing, shadows };

// Export as a complete theme object
const theme = {
  colors,
  typography,
  spacing,
  shadows,
};

export default theme;
