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
import { ReportStatus } from "@/shared/types/reports";
import theme from "@theme/index";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { getStatusTranslationKey } from "@/shared/utils/statusTranslation";
import { useHaptics } from "@context/HapticsContext";
import MapViewToggleButton from "./MapViewToggleButton";
import ProfileButton from "./ProfileButton";

interface CollapsedFilterViewProps {
  selectedStatuses: ReportStatus[];
  maxDistance: number | null;
  isMapView: boolean;
  onMap: () => void;
  onProfile: () => void;
  onExpand: () => void;
  userEmail?: string | null;
  profileImage?: string | null;
  style?: any;
}

// Collapsed filter panel view with map/profile buttons and overlay information
const CollapsedFilterView: React.FC<CollapsedFilterViewProps> = ({
  selectedStatuses,
  maxDistance,
  isMapView,
  onMap,
  onProfile,
  onExpand,
  userEmail,
  profileImage,
  style,
}) => {
  const haptics = useHaptics();
  const { t } = useTranslation();

  const handleExpand = () => {
    haptics.heavy();
    onExpand();
  };

  // Format status display text for collapsed view
  const getStatusDisplayText = () => {
    if (!selectedStatuses || selectedStatuses.length === 0)
      return t("admin.showAll");
    if (selectedStatuses.length === 1) {
      return t(getStatusTranslationKey(selectedStatuses[0]));
    }
    return `${selectedStatuses.length} ${t("admin.selected")}`;
  };

  return (
    <TouchableOpacity
      onPress={handleExpand}
      activeOpacity={0.7}
      style={[styles.container, style]}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={(e: any) => {
              e.stopPropagation();
              // MapViewToggleButton handles its own onPress
            }}
            activeOpacity={1}
          >
            <MapViewToggleButton
              isMapView={isMapView}
              onPress={onMap}
              size={56}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e: any) => {
              e.stopPropagation();
              // ProfileButton handles its own onPress
            }}
            activeOpacity={1}
          >
            <ProfileButton
              userEmail={userEmail}
              profileImage={profileImage}
              onPress={onProfile}
              size={56}
            />
          </TouchableOpacity>
          <View style={styles.overlayContainer}>
            <Text style={styles.statusInfo}>
              {t("admin.status")}: {getStatusDisplayText()}
            </Text>
            <Text style={styles.distanceInfo}>
              {t("admin.radius")}: {maxDistance || 0} km
            </Text>
            <View style={styles.expandIcon}>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={20}
                color={theme.colors.text.primary}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "stretch",
    minHeight: 40,
    paddingVertical: 2,
  },
  content: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "stretch",
    minHeight: 40,
    paddingVertical: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    position: "relative",
  },
  overlayContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  statusInfo: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text.primary,
    marginBottom: 2,
    fontWeight: "bold",
    flexShrink: 0,
  },
  distanceInfo: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text.primary,
    fontWeight: "bold",
    flexShrink: 0,
  },
  expandIcon: {
    marginTop: 4,
    pointerEvents: "auto",
  },
});

export default CollapsedFilterView;
