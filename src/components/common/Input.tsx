import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  hintStyle?: StyleProp<TextStyle>;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  hintStyle,
  required = false,
  onFocus,
  onBlur,
  ...restProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  // Determine border color based on state
  const getBorderColor = () => {
    if (error) return colors.error.main;
    if (isFocused) return colors.brand[500];
    return colors.border.medium;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          isFocused && styles.focusedInput,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...restProps}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={[styles.error, errorStyle]}>
          {error}
        </Text>
      )}

      {hint && !error && (
        <Text style={[styles.hint, hintStyle]}>
          {hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.form.fieldMargin,
    width: '100%',
  },
  labelContainer: {
    marginBottom: spacing.form.labelMargin,
  },
  label: {
    ...typography.textStyles.label,
    color: colors.text.primary,
  },
  required: {
    color: colors.error.main,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderColor: colors.border.medium,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  focusedInput: {
    borderColor: '#BD5151',
  },
  input: {
    ...typography.textStyles.body1,
    flex: 1,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  error: {
    ...typography.textStyles.caption,
    color: colors.error.main,
    marginTop: spacing.xxs,
  },
  hint: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xxs,
  },
  leftIconContainer: {
    marginRight: spacing.sm,
  },
  rightIconContainer: {
    marginLeft: spacing.sm,
  },
});

export default Input; 