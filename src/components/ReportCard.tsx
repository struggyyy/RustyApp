import React, { useState } from 'react';
import { Alert, View, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styled from 'styled-components/native';
import colors from '../theme/colors';
import { Report, ReportStatus, reportStatuses } from '../types/reports';
import { deleteReport, updateReportStatus } from '../services/firebase/reports';

// --- TYPES ---
interface ReportCardProps {
  report: Report;
  onDelete: (reportId: string) => void;
  onStatusChange: (reportId: string, newStatus: ReportStatus) => void;
  isAdmin: boolean;
  expandedReportId?: string;
}

interface CardContainerProps {
  isExpanded: boolean;
}

// --- STYLED COMPONENTS (Shared) ---
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

const ReportStatusText = styled.Text<StatusTextProps>`
  font-size: 16px;
  color: ${(props: StatusTextProps) => props.color};
  margin-bottom: 8px;
`;

const StatusNote = styled.Text`
  font-size: 14px;
  color: ${colors.text.secondary};
  margin-bottom: 16px;
  font-style: italic;
`;

const DetailsButton = styled.TouchableOpacity`
  background-color: ${colors.text.secondary};
  padding: 10px 20px;
  border-radius: 20px;
  align-items: center;
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
  height: 180px;
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

const StatusIndicatorText = styled.Text<StatusTextProps>`
  font-size: 24px;
  font-weight: bold;
  color: ${(props: StatusTextProps) => props.color};
  margin-top: 8px;
`;

const DetailText = styled.Text<{ color?: string }>`
  font-size: 16px;
  color: ${(props: { color?: string }) => props.color || colors.text.primary};
  /* No margin-bottom here, handled by container */
`;

const DetailLabel = styled.Text`
  font-weight: bold;
  color: ${colors.text.primary};
  font-size: 16px;
`;

// --- ADMIN-SPECIFIC STYLED COMPONENTS ---

const StatusButtonText = styled.Text<{ active: boolean }>`
  color: ${(props: { active: boolean }) => (props.active ? colors.white : colors.text.primary)};
  font-weight: bold;
  font-size: 12px;
`;

const StatusGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between; /* Distribute space between columns */
  gap: 10px; /* Vertical gap between rows */
  margin-top: 16px;
  margin-bottom: 16px;
`;

const StatusButton = styled.TouchableOpacity<{ active: boolean; activeColor: string }>`
  background-color: ${(props: { active: boolean; activeColor: string }) => (props.active ? props.activeColor : colors.componentBackground)};
  padding: 18px 8px; /* Increase vertical padding for a more square look */
  border-radius: 12px; /* More rounded corners */
  align-items: center;
  justify-content: center; /* Center text vertically */
  width: 48%; /* Creates a two-column layout */
`;

// --- HELPERS ---
const formatDate = (date: Date): string => {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const getStatusColor = (status: ReportStatus | undefined) => {
  const safeStatus = status || 'Report submitted';

  switch (safeStatus) {
    case 'Report submitted':
      return '#1976D2'; // Blue
    case 'Report accepted':
      return '#00796B'; // Teal
    case 'Report completed':
      return '#2E7D32'; // Green
    case 'Report canceled':
      return '#C62828'; // Distinctive red
    default:
      return colors.text.primary;
  }
};

const getStatusNote = (status: ReportStatus | undefined): string => {
  const safeStatus = status || 'Report submitted';

  switch (safeStatus) {
    case 'Report submitted':
  return 'Your report has been received and is now being verified. We’ll notify you once its status changes.';
case 'Report accepted':
  return 'Your report has been accepted. Our team is now processing it, which may take some time as we contact the vehicle owner and complete the necessary paperwork.';
case 'Report completed':
  return 'The reported vehicle has been removed from the street and is now being recycled, donated, or prepared for a city auction.';
case 'Report canceled':
  return 'We were unable to verify your report due to insufficient information or potential inaccuracies. Please feel free to submit a new report if you believe this was an error.';

    default:
      return '';
  }
};

// --- SUB-COMPONENTS ---
interface ViewProps {
  report: Report;
  statusColor: string;
  onClose: () => void;
  onDelete?: () => void;
  onStatusUpdate?: (newStatus: ReportStatus) => void;
}

const UserExpandedView = ({ report, statusColor, onClose, onDelete }: ViewProps) => (
  <>
    <ReportDate color={statusColor}>{formatDate(report.createdAt.toDate())}</ReportDate>
    <ExpandedCarImage source={{ uri: report.imageUrl }} />

    <View style={{ marginBottom: 16 }}>
      <DetailLabel>Description</DetailLabel>
      <DetailText>{report.description}</DetailText>
    </View>

    <View style={{ marginBottom: 16 }}>
      <DetailText color={statusColor} style={{ fontWeight: 'bold' }}>{report.status}</DetailText>
      <StatusNote style={{ marginTop: 2, marginBottom: 0 }}>{getStatusNote(report.status)}</StatusNote>
    </View>

    <View style={{ marginBottom: 8 }}>
      <DetailText><DetailLabel>Points </DetailLabel>{report.points}</DetailText>
    </View>

    <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
      <DetailsButton onPress={onClose} style={{ flex: 1 }}><DetailsButtonText>Close</DetailsButtonText></DetailsButton>
      {onDelete && (
        <DetailsButton onPress={onDelete} style={{ flex: 1, backgroundColor: colors.primary }}>
          <DetailsButtonText>Delete</DetailsButtonText>
        </DetailsButton>
      )}
    </View>
  </>
);

const AdminExpandedView = ({ report, statusColor, onClose, onStatusUpdate, onDelete }: ViewProps) => (
  <>
    <ReportDate color={statusColor}>{formatDate(report.createdAt.toDate())}</ReportDate>
    <ExpandedCarImage source={{ uri: report.imageUrl }} />

    <View style={{ marginBottom: 16 }}>
      <DetailLabel>Description:</DetailLabel>
      <DetailText>{report.description}</DetailText>
    </View>

    <View style={{ marginBottom: 16 }}>
      <DetailLabel>User:</DetailLabel>
      <DetailText>{report.userEmail || report.userId}</DetailText>
    </View>
    
    <DetailLabel>Report Status:</DetailLabel>
    <StatusGrid>
      {reportStatuses.map((status) => (
        <StatusButton 
          key={status} 
          active={report.status === status} 
          activeColor={getStatusColor(status)} // Use the status color for the active background
          onPress={() => onStatusUpdate && onStatusUpdate(status)} 
          disabled={report.status === status}
        >
          <StatusButtonText active={report.status === status}>{capitalize(status.replace('Report ', ''))}</StatusButtonText>
        </StatusButton>
      ))}
    </StatusGrid>

    <StatusNote>{getStatusNote(report.status)}</StatusNote>

    <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
      <DetailsButton onPress={onClose} style={{ flex: 1 }}><DetailsButtonText>Close</DetailsButtonText></DetailsButton>
      {report.status === 'Report canceled' && onDelete && (
        <DetailsButton onPress={onDelete} style={{ flex: 1, backgroundColor: colors.primary }}>
          <DetailsButtonText>Delete</DetailsButtonText>
        </DetailsButton>
      )}
    </View>
  </>
);

// --- MAIN COMPONENT ---
const ReportCard: React.FC<ReportCardProps> = ({ report, onDelete, onStatusChange, isAdmin, expandedReportId }) => {
  const [isExpanded, setIsExpanded] = useState(expandedReportId === report.id);
  const [isProcessing, setIsProcessing] = useState(false);

  const statusColor = getStatusColor(report.status);

  const handleDelete = () => {
    Alert.alert('Delete Report', 'Are you sure you want to delete this report?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          setIsProcessing(true);
          try {
            await deleteReport(report.id, report.imageUrl);
            Alert.alert('Success', 'Report has been deleted.');
            onDelete(report.id);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete the report.');
          } finally {
            setIsProcessing(false);
          }
        }},
    ]);
  };

    const handleStatusUpdate = async (newStatus: ReportStatus) => {
    setIsProcessing(true);
    try {
      await updateReportStatus(report.id, report.userId, report.status, newStatus);
      onStatusChange(report.id, newStatus);
      Alert.alert('Success', `Report status updated to "${newStatus}".`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <CardContainer isExpanded={false}>
        <ActivityIndicator size="large" color={colors.primary} />
      </CardContainer>
    );
  }

  return (
    <CardContainer isExpanded={isExpanded}>
      {isExpanded ? (
        isAdmin ? (
          <AdminExpandedView report={report} statusColor={statusColor} onClose={() => setIsExpanded(false)} onStatusUpdate={handleStatusUpdate} onDelete={handleDelete} />
        ) : (
          <UserExpandedView report={report} statusColor={statusColor} onClose={() => setIsExpanded(false)} onDelete={handleDelete} />
        )
      ) : (
        <>
          <ReportInfo>
            <ReportDate color={statusColor}>{formatDate(report.createdAt.toDate())}</ReportDate>
            <ReportStatusText color={statusColor}>{report.status}</ReportStatusText>
            <DetailsButton onPress={() => setIsExpanded(true)}>
              <DetailsButtonText>See the details</DetailsButtonText>
            </DetailsButton>
          </ReportInfo>
          <CarImageContainer>
            <CollapsedCarImage source={{ uri: report.imageUrl }} />
                        {!isAdmin && (
              (() => {
                switch (report.status) {
                  case 'Report submitted':
                    return <StatusIndicatorText color={statusColor}>...</StatusIndicatorText>;
                  case 'Report canceled':
                    return <FontAwesome name="times-circle" size={24} color={statusColor} style={{ marginTop: 8 }} />;
                  default:
                    return <PointsText color={statusColor}>{`${report.points}p`}</PointsText>;
                }
              })()
            )}
          </CarImageContainer>
        </>
      )}
    </CardContainer>
  );
};

export default ReportCard;

