import React, { useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import colors from '../theme/colors';
import { Report } from '../types/reports';
import { deleteReport } from '../services/firebase/reports';

// --- TYPES ---
interface ReportCardProps {
  report: Report;
  getStatusColor: (status: string) => string;
  onDelete: (reportId: string) => void; // Callback to refresh list
}

interface CardContainerProps {
  isExpanded: boolean;
}

// --- STYLED COMPONENTS ---
const CardContainer = styled.View<CardContainerProps>`
  background-color: ${colors.white};
  border-radius: 15px;
  padding: 16px;
  margin-bottom: 16px;
  flex-direction: ${(props: CardContainerProps) => (props.isExpanded ? 'column' : 'row')};
  align-items: ${(props: CardContainerProps) => (props.isExpanded ? 'stretch' : 'center')};
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const ReportInfo = styled.View`
  flex: 1;
`;

interface StatusTextProps {
  color: string;
}

const ReportDate = styled.Text<StatusTextProps>`
  font-size: 18px;
  font-weight: bold;
  color: ${(props: StatusTextProps) => props.color};
  margin-bottom: 8px;
`;

const ReportStatus = styled.Text`
  font-size: 16px;
  color: ${colors.text.secondary};
  margin-bottom: 16px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
`;

const DetailsButton = styled.TouchableOpacity`
  background-color: ${colors.text.secondary};
  padding-vertical: 10px;
  padding-horizontal: 20px;
  border-radius: 20px;
  align-self: flex-start; /* Fixes button width issue */
`;

const DeleteButton = styled(DetailsButton)`
  background-color: ${colors.primary}; /* Use primary brand color */
`;

const DetailsButtonText = styled.Text`
  color: ${colors.text.light};
  font-weight: bold;
  font-size: 14px;
`;

const CarImageContainer = styled.View`
  margin-left: 16px;
  align-items: center;
`;

const CollapsedCarImage = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 40px;
`;

const ExpandedCarImage = styled.Image`
  width: 100%;
  height: 200px;
  border-radius: 10px;
  margin-top: 8px;
  margin-bottom: 16px;
`;

const PointsText = styled.Text<StatusTextProps>`
  font-size: 14px;
  font-weight: bold;
  color: ${(props: StatusTextProps) => props.color};
  margin-top: 8px;
`;

const DetailsContainer = styled.View`
  margin-top: 8px;
`;

const DetailText = styled.Text`
  font-size: 16px;
  color: ${colors.text.primary};
  margin-bottom: 8px;
`;

const DetailLabel = styled.Text`
  font-weight: bold;
`;

// --- HELPERS ---
const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

// --- COMPONENT ---
const ReportCard: React.FC<ReportCardProps> = ({ report, getStatusColor, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const reportStatus = report.status || 'Report submitted';
  const reportPoints = report.points || '...';
  const reportDate = formatDate(report.createdAt.toDate());

  const statusColor = getStatusColor(reportStatus);

  const handleDelete = async () => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteReport(report.id, report.imageUrl);
              Alert.alert('Success', 'Report has been deleted.');
              onDelete(report.id); // Refresh the list in the parent component
            } catch (error) {
              console.error('Failed to delete report:', error);
              Alert.alert('Error', 'Failed to delete the report. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <CardContainer isExpanded={isExpanded}>
      {isExpanded ? (
        // --- EXPANDED VIEW ---
        <>
          <ReportDate color={statusColor}>{reportDate}</ReportDate>
          <ExpandedCarImage source={{ uri: report.imageUrl }} />
          <DetailsContainer>
            <DetailText><DetailLabel>Description:</DetailLabel> {report.description}</DetailText>
            <DetailText><DetailLabel>Status:</DetailLabel> {reportStatus}</DetailText>
            <DetailText><DetailLabel>Points:</DetailLabel> {reportPoints}</DetailText>
          </DetailsContainer>
          <ButtonContainer>
            <DetailsButton onPress={() => setIsExpanded(false)}>
              <DetailsButtonText>Hide details</DetailsButtonText>
            </DetailsButton>
            <DeleteButton onPress={handleDelete} disabled={isDeleting}>
              <DetailsButtonText>{isDeleting ? 'Deleting...' : 'Delete Report'}</DetailsButtonText>
            </DeleteButton>
          </ButtonContainer>
        </>
      ) : (
        // --- COLLAPSED VIEW ---
        <>
          <ReportInfo>
            <ReportDate color={statusColor}>{reportDate}</ReportDate>
            <ReportStatus>{reportStatus}</ReportStatus>
            <DetailsButton onPress={() => setIsExpanded(true)}>
              <DetailsButtonText>See the details</DetailsButtonText>
            </DetailsButton>
          </ReportInfo>
          <CarImageContainer>
            <CollapsedCarImage source={{ uri: report.imageUrl }} />
            <PointsText color={statusColor}>{reportPoints}</PointsText>
          </CarImageContainer>
        </>
      )}
    </CardContainer>
  );
};

export default ReportCard;

