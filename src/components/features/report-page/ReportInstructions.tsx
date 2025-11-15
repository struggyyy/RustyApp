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
import styled from "styled-components/native";
import { MaterialIcons } from "@expo/vector-icons";

// Internal imports
import { useTranslation } from "../../../shared/hooks/common/useTranslation";
import { useHaptics } from "../../../core/context/HapticsContext";
import colors from "../../../core/theme/colors";
import { typography, spacing } from "../../../core/theme";

// Instruction toggle components for show/hide functionality
const InstructionToggle = styled.TouchableOpacity({
  marginBottom: spacing.L,
});

const InstructionToggleText = styled.Text({
  color: colors.primary,
  fontWeight: "bold",
  textAlign: "center",
  fontSize: typography.fontSize.body1,
});

const InstructionToggleContent = styled.View({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.XS,
});

// Instruction display components for the detailed steps
const InstructionsContainer = styled.View({
  width: "100%",
  backgroundColor: colors.background.primary,
  borderRadius: spacing.radius.L,
  paddingVertical: spacing.M,
  paddingHorizontal: spacing.S,
  gap: spacing.M,
  marginBottom: spacing.L,
});

const InstructionRow = styled.View({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: spacing.M,
});

const NumberBadge = styled.View({
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: colors.primary,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 2,
});

const NumberBadgeText = styled.Text({
  color: colors.white,
  fontWeight: "bold",
  fontSize: typography.fontSize.body2,
});

const InstructionText = styled.Text({
  flex: 1,
  color: colors.text.primary,
  fontSize: typography.fontSize.body1,
  lineHeight: "20px",
});

const PrimaryBoldText = styled.Text({
  color: colors.primary,
  fontWeight: "bold",
});

// Component props interface
interface ReportInstructionsProps {
  showInstructions: boolean;
  onToggleInstructions: () => void;
}

// Interactive instructions component for report creation guidance
export const ReportInstructions: React.FC<ReportInstructionsProps> = ({
  showInstructions,
  onToggleInstructions,
}) => {
  const { t } = useTranslation();
  const haptics = useHaptics();

  // Handle toggle with haptic feedback
  const handleToggle = () => {
    haptics.heavy();
    onToggleInstructions();
  };

  // Render toggle button and conditional instructions display
  return (
    <>
      <InstructionToggle onPress={handleToggle}>
        <InstructionToggleContent>
          <InstructionToggleText>
            {showInstructions
              ? t("reports.hideInstructions")
              : t("reports.showInstructions")}
          </InstructionToggleText>
          <MaterialIcons name="help-outline" size={20} color={colors.primary} />
        </InstructionToggleContent>
      </InstructionToggle>

      {showInstructions && (
        <InstructionsContainer>
          <InstructionRow>
            <NumberBadge>
              <NumberBadgeText>1</NumberBadgeText>
            </NumberBadge>
            <InstructionText>
              {t("reports.instruction.step1Before")}{" "}
              <PrimaryBoldText>
                {t("reports.instruction.takePicture")}
              </PrimaryBoldText>{" "}
              {t("reports.instruction.step1After")}
            </InstructionText>
          </InstructionRow>

          <InstructionRow>
            <NumberBadge>
              <NumberBadgeText>2</NumberBadgeText>
            </NumberBadge>
            <InstructionText>
              {t("reports.instruction.step2Before")}{" "}
              <PrimaryBoldText>
                {t("reports.instruction.description")}
              </PrimaryBoldText>{" "}
              {t("reports.instruction.step2After")}
            </InstructionText>
          </InstructionRow>

          <InstructionRow>
            <NumberBadge>
              <NumberBadgeText>3</NumberBadgeText>
            </NumberBadge>
            <InstructionText>
              {t("reports.instruction.step3Before")}{" "}
              <PrimaryBoldText>{t("reports.instruction.map")}</PrimaryBoldText>{" "}
              {t("reports.instruction.step3Middle")}{" "}
              <PrimaryBoldText>
                {t("reports.instruction.submit")}
              </PrimaryBoldText>{" "}
              {t("reports.instruction.step3After")}
            </InstructionText>
          </InstructionRow>
        </InstructionsContainer>
      )}
    </>
  );
};
