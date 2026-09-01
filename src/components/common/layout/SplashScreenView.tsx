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
import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, StyleSheet, Animated, Easing, Image } from "react-native";

// Internal imports
import colors from "@theme/colors";

const LOGO_FADE_DURATION = 400; // Quick logo exit - done well before bg starts
const BACKGROUND_FADE_DURATION = 1000; // Long, slow bg dissolve into the home screen
const BACKGROUND_FADE_DELAY = 350; // Logo is ~87% gone before bg even begins moving

export interface SplashScreenViewProps {
  isLoading?: boolean;
  onAnimationFinish?: () => void;
  children?: React.ReactNode;
  logoSize?: number;
  testID?: string;
}

export default function SplashScreenView({
  isLoading = false,
  onAnimationFinish,
  children,
  logoSize = 170,
  testID = "splash-screen-view",
}: SplashScreenViewProps) {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);

  // Separate opacity values: logo fades out faster than the background
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const backgroundOpacity = useRef(new Animated.Value(1)).current;

  const handleFinish = useCallback(() => {
    setIsAnimationFinished(true);
    onAnimationFinish?.();
  }, [onAnimationFinish]);

  // Reset state when loading starts again
  useEffect(() => {
    if (isLoading && isAnimationFinished) {
      setIsAnimationFinished(false);
      setIsAppReady(false);
      logoOpacity.setValue(1);
      backgroundOpacity.setValue(1);
    }
  }, [isLoading, isAnimationFinished, logoOpacity, backgroundOpacity]);

  useEffect(() => {
    if (!isLoading && !isAppReady) {
      // Loading just finished — mark app as ready and begin exit animation
      setIsAppReady(true);

      // Safety timeout in case animation never fires
      const safetyTimeout = setTimeout(() => {
        handleFinish();
      }, 5000);

      // Premium opacity-only exit sequence:
      //   1. Logo fades first so it doesn't bleed into home screen content
      //   2. Background fades after a short delay for a seamless dissolve
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: LOGO_FADE_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(BACKGROUND_FADE_DELAY),
          Animated.timing(backgroundOpacity, {
            toValue: 0,
            duration: BACKGROUND_FADE_DURATION,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        clearTimeout(safetyTimeout);
        handleFinish();
      });

      return () => clearTimeout(safetyTimeout);
    }
  }, [isLoading, isAppReady, logoOpacity, backgroundOpacity, handleFinish]);

  return (
    <View style={styles.container}>
      {/* App content rendered underneath, visible as splash fades out */}
      <View style={StyleSheet.absoluteFill}>{children}</View>

      {!isAnimationFinished && (
        <Animated.View
          style={[styles.overlay, { opacity: backgroundOpacity }]}
          testID={testID}
          pointerEvents="none"
        >
          {/* Logo fades out faster than the background */}
          <Animated.View style={{ opacity: logoOpacity }}>
            <Image
              source={require("@assets/AdaptiveIcon.png")}
              style={{ width: logoSize, height: logoSize }}
              resizeMode="contain"
              testID="splash-logo-image"
            />
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    zIndex: 1000,
    elevation: 1000,
  },
});
