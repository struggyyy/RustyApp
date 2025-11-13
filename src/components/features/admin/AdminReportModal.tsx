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
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";

// External libraries
import { MaterialIcons } from "@expo/vector-icons";

// Internal imports
import {
  Report as ReportType,
  ReportStatus,
  reportStatuses,
} from "../../../types/reports";
import { getStatusTranslationKey } from "../../../utils/statusTranslation";
import theme from "../../../theme";
import { getStatusColor } from "../../../theme/colors";
import { useHaptics } from "../../../context/HapticsContext";
import { useTranslation } from "../../../hooks/useTranslation";

interface AdminReportModalProps {
  report: ReportType;
  statusColor: string;
  onClose: () => void;
  onStatusUpdate?: (newStatus: ReportStatus) => void;
  onDelete?: () => void;
}

// Helper function to format date
const formatDate = (date: Date): string => {
  return `${String(date.getDate()).padStart(2, "0")}.${String(
    date.getMonth() + 1
  ).padStart(2, "0")}.${date.getFullYear()}`;
};

// Styles for report details view
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
    color: theme.colors.text.primary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 8,
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
    color: theme.colors.text.primary,
    fontSize: 16,
  },
  text: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  statusSection: {
    marginTop: 16,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  statusButton: {
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
  },
  statusButtonText: {
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default function AdminReportModal({
  report,
  statusColor,
  onClose,
  onStatusUpdate,
  onDelete,
}: AdminReportModalProps) {
  const { t } = useTranslation();
  const haptics = useHaptics();

  return (
    <View style={styles.container}>
      {/* Header with actions */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("reports.reportDetails")}</Text>
        <View style={styles.headerActions}>
          {report.status === "Canceled" && onDelete && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                haptics.heavy();
                onDelete();
              }}
            >
              <MaterialIcons
                name="delete"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              haptics.heavy();
              onClose();
            }}
          >
            <MaterialIcons
              name="close"
              size={24}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.date, { color: statusColor }]}>
          {formatDate(report.createdAt.toDate())}
        </Text>
        <Image source={{ uri: report.imageUrl }} style={styles.image} />

        <View style={styles.section}>
          <Text style={styles.label}>{t("admin.description")}</Text>
          <Text style={styles.text}>{report.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("admin.user")}</Text>
          <Text style={styles.text}>{report.userEmail || report.userId}</Text>
        </View>
      </ScrollView>

      {/* Status update section */}
      <View style={styles.statusSection}>
        <Text style={styles.label}>{t("admin.reportStatus")}</Text>
        <View style={styles.statusGrid}>
          {reportStatuses.map((status: ReportStatus) => {
            const isActive = report.status === status;

            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  {
                    backgroundColor: isActive
                      ? getStatusColor(status)
                      : theme.colors.background.secondary,
                  },
                ]}
                onPress={() => {
                  haptics.heavy();
                  onStatusUpdate && onStatusUpdate(status);
                }}
                disabled={isActive}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    {
                      color: isActive
                        ? theme.colors.white
                        : theme.colors.text.primary,
                    },
                  ]}
                >
                  {t(getStatusTranslationKey(status))}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
