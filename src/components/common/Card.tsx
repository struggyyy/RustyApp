import React from 'react';
import {
  ViewProps,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, spacing } from '../../theme';
import styled, { css } from 'styled-components/native';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>; // Keep for external overrides
  onPress?: () => void;
  elevation?: number;
  testID?: string;
}

interface StyledCardProps {
  elevation: number;
}

const cardBaseStyles = css<StyledCardProps>`
  background-color: ${colors.white};
  border-radius: 8px;
  padding: ${spacing.layout.cardPadding}px;
  margin-vertical: ${spacing.sm}px;
  elevation: ${(props: StyledCardProps) => props.elevation};

  ${(props: StyledCardProps) => 
    props.elevation > 0 && 
    css`
      shadow-color: ${colors.black};
      shadow-offset: 0px 2px; /* width height */
      shadow-opacity: 0.1;
      shadow-radius: 3.84px;
    `}
`;

const CardView = styled.View<StyledCardProps & ViewProps>`
  ${cardBaseStyles}
`;

const CardTouchable = styled.TouchableOpacity<StyledCardProps & TouchableOpacityProps>`
  ${cardBaseStyles}
`;

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  elevation = 2, // Default elevation
  testID,
}) => {
  if (onPress) {
    return (
      <CardTouchable
        elevation={elevation}
        onPress={onPress}
        activeOpacity={0.7}
        style={style} // Apply external style overrides
        testID={testID}
      >
        {children}
      </CardTouchable>
    );
  }

  return (
    <CardView 
      elevation={elevation} 
      style={style} // Apply external style overrides
      testID={testID}
    >
      {children}
    </CardView>
  );
};

export default Card; 