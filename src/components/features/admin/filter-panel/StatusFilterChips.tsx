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

// Internal imports
import { ReportStatus, reportStatuses } from "@/shared/types/reports";
import theme from "@theme/index";
import { useHaptics } from "@context/HapticsContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { getStatusTranslationKey } from "@/shared/utils/statusTranslation";

interface StatusFilterChipsProps {
  selectedStatuses: ReportStatus[];
  onStatusesChange: (statuses: ReportStatus[]) => void;
  style?: any;
}

// Status filter chips component for selecting multiple report statuses
const StatusFilterChips: React.FC<StatusFilterChipsProps> = ({
  selectedStatuses,
  onStatusesChange,
  style,
}) => {
  const haptics = useHaptics();
  const { t } = useTranslation();

  // Use theme status colors
  const statusColors: Record<ReportStatus, string> = theme.colors.status;

  const handleShowAllPress = () => {
    haptics.heavy();
    onStatusesChange([]);
  };

  const handleStatusToggle = (status: ReportStatus) => {
    haptics.heavy();
    if (!selectedStatuses || selectedStatuses.length === 0) {
      onStatusesChange([status]);
      return;
    }
    const exists = selectedStatuses.includes(status);
    let next = exists
      ? selectedStatuses.filter((s: ReportStatus) => s !== status)
      : [...selectedStatuses, status];
    // If all statuses are selected, collapse to Show All (empty selection)
    if (next.length === reportStatuses.length) {
      next = [];
    }
    onStatusesChange(next);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.filterChip,
          selectedStatuses.length === 0
            ? styles.filterChipSelected
            : styles.filterChipUnselected,
        ]}
        onPress={handleShowAllPress}
      >
        <Text
          style={[
            styles.filterChipText,
            selectedStatuses.length === 0
              ? styles.filterChipTextSelected
              : styles.filterChipTextUnselected,
          ]}
        >
          {t("admin.showAll")}
        </Text>
      </TouchableOpacity>
      {reportStatuses.map((status) => {
        const isSelected = selectedStatuses?.includes(status) ?? false;
        const displayText = t(getStatusTranslationKey(status));
        return (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              isSelected
                ? styles.filterChipSelected
                : styles.filterChipUnselected,
              isSelected && {
                backgroundColor: statusColors[status],
                borderColor: statusColors[status],
              },
            ]}
            onPress={() => handleStatusToggle(status)}
          >
            <Text
              style={[
                styles.filterChipText,
                isSelected
                  ? styles.filterChipTextSelected
                  : styles.filterChipTextUnselected,
              ]}
            >
              {displayText}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.S,
  },
  filterChip: {
    borderRadius: theme.spacing.radius.L,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipUnselected: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.border.default,
  },
  filterChipText: {
    fontSize: theme.typography.fontSize.body2,
    textAlign: "center",
  },
  filterChipTextSelected: {
    color: theme.colors.white,
    fontWeight: "600",
  },
  filterChipTextUnselected: {
    color: theme.colors.text.primary,
    fontWeight: "400",
  },
});

export default StatusFilterChips;
