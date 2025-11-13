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
import { useTranslation } from "../../../hooks/useTranslation";
import { useHaptics } from "../../../context/HapticsContext";
import colors from "../../../theme/colors";
import spacing from "../../../theme/spacing";

// Styled components for the instruction toggle
const InstructionToggle = styled.TouchableOpacity({
  marginBottom: spacing.L,
});

const InstructionToggleText = styled.Text({
  color: colors.primary,
  fontWeight: "bold",
  textAlign: "center",
  fontSize: 16,
});

const InstructionToggleContent = styled.View({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.XS,
});

// Styled components for the instructions display
const InstructionsContainer = styled.View({
  width: "100%",
  backgroundColor: colors.background.primary,
  borderRadius: 16,
  paddingVertical: spacing.M,
  paddingHorizontal: spacing.S,
  gap: spacing.M,
  marginBottom: spacing.XL,
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
});

const InstructionText = styled.Text({
  flex: 1,
  color: colors.text.primary,
  fontSize: 14,
  lineHeight: "20px",
});

const PrimaryBoldText = styled.Text({
  color: colors.primary,
  fontWeight: "bold",
});

interface ReportInstructionsProps {
  showInstructions: boolean;
  onToggleInstructions: () => void;
}

export const ReportInstructions: React.FC<ReportInstructionsProps> = ({
  showInstructions,
  onToggleInstructions,
}) => {
  const { t } = useTranslation();
  const haptics = useHaptics();

  const handleToggle = () => {
    haptics.heavy();
    onToggleInstructions();
  };

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
