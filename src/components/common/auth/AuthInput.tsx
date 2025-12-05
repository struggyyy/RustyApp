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
import React, { forwardRef } from "react";
import {
  TextInput,
  TextInputProps,
  ViewStyle,
  StyleProp,
  Animated,
} from "react-native";

// External libraries
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// Internal imports
import theme from "@theme/index";

interface AuthInputProps extends TextInputProps {
  hasError?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const InputContainer = styled(Animated.View)<{ hasError?: boolean }>(
  ({ hasError }) => ({
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.spacing.M,
    marginBottom: theme.spacing.M,
    borderWidth: 1,
    borderColor: hasError ? theme.colors.error : theme.colors.border.default,
    paddingHorizontal: theme.spacing.M,
  })
);

const StyledTextInput = styled.TextInput.attrs({
  placeholderTextColor: theme.colors.text.tertiary,
})({
  flex: 1,
  paddingVertical: theme.spacing.M,
  color: theme.colors.text.primary,
  fontSize: theme.typography.fontSize.input,
});

const IconContainer = styled.TouchableOpacity({
  padding: theme.spacing.XS,
});

// Auth input component with error styling, icons, and forwardRef
export const AuthInput = forwardRef<TextInput, AuthInputProps>(
  (
    { hasError, rightIcon, onRightIconPress, containerStyle, ...props },
    ref
  ) => {
    return (
      <InputContainer hasError={hasError} style={containerStyle}>
        <StyledTextInput ref={ref} {...props} />
        {rightIcon && (
          <IconContainer
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              onRightIconPress && onRightIconPress();
            }}
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={rightIcon}
              size={24}
              color={theme.colors.text.tertiary}
            />
          </IconContainer>
        )}
      </InputContainer>
    );
  }
);

AuthInput.displayName = "AuthInput";
