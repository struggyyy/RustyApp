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
import { FontAwesome } from "@expo/vector-icons";
import styled from "styled-components/native";

// Internal imports
import { colors, typography, spacing, shadows } from "@theme/index";
import { Report } from "@/shared/types/reports";
import HapticButton from "@/components/common/buttons/HapticButton";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { getStatusTranslationKey } from "@/shared/utils/statusTranslation";

// Component props and types
interface ReportCardProps {
  report: Report;
  isAdmin: boolean;
  onDetailsPress?: (report: Report) => void;
}

interface CardContainerProps {
  isExpanded: boolean;
}

// Styled components for card layout
const CardContainer = styled.View<CardContainerProps>(
  (props: CardContainerProps) => ({
    backgroundColor: colors.white,
    borderRadius: spacing.radius.L,
    padding: spacing.layout.cardPadding,
    marginBottom: spacing.M,
    flexDirection: props.isExpanded ? "column" : "row",
    alignItems: props.isExpanded ? "stretch" : "center",
  })
);

const ReportInfo = styled.View({
  flex: 1,
});

interface StatusTextProps {
  color: string;
}

const ReportDate = styled.Text<StatusTextProps>((props: StatusTextProps) => ({
  fontSize: typography.fontSize.h5,
  fontWeight: "bold",
  color: props.color,
  marginBottom: spacing.S,
}));

const ReportStatusText = styled.Text<StatusTextProps>(
  (props: StatusTextProps) => ({
    fontSize: typography.fontSize.h6,
    color: props.color,
    marginBottom: spacing.M,
  })
);

const CarImageContainer = styled.View({
  marginLeft: spacing.M,
  alignItems: "center",
});

const CollapsedCarImage = styled.Image({
  width: 80,
  height: 80,
  borderRadius: spacing.radius.XXL,
});

const PointsText = styled.Text<StatusTextProps>((props: StatusTextProps) => ({
  fontSize: typography.fontSize.body2,
  fontWeight: "bold",
  color: props.color,
  marginTop: spacing.S,
}));

const StatusIndicatorText = styled.Text<StatusTextProps>(
  (props: StatusTextProps) => ({
    fontSize: typography.fontSize.h3,
    fontWeight: "bold",
    color: props.color,
    marginTop: spacing.S,
  })
);

// Button text component
const DetailsButtonText = styled.Text({
  color: colors.white,
  fontWeight: "bold",
  fontSize: typography.fontSize.caption,
});

// Helper functions
const formatDate = (date: Date): string => {
  return `${String(date.getDate()).padStart(2, "0")}.${String(
    date.getMonth() + 1
  ).padStart(2, "0")}.${date.getFullYear()}`;
};

// Main report card component
const ReportCard: React.FC<ReportCardProps> = ({
  report,
  isAdmin,
  onDetailsPress,
}) => {
  const { t } = useTranslation();
  const statusColor = colors.getStatusColor(report.status);

  // Render collapsed card view
  return (
    <>
      <CardContainer style={shadows.card} isExpanded={false}>
        <ReportInfo>
          <ReportDate color={statusColor}>
            {formatDate(report.createdAt.toDate())}
          </ReportDate>
          <ReportStatusText color={statusColor}>
            {t(getStatusTranslationKey(report.status))}
          </ReportStatusText>
          <HapticButton
            onPress={() => onDetailsPress?.(report)}
            style={{
              backgroundColor: colors.text.primary,
              paddingVertical: spacing.component.buttonPadding,
              paddingHorizontal: spacing.XL,
              borderRadius: spacing.radius.L,
              alignItems: "center",
              minWidth: 140,
            }}
          >
            <DetailsButtonText>{t("common.seeDetails")}</DetailsButtonText>
          </HapticButton>
        </ReportInfo>
        <CarImageContainer>
          <CollapsedCarImage source={{ uri: report.imageUrl }} />
          {!isAdmin &&
            (() => {
              const statusStr = report.status as string;
              switch (statusStr) {
                case "Submitted":
                  return (
                    <StatusIndicatorText color={statusColor}>
                      ...
                    </StatusIndicatorText>
                  );
                case "Canceled":
                  return (
                    <FontAwesome
                      name="times-circle"
                      size={24}
                      color={statusColor}
                      style={{ marginTop: spacing.S }}
                    />
                  );
                default:
                  return (
                    <PointsText
                      color={statusColor}
                    >{`${report.points}p`}</PointsText>
                  );
              }
            })()}
        </CarImageContainer>
      </CardContainer>
    </>
  );
};

export default ReportCard;
