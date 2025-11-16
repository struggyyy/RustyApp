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
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

// External libraries
import { MaterialIcons } from "@expo/vector-icons";

// Internal imports
import { ReportStatus } from "../../../../shared/types/reports";
import theme from "../../../../core/theme";
import { useTranslation } from "../../../../shared/hooks/common/useTranslation";
import { useHaptics } from "../../../../core/context/HapticsContext";
import StatusFilterChips from "./StatusFilterChips";
import DistancePickerSection from "./DistancePickerSection";

interface ExpandedFilterViewProps {
  selectedStatuses: ReportStatus[];
  maxDistance: number | null;
  onStatusesChange: (statuses: ReportStatus[]) => void;
  onDistanceChange: (distance: number | null) => void;
  onCollapse: () => void;
  style?: any;
}

// Expanded filter panel view with status chips and distance picker
const ExpandedFilterView: React.FC<ExpandedFilterViewProps> = ({
  selectedStatuses,
  maxDistance,
  onStatusesChange,
  onDistanceChange,
  onCollapse,
  style,
}) => {
  const haptics = useHaptics();
  const { t } = useTranslation();

  const handleCollapse = () => {
    haptics.heavy();
    onCollapse();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("admin.filters")}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleCollapse}>
          <MaterialIcons
            name="close"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.leftColumn}>
          <Text style={styles.sectionTitle}>{t("admin.status")}</Text>
          <StatusFilterChips
            selectedStatuses={selectedStatuses}
            onStatusesChange={onStatusesChange}
          />
        </View>
        <View style={styles.rightColumn}>
          <Text style={styles.sectionTitle}>{t("admin.radius")}</Text>
          <DistancePickerSection
            maxDistance={maxDistance}
            onDistanceChange={onDistanceChange}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Container styles will be applied by parent
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.M,
  },
  title: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: theme.spacing.S,
  },
  content: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    gap: theme.spacing.M,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
    alignItems: "stretch",
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.h6,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
});

export default ExpandedFilterView;
