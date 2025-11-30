/******************************************************************************
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
 ***************************************************************************/
// React-specific imports
import React, { useRef } from "react";
import { ActivityIndicator, Animated } from "react-native";

// External libraries
import { useAuth } from "../../../core/context/AuthContext";
import { useHaptics } from "../../../core/context/HapticsContext";
import { useTranslation } from "../../../shared/hooks/common/useTranslation";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

// Internal imports
import styled from "styled-components/native";
import StyledButton from "../../common/buttons/StyledButton";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../../core/theme/colors";
import theme from "../../../core/theme";
import spacing from "../../../core/theme/spacing";

const ProfileCard = styled.View<{ isExpanded: boolean }>(
  (props: { isExpanded: boolean }) => ({
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.radius.XL,
    padding: spacing.component.modalPadding,
    marginBottom: 12,
    flexDirection: props.isExpanded ? "column" : "row",
    alignItems: props.isExpanded ? "stretch" : "center",
  })
);

const CollapsedProfileContent = styled.View({
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "stretch",
  flex: 1,
  gap: 12,
});

const CollapsedProfileTop = styled.View({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
});

const ExpandedProfileHeader = styled.View({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.M,
});

const ExpandedProfileTitle = styled.Text({
  fontSize: 20,
  fontWeight: "bold",
  color: colors.text.primary,
});

const ExpandedProfileCloseButton = styled.TouchableOpacity({
  padding: spacing.S,
});

const ExpandedAvatarWrapper = styled.View({
  width: 120,
  height: 120,
  borderRadius: 60,
  backgroundColor: colors.background.secondary,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 5,
  borderColor: colors.primary,
  alignSelf: "center",
  marginBottom: 4,
});

const ExpandedAvatarImage = styled.Image({
  width: "100%",
  height: "100%",
  borderRadius: 60,
});

const ExpandedAvatarPlaceholder = styled.View({
  width: "100%",
  height: "100%",
  borderRadius: 60,
  backgroundColor: colors.background.secondary,
  justifyContent: "center",
  alignItems: "center",
});

const ExpandedAvatarPlaceholderText = styled.Text({
  fontSize: 40,
  color: colors.white,
  fontWeight: "bold",
});

const RemoveImageButton = styled.TouchableOpacity({
  position: "absolute",
  top: -5,
  right: -5,
  backgroundColor: colors.primary,
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: "center",
  alignItems: "center",
  zIndex: 6,
});

const EditLabel = styled.Text({
  fontSize: 14,
  fontWeight: "bold",
  color: colors.text.primary,
  marginBottom: spacing.S,
  marginTop: spacing.S,
});

const EditInput = styled.TextInput({
  backgroundColor: colors.white,
  borderRadius: spacing.radius.S,
  paddingHorizontal: spacing.M,
  paddingVertical: spacing.component.buttonPadding,
  fontSize: 16,
  color: colors.text.primary,
  marginBottom: 4,
  borderWidth: 1,
  borderColor: colors.background.secondary,
});

const EmailTouchable = styled.TouchableOpacity({
  marginTop: spacing.M,
  marginBottom: spacing.M,
});

const EmailText = styled.Text({
  fontSize: 16,
  color: colors.text.primary,
  textAlign: "center",
});

const PointsText = styled.Text({
  fontSize: 14,
  fontWeight: "bold",
  color: colors.text.primary,
  marginTop: 2,
});

const NicknameContainer = styled.View({
  alignItems: "flex-start",
  justifyContent: "center",
});

const AvatarTouchable = styled.TouchableOpacity``;

const AvatarWrapper = styled.View({
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: colors.background.secondary,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 5,
  borderColor: colors.primary,
  position: "relative",
});

const AvatarImage = styled.Image({
  width: "100%",
  height: "100%",
  borderRadius: 40,
});

const AvatarPlaceholder = styled.View({
  width: "100%",
  height: "100%",
  borderRadius: 40,
  backgroundColor: colors.background.secondary,
  justifyContent: "center",
  alignItems: "center",
});

const AvatarPlaceholderText = styled.Text({
  fontSize: 30,
  color: colors.white,
  fontWeight: "bold",
});

const Nickname = styled.Text({
  fontSize: 24,
  fontWeight: "bold",
  color: colors.primary,
  marginBottom: 4,
});

// Expandable profile card component supporting image and nickname editing
interface EditProfileProps {
  variant: "admin" | "user";
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  onAvatarPress?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onChoosePhoto?: (uri: string) => void;
  onRemoveImage?: () => void;
  onEmailPress?: () => void;
  uploading?: boolean;
  tempImageUri?: string | null;
  editedNickname?: string;
  onNicknameChange?: (text: string) => void;
  profileImageUrl?: string | null;
  imageRemoved?: boolean;
  shakeAnimation?: Animated.Value;
}

const EditProfile: React.FC<EditProfileProps> = ({
  variant,
  isExpanded = false,
  onToggleExpanded,
  onAvatarPress,
  onSave,
  onCancel,
  onChoosePhoto,
  onRemoveImage,
  onEmailPress,
  uploading = false,
  tempImageUri,
  editedNickname = "",
  onNicknameChange,
  profileImageUrl,
  imageRemoved = false,
  shakeAnimation,
}) => {
  const { t } = useTranslation();
  const { user, profile, initialLoading } = useAuth();
  const haptics = useHaptics();

  const shake = shakeAnimation || useRef(new Animated.Value(0)).current;

  // Handle photo selection from device gallery
  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      // Handle permission denied
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onChoosePhoto?.(result.assets[0].uri);
    }
  };

  // Save profile changes
  const handleSave = () => {
    onSave?.();
  };

  // Cancel editing and reset state
  const handleCancel = () => {
    onCancel?.();
  };

  // Handle avatar press (opens image modal in collapsed state)
  const handleAvatarPress = () => {
    if (!isExpanded && profileImageUrl) {
      onAvatarPress?.();
    }
  };

  // Toggle expanded/collapsed state
  const handleToggleExpanded = () => {
    onToggleExpanded?.();
  };

  return (
    <>
      <ProfileCard style={theme.shadows.modal} isExpanded={isExpanded}>
        {isExpanded ? (
          <>
            <ExpandedProfileHeader>
              <ExpandedProfileTitle>
                {t("profile.editProfile")}
              </ExpandedProfileTitle>
              <ExpandedProfileCloseButton
                onPress={() => {
                  haptics.heavy();
                  handleCancel();
                }}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={colors.text.primary}
                />
              </ExpandedProfileCloseButton>
            </ExpandedProfileHeader>

            <AvatarTouchable
              onPress={() => {
                if (!uploading) {
                  haptics.heavy();
                  handleChoosePhoto();
                }
              }}
              disabled={uploading}
            >
              <ExpandedAvatarWrapper>
                {uploading ? (
                  <ActivityIndicator size="large" color={colors.white} />
                ) : tempImageUri ? (
                  <ExpandedAvatarImage source={{ uri: tempImageUri }} />
                ) : profileImageUrl && !imageRemoved ? (
                  <ExpandedAvatarImage source={{ uri: profileImageUrl }} />
                ) : (
                  <ExpandedAvatarPlaceholder>
                    <ExpandedAvatarPlaceholderText>
                      {user?.email?.[0]?.toUpperCase() || "?"}
                    </ExpandedAvatarPlaceholderText>
                  </ExpandedAvatarPlaceholder>
                )}
                {/* Show remove button only when there's an image to remove and user hasn't clicked remove yet */}
                {(tempImageUri || profileImageUrl) && !imageRemoved && (
                  <RemoveImageButton
                    onPress={() => {
                      if (!uploading) {
                        haptics.heavy();
                        onRemoveImage?.();
                      }
                    }}
                    disabled={uploading}
                  >
                    <MaterialIcons
                      name="close"
                      size={24}
                      color={colors.white}
                    />
                  </RemoveImageButton>
                )}
              </ExpandedAvatarWrapper>
            </AvatarTouchable>

            <EditLabel>{t("auth.nickname")}</EditLabel>
            <Animated.View style={{ transform: [{ translateX: shake }] }}>
              <EditInput
                value={editedNickname}
                onChangeText={onNicknameChange}
                placeholder={t("auth.nickname")}
                placeholderTextColor={colors.text.primary}
                editable={!uploading}
                onFocus={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                }
              />
            </Animated.View>

            <EmailTouchable
              onPress={() => {
                haptics.heavy();
                onEmailPress?.();
              }}
            >
              <EmailText
                style={{
                  fontSize: user?.email && user.email.length > 20 ? 14 : 16,
                }}
              >
                {user?.email || ""}
              </EmailText>
            </EmailTouchable>

            <StyledButton
              title={uploading ? t("common.loading") : t("common.save")}
              onPress={handleSave}
              disabled={uploading}
              loading={uploading}
              loadingText={t("common.saving")}
              style={{ marginTop: 16, marginBottom: 0 }}
            />
          </>
        ) : (
          <CollapsedProfileContent>
            <CollapsedProfileTop>
              <NicknameContainer>
                <Nickname style={{ marginBottom: 0 }}>
                  {profile?.displayName ||
                    user?.displayName ||
                    t("auth.nickname")}
                </Nickname>
                {variant === "user" &&
                  typeof profile?.points === "number" &&
                  profile.points > 0 && (
                    <PointsText>{profile.points}</PointsText>
                  )}
              </NicknameContainer>
              <AvatarTouchable
                onPress={() => {
                  if (!uploading) {
                    haptics.heavy();
                    handleAvatarPress();
                  }
                }}
                disabled={uploading}
              >
                <AvatarWrapper>
                  {uploading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : profileImageUrl ? (
                    <AvatarImage source={{ uri: profileImageUrl }} />
                  ) : (
                    <AvatarPlaceholder>
                      <AvatarPlaceholderText>
                        {user?.email?.[0]?.toUpperCase() || "?"}
                      </AvatarPlaceholderText>
                    </AvatarPlaceholder>
                  )}
                </AvatarWrapper>
              </AvatarTouchable>
            </CollapsedProfileTop>
            <StyledButton
              title={t("profile.editProfile")}
              onPress={handleToggleExpanded}
              variant="secondary"
              style={{ marginBottom: 0 }}
            />
          </CollapsedProfileContent>
        )}
      </ProfileCard>
    </>
  );
};

export default EditProfile;
