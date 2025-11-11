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
import React from "react";

// External libraries
import { Ionicons } from "@expo/vector-icons";
import styled from "styled-components/native";

// Internal imports
import { useTranslation } from "../../../hooks/useTranslation";
import colors from "../../../theme/colors";
import spacing from "../../../theme/spacing";
import StyledButton from "../../common/buttons/StyledButton";
import TouchableButton from "../../common/buttons/TouchableButton";

// Styled components
const ImagePreviewContainer = styled.View({
  width: "100%",
  aspectRatio: 1.34,
  marginBottom: spacing.lg,
  borderRadius: spacing.radius.lg,
  backgroundColor: colors.background.secondary,
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
});

const ImagePreview = styled.Image({
  width: "100%",
  height: "100%",
});

const ImageOverlayActions = styled.View({
  position: "absolute",
  top: spacing.sm,
  right: spacing.sm,
  flexDirection: "row",
  zIndex: 10,
});

const ButtonRow = styled.View({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  marginBottom: spacing.lg,
});

// Component props interface
interface ImagePickerSectionProps {
  imageUri: string | null;
  isKeyboardVisible: boolean;
  onPickImage: (useCamera: boolean) => void;
  onRemoveImage: () => void;
}

export const ImagePickerSection: React.FC<ImagePickerSectionProps> = ({
  imageUri,
  isKeyboardVisible,
  onPickImage,
  onRemoveImage,
}) => {
  const { t } = useTranslation();

  // Image preview with overlay actions
  if (imageUri) {
    return !isKeyboardVisible ? (
      <ImagePreviewContainer>
        <ImagePreview source={{ uri: imageUri }} />
        <ImageOverlayActions>
          <TouchableButton
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderRadius: spacing.radius.lg,
              padding: spacing.xs,
              marginLeft: spacing.sm,
            }}
            onPress={onRemoveImage}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableButton>
        </ImageOverlayActions>
      </ImagePreviewContainer>
    ) : null;
  }

  // Image picker buttons
  return (
    <ButtonRow>
      <StyledButton
        title={t("reports.takePhoto")}
        onPress={() => onPickImage(true)}
        variant="secondary"
        style={{ flex: 1, marginRight: 10, marginBottom: 0 }}
      />
      <TouchableButton
        style={{
          backgroundColor: colors.secondaryLight,
          width: 60,
          height: 60,
          borderRadius: 30,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.23,
          shadowRadius: 2.62,
          elevation: 4,
        }}
        onPress={() => onPickImage(false)}
      >
        <Ionicons name="image-outline" size={24} color={colors.text.primary} />
      </TouchableButton>
    </ButtonRow>
  );
};
