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
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";

// Internal imports
import theme from "@theme/index";
import { useHaptics } from "@context/HapticsContext";

interface ProfileButtonProps {
  userEmail?: string | null;
  profileImage?: string | null;
  onPress: () => void;
  size?: number;
  style?: any;
}

// Circular profile button with image or placeholder
const ProfileButton: React.FC<ProfileButtonProps> = ({
  userEmail,
  profileImage,
  onPress,
  size = 56,
  style,
}) => {
  const haptics = useHaptics();
  const [imageKey, setImageKey] = useState(0);

  // Force image reload when profile image URL changes
  useEffect(() => {
    setImageKey((prev) => prev + 1);
  }, [profileImage]);

  const handlePress = () => {
    haptics.heavy();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      {profileImage ? (
        <Image
          key={imageKey}
          style={styles.profileImage}
          source={{ uri: profileImage }}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            {userEmail?.[0]?.toUpperCase() || "?"}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: theme.colors.primary,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 28, // Will be adjusted based on size prop
  },
  placeholder: {
    width: "100%",
    height: "100%",
    borderRadius: 28, // Will be adjusted based on size prop
    backgroundColor: theme.colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default ProfileButton;
