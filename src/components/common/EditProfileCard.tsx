import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import colors from '../../theme/colors';
import CustomAlert from './CustomAlert';

// Shadow styles using StyleSheet to avoid styled-components issues
const shadowStyles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
});

interface EditProfileCardProps {
  isExpanded: boolean;
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
const CardContainer = styled.View<{ isExpanded: boolean }>(
  (props: { isExpanded: boolean }) => ({
    backgroundColor: colors.componentBackground,
    borderRadius: 24,
    padding: 20,
    marginBottom: 15,
    flexDirection: props.isExpanded ? 'column' : 'row',
    alignItems: props.isExpanded ? 'stretch' : 'center',
  })
);

const CollapsedContent = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const CollapsedText = styled.Text({
  fontSize: 16,
  color: colors.text.secondary,
  fontWeight: '500',
});

const ExpandButton = styled.TouchableOpacity({
  padding: 8,
});

const CardHeader = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
});

const CardTitle = styled.Text({
  fontSize: 20,
  fontWeight: 'bold',
  color: colors.text.primary,
});

const CloseButton = styled.TouchableOpacity({
  padding: 8,
});

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

const EmailText = styled.Text`
  font-size: 16px;
  color: ${colors.text.secondary};
  text-align: center;
`;

const EmailTouchable = styled.TouchableOpacity`
  margin-top: 12px;
  margin-bottom: 12px;
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

const ActionButtonsContainer = styled.View({
  flexDirection: 'row',
  gap: 12,
  marginTop: 16,
});

const ActionButtonFlex = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' }>((props: { variant?: 'primary' | 'secondary' }) => ({
  flex: 1,
  backgroundColor: props.variant === 'primary' ? colors.primary : colors.text.secondary,
  padding: 14,
  borderRadius: 20,
  alignItems: 'center',
  minHeight: 50,
}));

const EditProfileCard: React.FC<EditProfileCardProps> = ({
  isExpanded,
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

  // Track initial values when card expands
  useEffect(() => {
    if (isExpanded) {
      setInitialNickname(editedNickname);
      setInitialImageUri(tempImageUri);
    }
  }, [isExpanded]);

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

    if (!nicknameChanged && !imageChanged) {
      // No changes made, just close the card
      onClose();
      return;
    }

    // Changes were made, proceed with save
    onSave();
  };

  const handleCancel = () => {
    // Reset values to initial state
    setEditedNickname(initialNickname);
    onClose();
  };

  if (uploading && isExpanded) {
    return (
      <CardContainer style={shadowStyles.cardShadow} isExpanded={true}>
        <ActivityIndicator size="large" color={colors.primary} />
      </CardContainer>
    );
  }

  return (
    <>
      <CardContainer style={shadowStyles.cardShadow} isExpanded={isExpanded}>
        {isExpanded ? (
          <>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CloseButton onPress={handleCancel}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </CloseButton>
            </CardHeader>

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
              editable={!uploading}
            />

            <EmailTouchable onPress={handleEmailPress}>
              <EmailText style={{
                fontSize: userEmail && userEmail.length > 20 ? 14 : 16
              }}>
                {userEmail || ""}
              </EmailText>
            </EmailTouchable>

            <ActionButtonsContainer>
              <ActionButtonFlex variant="secondary" onPress={handleCancel} disabled={uploading}>
                <ActionButtonText variant="secondary">Cancel</ActionButtonText>
              </ActionButtonFlex>
              <ActionButtonFlex variant="primary" onPress={handleSave} disabled={uploading}>
                <ActionButtonText variant="primary">
                  {uploading ? "Saving..." : "Save"}
                </ActionButtonText>
              </ActionButtonFlex>
            </ActionButtonsContainer>
          </>
        ) : (
          <CollapsedContent>
            <CollapsedText>Click to edit your profile</CollapsedText>
            <ExpandButton>
              <MaterialIcons name="expand-more" size={24} color={colors.text.secondary} />
            </ExpandButton>
          </CollapsedContent>
        )}
      </CardContainer>

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

export default EditProfileCard;
