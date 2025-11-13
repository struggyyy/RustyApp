import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { ReportStatus, reportStatuses } from '../../../types/reports';
import theme from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import CustomWheelPicker from './CustomWheelPicker';
import { useHaptics } from '../../../context/HapticsContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { getStatusTranslationKey } from '../../../utils/statusTranslation';

// Use theme shadows instead of local shadowStyles

interface FilterPanelProps {
  selectedStatuses: ReportStatus[]; // empty array means Show All
  onStatusesChange: (statuses: ReportStatus[]) => void;
  maxDistance: number | null;
  onDistanceChange: (distance: number | null) => void;
  onProfile: () => void;
}

const PanelContainer = styled.View<{ isExpanded: boolean }>`
  background-color: ${theme.colors.background.secondary};
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 12px;
  min-height: ${(props: { isExpanded: boolean }) => props.isExpanded ? 'auto' : '80px'};
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: 12px;
  text-align: center;
`;

const FilterChip = styled.TouchableOpacity<{ isSelected: boolean; chipColor?: string }>`
  background-color: ${(props: { isSelected: boolean; chipColor?: string }) => props.isSelected ? (props.chipColor || theme.colors.primary) : theme.colors.white};
  border-radius: 16px;
  padding: 10px 12px;
  align-items: center;
  border-width: 1px;
  border-color: ${(props: { isSelected: boolean; chipColor?: string }) => props.isSelected ? (props.chipColor || theme.colors.primary) : theme.colors.border.default};
`;

const FilterChipText = styled.Text<{ isSelected: boolean }>`
  color: ${(props: { isSelected: boolean }) => props.isSelected ? theme.colors.white : theme.colors.text.primary};
  font-size: 14px;
  font-weight: ${(props: { isSelected: boolean }) => props.isSelected ? '600' : '400'};
  text-align: center;
`;

const PickerContainer = styled.View`
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.white};
  border-radius: 16px;
  border-width: 1px;
  border-color: ${theme.colors.border.default};
  padding: 12px;
  align-self: center;
`;

const PickerWrapper = styled.View`
  width: 100%;
  align-items: center;
  height: 200px;
  justify-content: center;
`;

const PickerLabel = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-top: 8px;
`;

const FiltersSplitRow = styled.View`
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
  gap: 16px;
`;

const LeftColumn = styled.View`
  flex: 1;
`;

const RightColumn = styled.View`
  flex: 1;
  align-items: stretch;
`;

const ProfileButtonView = styled.View({
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: "#D9D9D9",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 5,
  borderColor: theme.colors.primary,
});

const ProfileUserImage = styled.Image({
  width: "100%",
  height: "100%",
  borderRadius: 28,
});

const ProfileImagePlaceholder = styled.View({
  width: "100%",
  height: "100%",
  borderRadius: 28,
  backgroundColor: "#D9D9D9",
  justifyContent: "center",
  alignItems: "center",
});

const ProfileImagePlaceholderText = styled.Text({
  color: "#656565",
  fontSize: 20,
  fontWeight: "bold",
});

// Collapsed/Minimized view components (similar to Edit Profile card)
const CollapsedFilterContent = styled.View`
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  min-height: 40px;
  padding-vertical: 2px;
`;

const CollapsedFilterTop = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const StatusInfo = styled.Text`
  font-size: 14px;
  color: ${theme.colors.text.secondary};
  margin-bottom: 2px;
  font-weight: bold;
  flex-shrink: 0;
`;

const DistanceInfo = styled.Text`
  font-size: 14px;
  color: ${theme.colors.text.secondary};
  font-weight: bold;
  flex-shrink: 0;
`;

// Expanded view header
const ExpandedFilterHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ExpandedFilterTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${theme.colors.text.primary};
`;

const ExpandedFilterCloseButton = styled.TouchableOpacity`
  padding: 8px;
`;

const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedStatuses,
  onStatusesChange,
  maxDistance,
  onDistanceChange,
  onProfile,
}) => {
  const { user, profile } = useAuth();
  const haptics = useHaptics();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [selectedDistanceIndex, setSelectedDistanceIndex] = React.useState((maxDistance || 5) - 1);
  
  // Distance options from 1 to 50 km
  const distanceOptions = Array.from({ length: 50 }, (_, i) => (i + 1).toString());

  // Use theme status colors
  const statusColors: Record<ReportStatus, string> = theme.colors.status;

  // Set default values if not already set
  React.useEffect(() => {
    if (maxDistance === null) {
      onDistanceChange(5);
    }
  }, []);

  // Update selected index when maxDistance changes
  React.useEffect(() => {
    if (maxDistance) {
      setSelectedDistanceIndex(maxDistance - 1);
    }
  }, [maxDistance]);

  const handleDistanceChange = (index: number) => {
    setSelectedDistanceIndex(index);
    const distance = parseInt(distanceOptions[index]);
    onDistanceChange(distance);
  };

  const getStatusDisplayText = () => {
    if (!selectedStatuses || selectedStatuses.length === 0) return t('admin.showAll');
    if (selectedStatuses.length === 1) {
      return t(getStatusTranslationKey(selectedStatuses[0]));
    }
    return `${selectedStatuses.length} ${t('admin.selected')}`;
  };

  const renderCollapsedView = () => (
    <TouchableOpacity onPress={() => { haptics.heavy(); setIsExpanded(true); }} activeOpacity={0.7}>
      <CollapsedFilterContent>
        <CollapsedFilterTop>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
              <StatusInfo>{t('admin.status')}: {getStatusDisplayText()}</StatusInfo>
              <DistanceInfo>{t('admin.radius')}: {maxDistance || 0} km</DistanceInfo>
            </View>
            <View style={{ marginLeft: 12 }}>
              <MaterialIcons name="keyboard-arrow-down" size={26} color={theme.colors.text.secondary} />
            </View>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => { haptics.heavy(); onProfile(); }}>
              <ProfileButtonView>
                {profile?.profileImage || user?.photoURL ? (
                  <ProfileUserImage
                    source={{
                      uri: profile?.profileImage || user?.photoURL || undefined,
                    }}
                  />
                ) : (
                  <ProfileImagePlaceholder>
                    <ProfileImagePlaceholderText>
                      {user?.email?.[0]?.toUpperCase() || "?"}
                    </ProfileImagePlaceholderText>
                  </ProfileImagePlaceholder>
                )}
              </ProfileButtonView>
            </TouchableOpacity>
          </View>
        </CollapsedFilterTop>
      </CollapsedFilterContent>
    </TouchableOpacity>
  );

  const renderExpandedView = () => (
    <>
      <ExpandedFilterHeader>
        <ExpandedFilterTitle>{t('admin.filters')}</ExpandedFilterTitle>
        <ExpandedFilterCloseButton onPress={() => { haptics.heavy(); setIsExpanded(false); }}>
          <MaterialIcons name="close" size={24} color={theme.colors.text.primary} />
        </ExpandedFilterCloseButton>
      </ExpandedFilterHeader>

      <FiltersSplitRow>
        <LeftColumn>
          <SectionTitle>{t('admin.status')}</SectionTitle>
          <View style={{ gap: 8 }}>
            <FilterChip
              isSelected={!selectedStatuses || selectedStatuses.length === 0}
              onPress={() => { haptics.heavy(); onStatusesChange([]); }}
            >
              <FilterChipText isSelected={!selectedStatuses || selectedStatuses.length === 0}>
                {t('admin.showAll')}
              </FilterChipText>
            </FilterChip>
            {reportStatuses.map((status) => {
              const isSelected = selectedStatuses?.includes(status) ?? false;
              const displayText = t(getStatusTranslationKey(status));
              const handleToggle = () => {
                haptics.heavy();
                if (!selectedStatuses || selectedStatuses.length === 0) {
                  onStatusesChange([status]);
                  return;
                }
                const exists = selectedStatuses.includes(status);
                let next = exists
                  ? selectedStatuses.filter((s) => s !== status)
                  : [...selectedStatuses, status];
                // If all statuses are selected, collapse to Show All (empty selection)
                if (next.length === reportStatuses.length) {
                  next = [];
                }
                onStatusesChange(next);
              };
              return (
                <FilterChip
                  key={status}
                  isSelected={isSelected}
                  chipColor={isSelected ? statusColors[status] : undefined}
                  onPress={handleToggle}
                >
                  <FilterChipText isSelected={isSelected}>
                    {displayText}
                  </FilterChipText>
                </FilterChip>
              );
            })}
          </View>
        </LeftColumn>
        <RightColumn>
          <SectionTitle>{t('admin.radius')}</SectionTitle>
          <PickerContainer>
            <PickerWrapper>
              <CustomWheelPicker
                selectedIndex={selectedDistanceIndex}
                options={distanceOptions}
                onChange={handleDistanceChange}
                itemHeight={40}
                containerStyle={{ width: 100, height: 200 }}
                itemTextStyle={{
                  fontSize: 16,
                  color: theme.colors.text.secondary,
                }}
                visibleRest={2}
              />
            </PickerWrapper>
            <PickerLabel>km</PickerLabel>
          </PickerContainer>
        </RightColumn>
      </FiltersSplitRow>
    </>
  );

  return (
    <PanelContainer style={theme.shadows.modal} isExpanded={isExpanded}>
      {isExpanded ? renderExpandedView() : renderCollapsedView()}
    </PanelContainer>
  );
};

export default FilterPanel;
