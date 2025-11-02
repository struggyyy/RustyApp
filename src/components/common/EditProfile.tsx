import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Modal,
  StyleSheet,
  Switch,
  Animated,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useHaptics } from "../../context/HapticsContext";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import styled from "styled-components/native";
import StyledButton from "../common/StyledButton";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import colors from "../../theme/colors";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../../services/firebase";
import CustomAlert from "../common/CustomAlert";

// Shadow styles using StyleSheet to avoid styled-components issues
const shadowStyles = StyleSheet.create({
  modalShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
});

// --- STYLED COMPONENTS ---
const Container = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 0, // Adjust the bottom padding to modify the amount of "bounce effect" on the bottom of the screen
  },
  showsVerticalScrollIndicator: false, // Hide the vertical scroll indicator
})({
  flex: 1,
  backgroundColor: colors.white,
});

const ProfileCard = styled.View<{ isExpanded: boolean }>(
  (props: { isExpanded: boolean }) => ({
    backgroundColor: colors.componentBackground,
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    flexDirection: props.isExpanded ? 'column' : 'row',
    alignItems: props.isExpanded ? 'stretch' : 'center',
  })
);

const CollapsedProfileContent = styled.View`
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  flex: 1;
  gap: 12px;
`;

const CollapsedProfileTop = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const ExpandedProfileHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ExpandedProfileTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${colors.text.primary};
`;

const ExpandedProfileCloseButton = styled.TouchableOpacity`
  padding: 8px;
`;

const ExpandedAvatarWrapper = styled.View`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: #eee;
  justify-content: center;
  align-items: center;
  border: 5px solid ${colors.primary};
  align-self: center;
  margin-bottom: 4px;
`;

const ExpandedAvatarImage = styled.Image`
  width: 100%;
  height: 100%;
  border-radius: 60px;
`;

const ExpandedAvatarPlaceholder = styled.View`
  width: 100%;
  height: 100%;
  border-radius: 60px;
  background-color: #ccc;
  justify-content: center;
  align-items: center;
`;

const ExpandedAvatarPlaceholderText = styled.Text`
  font-size: 40px;
  color: #fff;
  font-weight: bold;
`;

const EditIconButton = styled.TouchableOpacity`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: ${colors.white};
  width: 40px;
  height: 40px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  z-index: 5;
  border: 4px solid #BD5151;
`;

const EditLabel = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${colors.text.primary};
  margin-bottom: 8px;
  margin-top: 8px;
`;

const EditInput = styled.TextInput`
  background-color: ${colors.white};
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px;
  color: ${colors.text.primary};
  margin-bottom: 4px;
  border: 1px solid ${colors.componentBackground};
`;

const EmailTouchable = styled.TouchableOpacity`
  margin-top: 12px;
  margin-bottom: 12px;
`;

const EmailText = styled.Text`
  font-size: 16px;
  color: ${colors.text.secondary};
  text-align: center;
`;

const PointsText = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${colors.text.secondary};
  margin-top: 2px;
`;

const NicknameContainer = styled.View`
  align-items: flex-start;
  justify-content: center;
`;

const AvatarTouchable = styled.TouchableOpacity``;

const AvatarWrapper = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: #eee;
  justify-content: center;
  align-items: center;
  border: 5px solid ${colors.primary};
  position: relative;
`;

const AvatarImage = styled.Image`
  width: 100%;
  height: 100%;
  border-radius: 40px;
`;

const AvatarPlaceholder = styled.View`
  width: 100%;
  height: 100%;
  border-radius: 40px;
  background-color: #ccc;
  justify-content: center;
  align-items: center;
`;

const AvatarPlaceholderText = styled.Text`
  font-size: 30px;
  color: #fff;
  font-weight: bold;
`;

const Nickname = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${colors.primary};
  margin-bottom: 4px;
`;

const ModalOverlay = styled.View({
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
});

const ModalContent = styled.View({
  backgroundColor: colors.white,
  borderRadius: 24,
  padding: 24,
  width: '90%',
  maxWidth: 400,
});

const ModalHeader = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
});

const ModalTitle = styled.Text({
  fontSize: 20,
  fontWeight: 'bold',
  color: colors.text.primary,
});

const ModalCloseButton = styled.TouchableOpacity({
  padding: 8,
});

const ModalImage = styled.Image({
  width: '100%',
  height: 300,
  borderRadius: 16,
  marginBottom: 16,
});

interface EditProfileProps {
  variant: 'admin' | 'user';
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  onAvatarPress?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onChoosePhoto?: (uri: string) => void;
  onEmailPress?: () => void;
  uploading?: boolean;
  tempImageUri?: string | null;
  editedNickname?: string;
  onNicknameChange?: (text: string) => void;
  showImageModal?: boolean;
  onCloseImageModal?: () => void;
  profileImageUrl?: string | null;
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
  onEmailPress,
  uploading = false,
  tempImageUri,
  editedNickname = '',
  onNicknameChange,
  showImageModal = false,
  onCloseImageModal,
  profileImageUrl,
  shakeAnimation,
}) => {
  const { user, profile, initialLoading } = useAuth();
  const haptics = useHaptics();

  const shake = shakeAnimation || useRef(new Animated.Value(0)).current;

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

  const handleSave = () => {
    onSave?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const handleAvatarPress = () => {
    if (!isExpanded && profileImageUrl) {
      onAvatarPress?.();
    }
  };

  const handleToggleExpanded = () => {
    onToggleExpanded?.();
  };

  return (
    <>
      <ProfileCard style={shadowStyles.modalShadow} isExpanded={isExpanded}>
        {isExpanded ? (
          <>
            <ExpandedProfileHeader>
              <ExpandedProfileTitle>Edit Profile</ExpandedProfileTitle>
              <ExpandedProfileCloseButton onPress={() => { haptics.light(); handleCancel(); }}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </ExpandedProfileCloseButton>
            </ExpandedProfileHeader>

            <AvatarTouchable onPress={() => { if (!uploading) { haptics.light(); handleChoosePhoto(); } }} disabled={uploading}>
              <ExpandedAvatarWrapper>
                {uploading ? (
                  <ActivityIndicator size="large" color="#fff" />
                ) : tempImageUri ? (
                  <ExpandedAvatarImage source={{ uri: tempImageUri }} />
                ) : profileImageUrl ? (
                  <ExpandedAvatarImage source={{ uri: profileImageUrl }} />
                ) : (
                  <ExpandedAvatarPlaceholder>
                    <ExpandedAvatarPlaceholderText>
                      {user?.email?.[0]?.toUpperCase() || "?"}
                    </ExpandedAvatarPlaceholderText>
                  </ExpandedAvatarPlaceholder>
                )}
                <EditIconButton onPress={() => { if (!uploading) { haptics.light(); handleChoosePhoto(); } }} disabled={uploading}>
                  <MaterialIcons name="edit" size={20} color={colors.primary} />
                </EditIconButton>
              </ExpandedAvatarWrapper>
            </AvatarTouchable>

            <EditLabel>Nickname</EditLabel>
            <Animated.View style={{ transform: [{ translateX: shake }] }}>
              <EditInput
                value={editedNickname}
                onChangeText={onNicknameChange}
                placeholder="Enter your nickname (2-15 characters)"
                placeholderTextColor={colors.text.secondary}
                editable={!uploading}
              />
            </Animated.View>

            <EmailTouchable onPress={() => { haptics.light(); onEmailPress?.(); }}>
              <EmailText style={{
                fontSize: user?.email && user.email.length > 20 ? 14 : 16
              }}>
                {user?.email || ""}
              </EmailText>
            </EmailTouchable>

            <StyledButton
              title={uploading ? "Saving..." : "Save"}
              onPress={handleSave}
              disabled={uploading}
              loading={uploading}
              style={{ marginTop: 16, marginBottom: 0 }}
            />
          </>
        ) : (
          <CollapsedProfileContent>
            <CollapsedProfileTop>
              <NicknameContainer>
                <Nickname style={{ marginBottom: 0 }}>
                  {profile?.displayName || user?.displayName || "Nickname"}
                </Nickname>
                {variant === 'user' && typeof profile?.points === 'number' && profile.points > 0 && (
                  <PointsText>{profile.points}</PointsText>
                )}
              </NicknameContainer>
              <AvatarTouchable
                onPress={() => { if (!uploading) { haptics.light(); handleAvatarPress(); } }}
                disabled={uploading}
              >
                <AvatarWrapper>
                  {uploading ? (
                    <ActivityIndicator size="small" color="#fff" />
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
              title="Edit Profile"
              onPress={handleToggleExpanded}
              variant="secondary"
              style={{ marginBottom: 0 }}
            />
          </CollapsedProfileContent>
        )}
      </ProfileCard>

      <Modal visible={showImageModal} transparent animationType="fade">
        <ModalOverlay>
          <ModalContent style={shadowStyles.modalShadow}>
            <ModalHeader>
              <ModalTitle>Profile Picture</ModalTitle>
              <ModalCloseButton onPress={() => { haptics.light(); onCloseImageModal?.(); }}>
                <Feather name="x" size={24} color={colors.text.primary} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalImage
              source={{ uri: profileImageUrl }}
              resizeMode="contain"
            />
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </>
  );
};

export default EditProfile;
