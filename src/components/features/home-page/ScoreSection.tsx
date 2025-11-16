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

// External libraries
import { View } from "react-native";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import colors from "@/core/theme/colors";
import spacing from "@/core/theme/spacing";
import typography from "@/core/theme/typography";
import styled from "styled-components/native";
import TouchableButton from "@/components/common/buttons/TouchableButton";

const ScoreSectionContainer = styled.View({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.M,
});

const ScoreLabelText = styled.Text({
  fontSize: typography.fontSize.caption,
  color: colors.text.primary,
  fontWeight: "500",
});

const ScoreValueText = styled.Text({
  fontSize: typography.fontSize.h3,
  fontWeight: "bold",
  color: colors.primary,
});

const ProfileButtonView = styled.View({
  width: spacing.component.fabSize,
  height: spacing.component.fabSize,
  borderRadius: spacing.component.fabSize / 2,
  backgroundColor: colors.background.secondary,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: spacing.XS,
  borderColor: colors.primary,
});

const ProfileUserImage = styled.Image({
  width: "100%",
  height: "100%",
  borderRadius: spacing.component.fabSize / 2,
});

const ProfileImagePlaceholder = styled.View({
  width: "100%",
  height: "100%",
  borderRadius: spacing.component.fabSize / 2,
  backgroundColor: colors.background.secondary,
  justifyContent: "center",
  alignItems: "center",
});

const ProfileImagePlaceholderText = styled.Text({
  color: colors.white,
  fontSize: typography.fontSize.h4,
  fontWeight: "bold",
});

interface ScoreSectionProps {
  onProfilePress: () => void;
}

// Display user's score and profile button in the home screen header
export function ScoreSection({ onProfilePress }: ScoreSectionProps) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [imageKey, setImageKey] = useState(0);

  // Force image reload when profile image URL changes
  useEffect(() => {
    setImageKey((prev) => prev + 1);
  }, [profile?.profileImage]);

  return (
    <ScoreSectionContainer>
      <View>
        <ScoreLabelText>{t("home.yourScore")}</ScoreLabelText>
        <ScoreValueText>{profile?.points ?? 0}</ScoreValueText>
      </View>
      <TouchableButton
        onPress={onProfilePress}
        disabled={!user}
        style={{ alignItems: "center" }}
      >
        <ProfileButtonView>
          {profile?.profileImage ? (
            <ProfileUserImage
              key={imageKey}
              source={{ uri: profile.profileImage }}
            />
          ) : (
            <ProfileImagePlaceholder>
              <ProfileImagePlaceholderText>
                {user?.email?.[0]?.toUpperCase() || "?"}
              </ProfileImagePlaceholderText>
            </ProfileImagePlaceholder>
          )}
        </ProfileButtonView>
      </TouchableButton>
    </ScoreSectionContainer>
  );
}
