import React from 'react';
import { View, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { ReportStatus, reportStatuses } from '../../types/reports';
import theme from '../../theme';

interface FilterPanelProps {
  selectedStatus: ReportStatus | 'All';
  onStatusChange: (status: ReportStatus | 'All') => void;
  maxDistance: number | null;
  onDistanceChange: (distance: number | null) => void;
  onLogout: () => void;
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

const LogoutButton = styled.TouchableOpacity`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${theme.colors.text.secondary};
  justify-content: center;
  align-items: center;
`;

const LogoutIcon = styled.Text`
  font-size: 20px;
  color: ${theme.colors.white};
  font-weight: bold;
  text-align: center;
  line-height: 24px;
`;

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
  onLogout,
}) => {
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
    <PanelContainer>
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
          <LogoutButton onPress={onLogout}>
            <LogoutIcon>→</LogoutIcon>
          </LogoutButton>
        </DistanceRow>
      </DistanceContainer>
    </PanelContainer>
  );
};

export default FilterPanel;
