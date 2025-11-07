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
// React specific imports
import React from "react";
import { View, ActivityIndicator } from "react-native";

// Internal imports
import colors from "../../theme/colors";

interface LoadingScreenProps {
  color?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  color = colors.primary,
}) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
};

export default LoadingScreen;
