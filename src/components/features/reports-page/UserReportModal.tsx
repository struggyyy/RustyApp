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
import { View, ScrollView, Image, StyleSheet, Text } from "react-native";

// External libraries
import { MaterialIcons } from "@expo/vector-icons";

// Internal project imports
import { useTranslation } from "../../../shared/hooks/common/useTranslation";
import { useAlert } from '../../../core/context/AlertContext';
import IconButton from "../../common/buttons/IconButton";
import theme from "../../../core/theme";
import { Report } from "../../../shared/types/reports";
import {
  getStatusTranslationKey,
  getStatusNoteTranslationKey,
} from "../../../shared/utils/statusTranslation";

const styles = StyleSheet.create({
  container: {
    maxHeight: "100%",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  closeButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  reportDate: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  expandedCarImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  detailLabel: {
    fontWeight: "bold",
    color: theme.colors.text.primary,
    fontSize: 16,
  },
  detailText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  statusNote: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
    marginBottom: 16,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 16,
  },
  pointsSection: {
    marginBottom: 8,
  },
});

// Helper functions
const formatDate = (date: Date): string => {
  return `${String(date.getDate()).padStart(2, "0")}.${String(
    date.getMonth() + 1
  ).padStart(2, "0")}.${date.getFullYear()}`;
};

interface UserReportModalProps {
  report: Report;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const UserReportModal: React.FC<UserReportModalProps> = ({
  report,
  onClose,
  onDelete,
}) => {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const statusColor = theme.colors.getStatusColor(report.status);

  const handleDeletePress = () => {
    showAlert(t("reports.deleteReport"), t("reports.deleteReportConfirm"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await onDelete(report.id);
            onClose(); // Close the modal first
            // Show success message
            setTimeout(() => {
              showAlert(t("common.success"), t("reports.deleteReportSuccess"), [
                { text: t("common.ok") },
              ]);
            }, 300);
          } catch (error) {
            showAlert(t("common.error"), t("reports.deleteReportError"), [
              { text: t("common.ok") },
            ]);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{t("reports.reportDetails")}</Text>
        <View style={styles.headerActions}>
          <IconButton
            onPress={handleDeletePress}
            size={40}
            backgroundColor="transparent"
            color={theme.colors.primary}
          >
            <MaterialIcons
              name="delete"
              size={24}
              color={theme.colors.primary}
            />
          </IconButton>
          <IconButton onPress={onClose} size={40} backgroundColor="transparent">
            <MaterialIcons
              name="close"
              size={24}
              color={theme.colors.text.primary}
            />
          </IconButton>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.reportDate, { color: statusColor }]}>
          {formatDate(report.createdAt.toDate())}
        </Text>
        <Image
          style={styles.expandedCarImage}
          source={{ uri: report.imageUrl }}
        />

        <View style={styles.section}>
          <Text style={styles.detailLabel}>{t("reports.description")}</Text>
          <Text style={styles.detailText}>{report.description}</Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.detailText,
              { fontWeight: "bold", color: statusColor },
            ]}
          >
            {t(getStatusTranslationKey(report.status))}
          </Text>
          <Text style={styles.statusNote}>
            {t(getStatusNoteTranslationKey(report.status))}
          </Text>
        </View>

        <View style={styles.pointsSection}>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>{t("reports.points")}: </Text>
            {report.points}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default UserReportModal;
