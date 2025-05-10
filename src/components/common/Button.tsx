import React from 'react';
import {
  TouchableOpacityProps,
  TextProps,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import styled, { css } from 'styled-components/native';

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';

// Button sizes
export type ButtonSize = 'small' | 'medium' | 'large';

// Button props
export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>; // Keep for external overrides
  textStyle?: StyleProp<TextStyle>; // Keep for external overrides
  testID?: string;
}

interface StyledButtonContainerProps {
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth?: boolean;
  isDisabled?: boolean;
}

const ButtonContainer = styled.TouchableOpacity<StyledButtonContainerProps>`
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  flex-direction: row;

  /* Size Styles */
  ${(props: StyledButtonContainerProps) => {
    switch (props.size) {
      case 'small':
        return css`
          padding: ${spacing.xs}px ${spacing.md}px;
          min-height: 32px;
        `;
      case 'large':
        return css`
          padding: ${spacing.md}px ${spacing.lg}px;
          min-height: 56px;
        `;
      case 'medium':
      default:
        return css`
          padding: ${spacing.sm}px ${spacing.md}px;
          min-height: 44px;
        `;
    }
  }}

  /* Full Width */
  ${(props: StyledButtonContainerProps) => props.fullWidth && css`width: 100%;`}

  /* Variant and Disabled Styles */
  ${(props: StyledButtonContainerProps) => {
    const { variant, isDisabled } = props;
    if (isDisabled) {
      switch (variant) {
        case 'primary': return css`background-color: ${colors.gray[300]};`;
        case 'secondary': return css`background-color: ${colors.gray[200]};`;
        case 'outline': return css`border-color: ${colors.gray[300]}; background-color: transparent; border-width: 1px;`;
        case 'text': return css`background-color: transparent;`; // No special disabled style for text button container
        default: return css`background-color: ${colors.gray[300]};`;
      }
    } else {
      switch (variant) {
        case 'primary': return css`background-color: ${colors.primary};`;
        case 'secondary': return css`background-color: ${colors.secondary};`;
        case 'outline': return css`background-color: transparent; border-width: 1px; border-color: ${colors.primary};`;
        case 'text': return css`background-color: transparent; border-width: 0;`;
        default: return css`background-color: ${colors.primary};`;
      }
    }
  }}
`;

interface StyledButtonTextProps {
  variant: ButtonVariant;
  size: ButtonSize;
  isDisabled?: boolean;
}

const ButtonTitle = styled.Text<StyledButtonTextProps>`
  ${typography.textStyles.button}
  text-align: center;

  /* Text Size Styles */
  ${(props: StyledButtonTextProps) => {
    switch (props.size) {
      case 'small': return css`font-size: ${typography.fontSize.caption}px;`;
      case 'large': return css`font-size: ${typography.fontSize.h6}px;`;
      case 'medium':
      default: return css`font-size: ${typography.fontSize.button}px;`; // Default button font size from theme
    }
  }}

  /* Text Variant and Disabled Styles */
  ${(props: StyledButtonTextProps) => {
    const { variant, isDisabled } = props;
    if (isDisabled) {
      switch (variant) {
        case 'primary':
        case 'secondary': return css`color: ${colors.gray[500]};`;
        case 'outline':
        case 'text': return css`color: ${colors.gray[400]};`;
        default: return css`color: ${colors.gray[500]};`;
      }
    } else {
      switch (variant) {
        case 'primary':
        case 'secondary': return css`color: ${colors.white};`;
        case 'outline':
        case 'text': return css`color: ${colors.primary};`;
        default: return css`color: ${colors.white};`;
      }
    }
  }}
`;

const ContentContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const IconContainer = styled.View`
  /* Base for both left and right icon containers */
`;

const LeftIconContainer = styled(IconContainer)`
  margin-right: ${spacing.xs}px;
`;

const RightIconContainer = styled(IconContainer)`
  margin-left: ${spacing.xs}px;
`;

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
  ...rest
}) => {
  return (
    <ButtonContainer
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      isDisabled={disabled || loading} // Pass combined disabled state
      onPress={onPress}
      disabled={disabled || loading} // Native disabled prop
      activeOpacity={0.7}
      style={style} // Apply external style overrides
      testID={testID}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'secondary' ? colors.white : colors.primary} 
        />
      ) : (
        <ContentContainer>
          {leftIcon && <LeftIconContainer>{leftIcon}</LeftIconContainer>}
          <ButtonTitle 
            variant={variant} 
            size={size} 
            isDisabled={disabled || loading}
            style={textStyle} // Apply external text style overrides
          >
            {title}
          </ButtonTitle>
          {rightIcon && <RightIconContainer>{rightIcon}</RightIconContainer>}
        </ContentContainer>
      )}
    </ButtonContainer>
  );
};

export default Button; 