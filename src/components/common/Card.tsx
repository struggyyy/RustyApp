import React from 'react';
import {
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing } from '../../theme';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: number;
  testID?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  elevation = 2,
  testID,
}) => {
  const cardStyles = [
    styles.card,
    { elevation },
    elevation > 0 && styles.shadow,
    style,
  ];

  // If onPress is provided, make the card touchable
  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Otherwise render as a regular view
  return (
    <View style={cardStyles} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.layout.cardPadding,
    marginVertical: spacing.sm,
  },
  shadow: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
});

export default Card; 