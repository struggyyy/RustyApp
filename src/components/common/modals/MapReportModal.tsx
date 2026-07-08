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
import { Modal, StyleSheet, View, Text, Image } from "react-native";

// External libraries
import { MaterialIcons } from "@expo/vector-icons";

// Internal imports
import { Report } from "@/shared/types/reports";
import { getStatusColor } from "@theme/colors";
import theme from "@theme/index";
import IconButton from "@components/common/buttons/IconButton";
import HapticButton from "@/components/common/buttons/HapticButton";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { formatDate } from "@/shared/utils/dateUtils";

interface MapReportModalProps {
  visible: boolean;
  report: Report | null;
  onClose: () => void;
  onNavigate?: () => void;
  onViewReport?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasMultiple?: boolean;
}

// Report modal styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.background.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.M,
  },
  content: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.radius.XL,
    padding: theme.spacing.M,
    width: "90%",
    maxWidth: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.XS,
  },
  title: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  dateText: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.S,
    textAlign: "left",
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: theme.spacing.radius.L,
    marginBottom: theme.spacing.S,
  },
  navigationView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.S,
  },
  actionButtons: {
    flexDirection: "row",
    gap: theme.spacing.S,
    marginTop: theme.spacing.S,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.text.primary,
    padding: theme.spacing.component.buttonPadding,
    borderRadius: theme.spacing.radius.L,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.S,
  },
  navigateButton: {
    backgroundColor: theme.colors.navigation,
  },
  actionButtonText: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: "bold",
    color: theme.colors.white,
  },
});

// Report modal component for viewing report details
const MapReportModal: React.FC<MapReportModalProps> = ({
  visible,
  report,
  onClose,
  onNavigate,
  onViewReport,
  onPrev,
  onNext,
  hasMultiple,
}) => {
  const { t } = useTranslation();
  if (!report) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, theme.shadows.modal]}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("reports.reportDetails")}</Text>
            <IconButton
              onPress={onClose}
              size={40}
              backgroundColor="transparent"
            >
              <MaterialIcons
                name="close"
                size={24}
                color={theme.colors.text.primary}
              />
            </IconButton>
          </View>

          <Text
            style={[styles.dateText, { color: getStatusColor(report.status) }]}
          >
            {formatDate(report.createdAt.toDate())}
          </Text>

          <Image
            source={{ uri: report.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />

          {hasMultiple && (
            <View style={styles.navigationView}>
              <IconButton
                onPress={onPrev || (() => {})}
                size={40}
                backgroundColor="transparent"
              >
                <MaterialIcons
                  name="chevron-left"
                  size={30}
                  color={theme.colors.text.primary}
                />
              </IconButton>
              <IconButton
                onPress={onNext || (() => {})}
                size={40}
                backgroundColor="transparent"
              >
                <MaterialIcons
                  name="chevron-right"
                  size={30}
                  color={theme.colors.text.primary}
                />
              </IconButton>
            </View>
          )}

          <View style={styles.actionButtons}>
            {onViewReport && (
              <HapticButton onPress={onViewReport} style={styles.actionButton}>
                <Text style={styles.actionButtonText}>{t("common.more")}</Text>
              </HapticButton>
            )}
            {onNavigate && (
              <HapticButton
                onPress={onNavigate}
                style={[styles.actionButton, styles.navigateButton]}
              >
                <MaterialIcons
                  name="navigation"
                  size={20}
                  color={theme.colors.white}
                />
                <Text style={styles.actionButtonText}>
                  {t("common.navigate")}
                </Text>
              </HapticButton>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MapReportModal;
