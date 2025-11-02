import React, { useState } from 'react';
import { Alert, View, ActivityIndicator, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import colors from '../theme/colors';
import { Report, ReportStatus, reportStatuses } from '../types/reports';
import { deleteReport, updateReportStatus } from '../services/firebase/reports';
import CustomAlert from './common/CustomAlert';
import IconButton from './common/IconButton';
import TouchableButton from './common/TouchableButton';

// Shadow styles using StyleSheet to avoid styled-components issues
const shadowStyles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
});

// --- TYPES ---
interface ReportCardProps {
  report: Report;
  onDelete: (reportId: string) => void;
  onStatusChange: (reportId: string, newStatus: ReportStatus) => void;
  isAdmin: boolean;
  onDetailsPress?: (report: Report) => void;
}

interface CardContainerProps {
  isExpanded: boolean;
}

// --- STYLED COMPONENTS (Shared) ---
const CardContainer = styled.View<CardContainerProps>(
  (props: CardContainerProps) => ({
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    flexDirection: props.isExpanded ? 'column' : 'row',
    alignItems: props.isExpanded ? 'stretch' : 'center',
  })
);

const ReportInfo = styled.View({
  flex: 1,
});

interface StatusTextProps {
  color: string;
}

const ReportDate = styled.Text<StatusTextProps>(
  (props: StatusTextProps) => ({
    fontSize: 18,
    fontWeight: 'bold',
    color: props.color,
    marginBottom: 8,
  })
);

const ReportStatusText = styled.Text<StatusTextProps>(
  (props: StatusTextProps) => ({
    fontSize: 16,
    color: props.color,
    marginBottom: 8,
  })
);

const StatusNote = styled.Text({
  fontSize: 14,
  color: colors.text.secondary,
  marginBottom: 16,
  fontStyle: 'italic',
});

const DetailsButton = styled.TouchableOpacity({
  backgroundColor: colors.text.secondary,
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 20,
  alignItems: 'center',
});

const DetailsButtonText = styled.Text({
  color: colors.text.light,
  fontWeight: 'bold',
  fontSize: 14,
});

const CarImageContainer = styled.View({
  marginLeft: 16,
  alignItems: 'center',
});

const CollapsedCarImage = styled.Image({
  width: 80,
  height: 80,
  borderRadius: 40,
});

const ExpandedCarImage = styled.Image({
  width: '100%',
  height: 180,
  borderRadius: 10,
  marginTop: 8,
  marginBottom: 16,
});

const PointsText = styled.Text<StatusTextProps>(
  (props: StatusTextProps) => ({
    fontSize: 14,
    fontWeight: 'bold',
    color: props.color,
    marginTop: 8,
  })
);

const StatusIndicatorText = styled.Text<StatusTextProps>(
  (props: StatusTextProps) => ({
    fontSize: 24,
    fontWeight: 'bold',
    color: props.color,
    marginTop: 8,
  })
);

const DetailText = styled.Text<{ color?: string }>(
  (props: { color?: string }) => ({
    fontSize: 16,
    color: props.color || colors.text.primary,
  })
);

const DetailLabel = styled.Text({
  fontWeight: 'bold',
  color: colors.text.primary,
  fontSize: 16,
});

// --- CARD HEADER COMPONENTS ---
const CardHeader = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
});

const CardTitle = styled.Text({
  fontSize: 20,
  fontWeight: 'bold',
  color: colors.text.primary,
});

const HeaderActions = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
});

const CloseButton = styled.TouchableOpacity({
  padding: 8,
});

const DeleteButton = styled.TouchableOpacity({
  padding: 8,
});

// --- ADMIN-SPECIFIC STYLED COMPONENTS ---

const StatusButtonText = styled.Text<{ active: boolean }>(
  (props: { active: boolean }) => ({
    color: props.active ? colors.white : colors.text.primary,
    fontWeight: 'bold',
    fontSize: 12,
  })
);

const StatusGrid = styled.View({
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: 10,
  marginTop: 16,
  marginBottom: 16,
});

const StatusButton = styled.TouchableOpacity<{ active: boolean; activeColor: string }>(
  (props: { active: boolean; activeColor: string }) => ({
    backgroundColor: props.active ? props.activeColor : colors.componentBackground,
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  })
);

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
    <CardHeader>
      <CardTitle>Report Details</CardTitle>
      <HeaderActions>
        {onDelete && (
          <IconButton
            onPress={onDelete}
            size={40}
            backgroundColor="transparent"
            color={colors.primary}
          >
            <MaterialIcons name="delete" size={24} color={colors.primary} />
          </IconButton>
        )}
        <IconButton
          onPress={onClose}
          size={40}
          backgroundColor="transparent"
        >
          <MaterialIcons name="close" size={24} color={colors.text.primary} />
        </IconButton>
      </HeaderActions>
    </CardHeader>

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
  </>
);

const AdminExpandedView = ({ report, statusColor, onClose, onStatusUpdate, onDelete }: ViewProps) => (
  <>
    <CardHeader>
      <CardTitle>Report Details</CardTitle>
      <HeaderActions>
        {report.status === 'Report canceled' && onDelete && (
          <IconButton
            onPress={onDelete}
            size={40}
            backgroundColor="transparent"
            color={colors.primary}
          >
            <MaterialIcons name="delete" size={24} color={colors.primary} />
          </IconButton>
        )}
        <IconButton
          onPress={onClose}
          size={40}
          backgroundColor="transparent"
        >
          <MaterialIcons name="close" size={24} color={colors.text.primary} />
        </IconButton>
      </HeaderActions>
    </CardHeader>

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
        <TouchableButton
          key={status}
          onPress={() => onStatusUpdate && onStatusUpdate(status)}
          disabled={report.status === status}
          style={{
            backgroundColor: report.status === status ? getStatusColor(status) : colors.componentBackground,
            paddingVertical: 18,
            paddingHorizontal: 8,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            width: '48%',
          }}
        >
          <StatusButtonText active={report.status === status}>{capitalize(status.replace('Report ', ''))}</StatusButtonText>
        </TouchableButton>
      ))}
    </StatusGrid>
  </>
);

// --- MAIN COMPONENT ---
const ReportCard: React.FC<ReportCardProps> = ({ report, onDelete, onStatusChange, isAdmin, onDetailsPress }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
  }>({ title: '', buttons: [] });

  const showAlert = (title: string, message?: string, buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }> = [{ text: 'OK' }]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const statusColor = getStatusColor(report.status);

  const handleDelete = () => {
    showAlert('Delete Report', 'Are you sure you want to delete this report?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          setIsProcessing(true);
          try {
            await deleteReport(report.id, report.imageUrl);
            showAlert('Success', 'Report has been deleted.');
            onDelete(report.id);
          } catch (error) {
            showAlert('Error', 'Failed to delete the report.');
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
      showAlert('Success', `Report status updated to "${newStatus}".`);
    } catch (error) {
      showAlert('Error', 'Failed to update status.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <CardContainer style={shadowStyles.cardShadow} isExpanded={false}>
        <ActivityIndicator size="large" color={colors.primary} />
      </CardContainer>
    );
  }

  return (
    <>
      <CardContainer style={shadowStyles.cardShadow} isExpanded={false}>
        <ReportInfo>
          <ReportDate color={statusColor}>{formatDate(report.createdAt.toDate())}</ReportDate>
          <ReportStatusText color={statusColor}>{report.status}</ReportStatusText>
          <TouchableButton
            onPress={() => onDetailsPress?.(report)}
            style={{
              backgroundColor: colors.text.secondary,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 20,
              alignItems: 'center',
            }}
          >
            <DetailsButtonText>See the details</DetailsButtonText>
          </TouchableButton>
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
      </CardContainer>
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={hideAlert}
      />
    </>
  );
};

export default ReportCard;
