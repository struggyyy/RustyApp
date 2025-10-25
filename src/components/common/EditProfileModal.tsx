import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, TextInput, StyleSheet, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import colors from '../../theme/colors';
import CustomAlert from './CustomAlert';

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

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  uploading: boolean;
  editedNickname: string;
  setEditedNickname: (nickname: string) => void;
  tempImageUri: string | null;
  profileImageUrl: string | null;
  userEmail: string | null;
  onChoosePhoto: () => void;
}

// Styled Components
const ModalOverlay = styled.View({
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
});

const ModalContent = styled.View({
  backgroundColor: colors.componentBackground,
  borderRadius: 24,
  padding: 20,
  width: '90%',
  maxWidth: 400,
});

const ModalHeader = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
});

const ModalTitle = styled.Text({
  fontSize: 20,
  fontWeight: 'bold',
  color: colors.text.primary,
});

const ModalCloseButton = styled.TouchableOpacity({
  padding: 8,
});

const EditInput = styled.TextInput`
  background-color: ${colors.white};
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px;
  color: ${colors.text.primary};
  margin-bottom: 4px;
  border: 1px solid ${colors.componentBackground};
`;

const EditLabel = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${colors.text.primary};
  margin-bottom: 8px;
  margin-top: 8px;
`;

const EmailText = styled.Text`
  font-size: 16px;
  color: ${colors.text.secondary};
  text-align: center;
`;

const EmailTouchable = styled.TouchableOpacity`
  margin-top: 12px;
  margin-bottom: 12px;
`;

const AvatarTouchable = styled.TouchableOpacity``;

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

const ActionButton = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' }>((props: { variant?: 'primary' | 'secondary' }) => ({
  backgroundColor: props.variant === 'primary' ? colors.primary : colors.text.secondary,
  padding: 14,
  borderRadius: 20,
  alignItems: 'center',
  minHeight: 50,
}));

const ActionButtonText = styled.Text<{ variant?: 'primary' | 'secondary' }>((props: { variant?: 'primary' | 'secondary' }) => ({
  color: props.variant === 'primary' ? colors.white : colors.white,
  fontWeight: 'bold',
  fontSize: 14,
}));

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  onSave,
  uploading,
  editedNickname,
  setEditedNickname,
  tempImageUri,
  profileImageUrl,
  userEmail,
  onChoosePhoto,
}) => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
  }>({ title: '', buttons: [] });

  const [initialNickname, setInitialNickname] = useState('');
  const [initialImageUri, setInitialImageUri] = useState<string | null>(null);

  // Track initial values when modal opens
  useEffect(() => {
    if (visible) {
      setInitialNickname(editedNickname);
      setInitialImageUri(tempImageUri);
    }
  }, [visible]); // Only depend on visible, not on the values themselves

  const showAlert = (title: string, message?: string, buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }> = [{ text: 'OK' }]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const handleEmailPress = () => {
    showAlert('Email Information', 'Your email address cannot be changed as it is used for account verification and security purposes.');
  };

  const handleSave = () => {
    // Check if any changes were made
    const nicknameChanged = editedNickname !== initialNickname;
    const imageChanged = tempImageUri !== initialImageUri;

    console.log('Save check:', {
      editedNickname,
      initialNickname,
      nicknameChanged,
      tempImageUri,
      initialImageUri,
      imageChanged
    });

    if (!nicknameChanged && !imageChanged) {
      // No changes made, just close the modal
      console.log('No changes detected, closing modal');
      onClose();
      return;
    }

    // Changes were made, proceed with save
    console.log('Changes detected, proceeding with save');
    onSave();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <ModalOverlay>
          <ModalContent style={shadowStyles.modalShadow}>
          <ModalHeader>
            <ModalTitle>Edit Profile</ModalTitle>
            <ModalCloseButton onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text.primary} />
            </ModalCloseButton>
          </ModalHeader>

          <AvatarTouchable onPress={onChoosePhoto} disabled={uploading}>
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
                    {userEmail?.[0]?.toUpperCase() || "?"}
                  </ExpandedAvatarPlaceholderText>
                </ExpandedAvatarPlaceholder>
              )}
              <EditIconButton onPress={onChoosePhoto} disabled={uploading}>
                <MaterialIcons name="edit" size={20} color={colors.primary} />
              </EditIconButton>
            </ExpandedAvatarWrapper>
          </AvatarTouchable>

          <EditLabel>Nickname</EditLabel>
          <EditInput
            value={editedNickname}
            onChangeText={setEditedNickname}
            placeholder="Enter your nickname"
            placeholderTextColor={colors.text.secondary}
          />

          <EmailTouchable onPress={handleEmailPress}>
            <EmailText style={{
              fontSize: userEmail && userEmail.length > 20 ? 14 : 16
            }}>
              {userEmail || ""}
            </EmailText>
          </EmailTouchable>

          <View style={{ marginTop: 16, paddingHorizontal: 0 }}>
            <ActionButton variant="primary" onPress={handleSave} disabled={uploading}>
              <ActionButtonText variant="primary">
                {uploading ? "Saving..." : "Save"}
              </ActionButtonText>
            </ActionButton>
          </View>
        </ModalContent>
      </ModalOverlay>
    </Modal>

    <CustomAlert
      visible={alertVisible}
      title={alertConfig.title}
      message={alertConfig.message}
      buttons={alertConfig.buttons}
      onRequestClose={hideAlert}
    />
  </>
  );
};

export default EditProfileModal;
