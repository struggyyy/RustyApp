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
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";

// External libraries
import { MaterialIcons } from "@expo/vector-icons";

// Internal imports
import { Report } from "../../../types/reports";
import {
  getStatusTranslationKey,
  getStatusNoteTranslationKey,
  getStatusColor,
} from "../../../utils/statusTranslation";
import colors from "../../../theme/colors";
import IconButton from "../../common/buttons/IconButton";
import { useTranslation } from "../../../hooks/useTranslation";

interface UserReportModalViewProps {
  report: Report;
  onClose: () => void;
  onDelete: (reportId: string) => Promise<void>;
  showAlert: (
    title: string,
    message?: string,
    buttons?: Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }>
  ) => void;
}

// Helper function to format date
const formatDate = (date: Date): string => {
  return `${String(date.getDate()).padStart(2, "0")}.${String(
    date.getMonth() + 1
  ).padStart(2, "0")}.${date.getFullYear()}`;
};

// Styles for report modal
const styles = StyleSheet.create({
  container: {
    maxHeight: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scrollContent: {
    flexGrow: 0,
    flexShrink: 1,
  },
  date: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontWeight: "bold",
    color: colors.text.primary,
    fontSize: 16,
  },
  detailText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  statusNote: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
    fontStyle: "italic",
  },
});

const UserReportModalView: React.FC<UserReportModalViewProps> = ({
  report,
  onClose,
  onDelete,
  showAlert,
}) => {
  const { t } = useTranslation();
  const statusColor = getStatusColor(report.status);

  const handleDeletePress = () => {
    showAlert(
      "Delete Report",
      "Are you sure you want to delete this report? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await onDelete(report.id);
              onClose(); // Close the modal first
              // Show success message
              setTimeout(() => {
                showAlert(
                  "Success",
                  "Your report has been successfully deleted.",
                  [{ text: "OK" }]
                );
              }, 300);
            } catch (error) {
              showAlert("Error", "Failed to delete report. Please try again.", [
                { text: "OK" },
              ]);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("reports.reportDetails")}</Text>
        <View style={styles.headerActions}>
          <IconButton
            onPress={handleDeletePress}
            size={40}
            backgroundColor="transparent"
            color={colors.primary}
          >
            <MaterialIcons name="delete" size={24} color={colors.primary} />
          </IconButton>
          <IconButton onPress={onClose} size={40} backgroundColor="transparent">
            <MaterialIcons name="close" size={24} color={colors.text.primary} />
          </IconButton>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContent}
      >
        <Text style={[styles.date, { color: statusColor }]}>
          {formatDate(report.createdAt.toDate())}
        </Text>

        <View style={styles.image}>
          <View
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <Image
              source={{ uri: report.imageUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("reports.description")}</Text>
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

        <View style={styles.section}>
          <Text style={styles.detailText}>
            <Text style={styles.label}>{t("reports.points")}: </Text>
            {report.points}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default UserReportModalView;
