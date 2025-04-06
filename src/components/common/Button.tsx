import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';

// Button sizes
export type ButtonSize = 'small' | 'medium' | 'large';

// Button props
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  testID,
}) => {
  // Get appropriate styles based on props
  const buttonStyles = [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    fullWidth && styles.fullWidth,
    disabled && styles[`${variant}DisabledButton`],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles[`${variant}DisabledText`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? colors.white : '#BD5151'} 
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <Text style={textStyles}>{title}</Text>
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  
  // Variant styles
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  
  // Size styles
  smallButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 32,
  },
  mediumButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  largeButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  
  // Width style
  fullWidth: {
    width: '100%',
  },
  
  // Disabled styles
  primaryDisabledButton: {
    backgroundColor: colors.gray[300],
  },
  secondaryDisabledButton: {
    backgroundColor: colors.gray[200],
  },
  outlineDisabledButton: {
    borderColor: colors.gray[300],
  },
  textDisabledButton: {
    // No special styling needed
  },
  
  // Text styles
  text: {
    ...typography.textStyles.button,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  textText: {
    color: colors.primary,
  },
  
  // Disabled text styles
  primaryDisabledText: {
    color: colors.gray[500],
  },
  secondaryDisabledText: {
    color: colors.gray[500],
  },
  outlineDisabledText: {
    color: colors.gray[400],
  },
  textDisabledText: {
    color: colors.gray[400],
  },
  
  // Text sizes
  smallText: {
    ...typography.textStyles.button,
    fontSize: typography.fontSize.caption,
  },
  mediumText: {
    ...typography.textStyles.button,
  },
  largeText: {
    ...typography.textStyles.button,
    fontSize: typography.fontSize.h6,
  },
  
  // Content container for icon + text layout
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  leftIconContainer: {
    marginRight: spacing.xs,
  },
  
  rightIconContainer: {
    marginLeft: spacing.xs,
  },
});

export default Button; 