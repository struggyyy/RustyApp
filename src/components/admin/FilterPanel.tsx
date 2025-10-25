import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { ReportStatus, reportStatuses } from '../../types/reports';
import theme from '../../theme';
import { useAuth } from '../../context/AuthContext';

// Shadow styles using StyleSheet to avoid styled-components issues
const shadowStyles = StyleSheet.create({
  modalShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
});

interface FilterPanelProps {
  selectedStatus: ReportStatus | 'All';
  onStatusChange: (status: ReportStatus | 'All') => void;
  maxDistance: number | null;
  onDistanceChange: (distance: number | null) => void;
  onProfile: () => void;
}

const PanelContainer = styled.View`
  background-color: ${theme.colors.componentBackground};
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: 12px;
`;

const FilterRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const FilterChip = styled.TouchableOpacity<{ isSelected: boolean }>`
  background-color: ${(props: { isSelected: boolean }) => props.isSelected ? theme.colors.primary : theme.colors.white};
  border-radius: 16px;
  padding: 10px 16px;
  border-width: 1px;
  border-color: ${(props: { isSelected: boolean }) => props.isSelected ? theme.colors.primary : theme.colors.border.medium};
`;

const FilterChipText = styled.Text<{ isSelected: boolean }>`
  color: ${(props: { isSelected: boolean }) => props.isSelected ? theme.colors.white : theme.colors.text.primary};
  font-size: 14px;
  font-weight: ${(props: { isSelected: boolean }) => props.isSelected ? '600' : '400'};
`;

const DistanceContainer = styled.View`
  margin-bottom: 16px;
`;

const DistanceRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const ProfileButtonView = styled.View({
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: "#D9D9D9",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 4,
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

const DistanceInput = styled.TextInput`
  background-color: ${theme.colors.white};
  border-radius: 16px;
  padding: 10px 16px;
  border-width: 1px;
  border-color: ${theme.colors.border.medium};
  flex: 1;
  font-size: 14px;
  color: ${theme.colors.text.primary};
`;

const DistanceLabel = styled.Text`
  color: ${theme.colors.text.primary};
  font-size: 14px;
  font-weight: 500;
`;

const ClearButton = styled.TouchableOpacity`
  background-color: ${theme.colors.text.secondary};
  border-radius: 16px;
  padding: 10px 16px;
`;

const ClearButtonText = styled.Text`
  color: ${theme.colors.white};
  font-size: 14px;
  font-weight: 500;
`;

const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedStatus,
  onStatusChange,
  maxDistance,
  onDistanceChange,
  onProfile,
}) => {
  const { user, profile } = useAuth();
  const [distanceInput, setDistanceInput] = React.useState<string>(
    maxDistance ? maxDistance.toString() : ''
  );

  const handleDistanceChange = (text: string) => {
    setDistanceInput(text);
    const numValue = parseFloat(text);
    if (!isNaN(numValue) && numValue > 0) {
      onDistanceChange(numValue);
    } else if (text === '') {
      onDistanceChange(null);
    }
  };

  const handleClearDistance = () => {
    setDistanceInput('');
    onDistanceChange(null);
  };

  return (
    <PanelContainer style={shadowStyles.modalShadow}>
      {/* Distance Filter */}
      <DistanceContainer>
        <SectionTitle>Filter by Distance Radius</SectionTitle>
        <DistanceRow>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 }}>
            <DistanceInput
              placeholder="Enter max distance"
              keyboardType="numeric"
              value={distanceInput}
              onChangeText={handleDistanceChange}
              placeholderTextColor={theme.colors.text.tertiary}
            />
            <DistanceLabel>km</DistanceLabel>
            {distanceInput !== '' && (
              <ClearButton onPress={handleClearDistance}>
                <ClearButtonText>Clear</ClearButtonText>
              </ClearButton>
            )}
          </View>
          <TouchableOpacity onPress={onProfile}>
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
        </DistanceRow>
      </DistanceContainer>

      {/* Status Filter */}
      <SectionTitle>Filter by Report Status</SectionTitle>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
      >
        <FilterRow>
          <FilterChip
            isSelected={selectedStatus === 'All'}
            onPress={() => onStatusChange('All')}
          >
            <FilterChipText isSelected={selectedStatus === 'All'}>
              Show All
            </FilterChipText>
          </FilterChip>
          {reportStatuses.map((status) => {
            // Remove "Report " prefix and capitalize first letter
            const displayText = status.replace('Report ', '').replace(/^./, str => str.toUpperCase());
            return (
              <FilterChip
                key={status}
                isSelected={selectedStatus === status}
                onPress={() => onStatusChange(status)}
              >
                <FilterChipText isSelected={selectedStatus === status}>
                  {displayText}
                </FilterChipText>
              </FilterChip>
            );
          })}
        </FilterRow>
      </ScrollView>
    </PanelContainer>
  );
};

export default FilterPanel;
