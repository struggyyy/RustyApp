import React, { useState } from 'react';
import {
  TextInput as RNTextInput, // Renaming to avoid conflict with styled component
  View,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import styled, { css } from 'styled-components/native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>; // Added for clarity
  inputStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  hintStyle?: StyleProp<TextStyle>;
  required?: boolean;
}

// Styled Components
const InputWrapper = styled.View`
  margin-bottom: ${spacing.form.fieldMargin}px;
  width: 100%;
`;

const LabelWrapper = styled.View`
  margin-bottom: ${spacing.form.labelMargin}px;
`;

const LabelText = styled.Text`
  ${typography.textStyles.label}
  color: ${colors.text.primary};
`;

const RequiredText = styled.Text`
  color: ${colors.error.main};
`;

interface StyledInputContainerProps {
  isFocused: boolean;
  hasError?: boolean;
}

const StyledInputContainer = styled.View<StyledInputContainerProps>`
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-radius: 8px;
  background-color: ${colors.white};
  padding-horizontal: ${spacing.md}px;
  height: 48px;
  border-color: ${(props: StyledInputContainerProps) => 
    props.hasError ? colors.error.main : 
    props.isFocused ? colors.brand[500] : 
    colors.border.medium};
`;

const StyledTextInput = styled.TextInput`
  ${typography.textStyles.body1}
  flex: 1;
  color: ${colors.text.primary};
  padding-vertical: ${spacing.sm}px;
`;

const ErrorText = styled.Text`
  ${typography.textStyles.caption}
  color: ${colors.error.main};
  margin-top: ${spacing.xxs}px;
`;

const HintText = styled.Text`
  ${typography.textStyles.caption}
  color: ${colors.text.tertiary};
  margin-top: ${spacing.xxs}px;
`;

const IconView = styled.View`
  /* Base for icon containers */
`;

const LeftIconView = styled(IconView)`
  margin-right: ${spacing.sm}px;
`;

const RightIconTouchable = styled.TouchableOpacity`
  margin-left: ${spacing.sm}px;
`;

const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  labelStyle,
  inputContainerStyle, // Consuming this new prop
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

  return (
    <InputWrapper style={containerStyle}>
      {label && (
        <LabelWrapper>
          <LabelText style={labelStyle}>
            {label}
            {required && <RequiredText> *</RequiredText>}
          </LabelText>
        </LabelWrapper>
      )}

      <StyledInputContainer 
        isFocused={isFocused} 
        hasError={!!error}
        style={inputContainerStyle} // Apply external style for the container
      >
        {leftIcon && <LeftIconView>{leftIcon}</LeftIconView>}

        <StyledTextInput
          style={inputStyle} // Apply external style for the text input itself
          placeholderTextColor={colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...restProps}
        />

        {rightIcon && (
          <RightIconTouchable
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </RightIconTouchable>
        )}
      </StyledInputContainer>

      {error && (
        <ErrorText style={errorStyle}>
          {error}
        </ErrorText>
      )}

      {hint && !error && (
        <HintText style={hintStyle}>
          {hint}
        </HintText>
      )}
    </InputWrapper>
  );
};

export default Input; 