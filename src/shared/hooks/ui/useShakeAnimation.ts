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
import { useRef, useState } from "react";
import { Animated } from "react-native";

// Custom hook for shake animation
export const useShakeAnimation = () => {
  // Animation state
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const [isShakeAnimationRunning, setIsShakeAnimationRunning] = useState(false);

  // Trigger shake animation
  const triggerShake = () => {
    if (isShakeAnimationRunning) return;
    setIsShakeAnimationRunning(true);
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 5,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -5,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 5,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -5,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 75,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsShakeAnimationRunning(false);
    });
  };

  return {
    shakeAnimation,
    triggerShake,
    isShakeAnimationRunning,
  };
};
