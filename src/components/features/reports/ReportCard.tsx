import React, { useState } from 'react';
import { Alert, View, ActivityIndicator, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import colors from '../../../theme/colors';
import { Report, ReportStatus, reportStatuses } from '../../../types/reports';
import { deleteReport, updateReportStatus } from '../../../services/firebase/reports';
import CustomAlert from '../../common/modals/CustomAlert';
import IconButton from '../../common/buttons/IconButton';
import TouchableButton from '../../common/buttons/TouchableButton';
import { useTranslation } from '../../../hooks/useTranslation';
import { getStatusTranslationKey, getStatusNoteTranslationKey, getStatusColor as getStatusColorUtil } from '../../../utils/statusTranslation';

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

// getStatusColor and getStatusNote now imported from utils/statusTranslation

// --- SUB-COMPONENTS ---
interface ViewProps {
  report: Report;
  statusColor: string;
  onClose: () => void;
  onDelete?: () => void;
  onStatusUpdate?: (newStatus: ReportStatus) => void;
}

const UserExpandedView = ({ report, statusColor, onClose, onDelete }: ViewProps) => {
  const { t } = useTranslation();
  return (
  <>
    <CardHeader>
      <CardTitle>{t('reports.reportDetails')}</CardTitle>
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
      <DetailLabel>{t('reports.description')}</DetailLabel>
      <DetailText>{report.description}</DetailText>
    </View>

    <View style={{ marginBottom: 16 }}>
      <DetailText color={statusColor} style={{ fontWeight: 'bold' }}>{t(getStatusTranslationKey(report.status))}</DetailText>
      <StatusNote style={{ marginTop: 2, marginBottom: 0 }}>{t(getStatusNoteTranslationKey(report.status))}</StatusNote>
    </View>

    <View style={{ marginBottom: 8 }}>
      <DetailText><DetailLabel>{t('reports.points')}: </DetailLabel>{report.points}</DetailText>
    </View>
  </>
);};

const AdminExpandedView = ({ report, statusColor, onClose, onStatusUpdate, onDelete }: ViewProps) => {
  const { t } = useTranslation();
  return (
  <>
    <CardHeader>
      <CardTitle>{t('reports.reportDetails')}</CardTitle>
      <HeaderActions>
        {(report.status === 'Canceled' || (report.status as string) === 'Report canceled') && onDelete && (
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
      <DetailLabel>{t('reports.description')}:</DetailLabel>
      <DetailText>{report.description}</DetailText>
    </View>

    <View style={{ marginBottom: 16 }}>
      <DetailLabel>{t('admin.user')}</DetailLabel>
      <DetailText>{report.userEmail || report.userId}</DetailText>
    </View>
    
    <DetailLabel>{t('admin.reportStatus')}</DetailLabel>
    <StatusGrid>
      {reportStatuses.map((status) => (
        <TouchableButton
          key={status}
          onPress={() => onStatusUpdate && onStatusUpdate(status)}
          disabled={report.status === status}
          style={{
            backgroundColor: report.status === status ? getStatusColorUtil(status) : colors.componentBackground,
            paddingVertical: 18,
            paddingHorizontal: 8,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            width: '48%',
          }}
        >
          <StatusButtonText active={report.status === status}>{t(getStatusTranslationKey(status))}</StatusButtonText>
        </TouchableButton>
      ))}
    </StatusGrid>
  </>
);};

// --- MAIN COMPONENT ---
const ReportCard: React.FC<ReportCardProps> = ({ report, onDelete, onStatusChange, isAdmin, onDetailsPress }) => {
  const { t } = useTranslation();
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

  const statusColor = getStatusColorUtil(report.status);

  const handleDelete = () => {
    showAlert(t('reports.deleteReport'), t('reports.deleteReportConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => {
          setIsProcessing(true);
          try {
            await deleteReport(report.id, report.imageUrl);
            showAlert(t('common.success'), t('reports.deleteReportSuccess'));
            onDelete(report.id);
          } catch (error) {
            showAlert(t('common.error'), t('reports.deleteReportError'));
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
      showAlert(t('common.success'), t('admin.statusUpdated'));
    } catch (error) {
      showAlert(t('common.error'), t('admin.statusUpdateError'));
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
          <ReportStatusText color={statusColor}>{t(getStatusTranslationKey(report.status))}</ReportStatusText>
          <TouchableButton
            onPress={() => onDetailsPress?.(report)}
            style={{
              backgroundColor: colors.text.secondary,
              paddingVertical: 10,
              paddingHorizontal: 28,
              borderRadius: 20,
              alignItems: 'center',
              minWidth: 140,
            }}
          >
            <DetailsButtonText>{t('common.seeDetails')}</DetailsButtonText>
          </TouchableButton>
        </ReportInfo>
        <CarImageContainer>
          <CollapsedCarImage source={{ uri: report.imageUrl }} />
                      {!isAdmin && (
            (() => {
              const statusStr = report.status as string;
              switch (statusStr) {
                case 'Submitted':
                case 'Report submitted':
                  return <StatusIndicatorText color={statusColor}>...</StatusIndicatorText>;
                case 'Canceled':
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
