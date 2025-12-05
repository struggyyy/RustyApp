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
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";

// Internal imports
import colors from "@theme/colors";

const { width, height } = Dimensions.get("window");
// Calculate diameter to cover the screen from center
const SCREEN_DIAGONAL = Math.sqrt(width * width + height * height);
const CIRCLE_SIZE = 100; // Initial size of the circle
const MAX_SCALE = (SCREEN_DIAGONAL / CIRCLE_SIZE) * 2.5; // Extra factor to ensure full coverage

interface SplashTransitionProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export const SplashTransition: React.FC<SplashTransitionProps> = ({
  isLoading,
  children,
}) => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);

  // Animation values
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Reset state when loading starts again (e.g. Admin Redirect)
  useEffect(() => {
    if (isLoading && isAnimationFinished) {
      setIsAnimationFinished(false);
      setIsAppReady(false);
      scale.setValue(0);
      opacity.setValue(1);
    }
  }, [isLoading, isAnimationFinished, scale, opacity]);

  useEffect(() => {
    if (!isLoading && !isAppReady) {
      // Loading just finished, mount the app
      setIsAppReady(true);

      // Safety timeout: Ensure we never get stuck, even if animation fails
      const safetyTimeout = setTimeout(() => {
        setIsAnimationFinished(true);
      }, 5000); // 5 seconds (plenty of time for 1.2s animation)

      // Start animation sequence
      Animated.sequence([
        // 1. Expand the red circle
        Animated.timing(scale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        // 2. Fade out the whole overlay
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        clearTimeout(safetyTimeout);
        setIsAnimationFinished(true);
      });
    }
  }, [isLoading, isAppReady, scale, opacity]);

  return (
    <View style={styles.container}>
      {/* Render App underneath immediately to allow loading */}
      <View style={StyleSheet.absoluteFill}>{children}</View>

      {!isAnimationFinished && (
        <Animated.View style={[styles.overlay, { opacity }]}>
          {/* The Spinner - rendered first so it gets covered by the circle */}
          {!isAppReady && (
            <ActivityIndicator size="large" color={colors.primary} />
          )}

          {/* Expanding Red Circle */}
          <Animated.View
            style={[
              styles.circle,
              {
                transform: [
                  {
                    scale: scale.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, MAX_SCALE],
                    }),
                  },
                ],
              },
            ]}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    zIndex: 1000,
  },
  circle: {
    position: "absolute",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.primary,
    // Start centered
  },
});
