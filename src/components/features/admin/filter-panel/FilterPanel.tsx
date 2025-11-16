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
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

// Internal imports
import { ReportStatus } from "../../../../shared/types/reports";
import theme from "../../../../core/theme";
import { useAuth } from "../../../../core/context/AuthContext";
import { useHaptics } from "../../../../core/context/HapticsContext";
import CollapsedFilterView from "./CollapsedFilterView";
import ExpandedFilterView from "./ExpandedFilterView";

interface FilterPanelProps {
  selectedStatuses: ReportStatus[]; // empty array means Show All
  onStatusesChange: (statuses: ReportStatus[]) => void;
  maxDistance: number | null;
  onDistanceChange: (distance: number | null) => void;
  onProfile: () => void;
  onMap: () => void;
  isMapView?: boolean;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

// Filter panel styles
const styles = StyleSheet.create({
  panelContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.spacing.radius.XL,
    padding: theme.spacing.component.modalPadding,
    marginBottom: 12,
  },
  panelContainerCollapsed: {
    minHeight: 80,
  },
  panelContainerExpanded: {
    minHeight: "auto",
  },
});

// Filter panel component with collapsible design for admin report management
const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedStatuses,
  onStatusesChange,
  maxDistance,
  onDistanceChange,
  onProfile,
  onMap,
  isMapView = false,
  isExpanded: externalIsExpanded,
  onExpandedChange,
}) => {
  const { user, profile } = useAuth();
  const haptics = useHaptics();
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isExpanded =
    externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
  const setIsExpanded = (expanded: boolean) => {
    if (onExpandedChange) {
      onExpandedChange(expanded);
    } else {
      setInternalIsExpanded(expanded);
    }
  };

  const handleExpand = () => {
    haptics.heavy();
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    haptics.heavy();
    setIsExpanded(false);
  };

  return (
    <View
      style={[
        styles.panelContainer,
        theme.shadows.modal,
        isExpanded
          ? styles.panelContainerExpanded
          : styles.panelContainerCollapsed,
      ]}
    >
      {isExpanded ? (
        <ExpandedFilterView
          selectedStatuses={selectedStatuses}
          maxDistance={maxDistance}
          onStatusesChange={onStatusesChange}
          onDistanceChange={onDistanceChange}
          onCollapse={handleCollapse}
        />
      ) : (
        <CollapsedFilterView
          selectedStatuses={selectedStatuses}
          maxDistance={maxDistance}
          isMapView={isMapView}
          onMap={onMap}
          onProfile={onProfile}
          onExpand={handleExpand}
          userEmail={user?.email}
          profileImage={profile?.profileImage}
        />
      )}
    </View>
  );
};

export default FilterPanel;
