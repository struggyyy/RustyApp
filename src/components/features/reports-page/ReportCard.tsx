import React, { useState } from 'react';
import { Alert, View, ActivityIndicator, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import colors from '../../../core/theme/colors';
import { typography, spacing, shadows } from '../../../core/theme';
import { Report, ReportStatus, reportStatuses } from '../../../shared/types/reports';
import { deleteReport, updateReportStatus } from '../../../lib/firebase/reports';
import IconButton from '../../common/buttons/IconButton';
import TouchableButton from '../../common/buttons/TouchableButton';
import { useTranslation } from '../../../shared/hooks/common/useTranslation';
import { useAlert } from '../../../core/context/AlertContext';
import { getStatusTranslationKey, getStatusNoteTranslationKey } from '../../../shared/utils/statusTranslation';

// Use theme shadows instead of local shadowStyles

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
    borderRadius: spacing.radius.L,
    padding: spacing.layout.cardPadding,
    marginBottom: spacing.M,
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
    fontSize: typography.fontSize.h5,
    fontWeight: 'bold',
    color: props.color,
    marginBottom: spacing.S,
  })
);

const ReportStatusText = styled.Text<StatusTextProps>(
  (props: StatusTextProps) => ({
    fontSize: typography.fontSize.h6,
    color: props.color,
    marginBottom: spacing.M,
  })
);

const StatusNote = styled.Text({
  fontSize: typography.fontSize.body2,
  color: colors.text.tertiary,
  marginBottom: spacing.layout.cardPadding,
  fontStyle: 'italic',
});

const DetailsButton = styled.TouchableOpacity({
  backgroundColor: colors.text.primary,
  paddingVertical: spacing.component.buttonPadding,
  paddingHorizontal: spacing.L,
  borderRadius: spacing.radius.L,
  alignItems: 'center',
});

const DetailsButtonText = styled.Text({
  color: colors.white,
  fontWeight: 'bold',
  fontSize: typography.fontSize.caption,
});

const CarImageContainer = styled.View({
  marginLeft: spacing.M,
  alignItems: 'center',
});

const CollapsedCarImage = styled.Image({
  width: 80,
  height: 80,
  borderRadius: spacing.radius.XXL,
});

const ExpandedCarImage = styled.Image({
  width: '100%',
  height: 180,
  borderRadius: spacing.radius.XS,
  marginTop: spacing.S,
  marginBottom: spacing.layout.cardPadding,
});

const PointsText = styled.Text<StatusTextProps>(
  (props: StatusTextProps) => ({
    fontSize: typography.fontSize.body2,
    fontWeight: 'bold',
    color: props.color,
    marginTop: spacing.S,
  })
);

const StatusIndicatorText = styled.Text<StatusTextProps>(
  (props: StatusTextProps) => ({
    fontSize: typography.fontSize.h3,
    fontWeight: 'bold',
    color: props.color,
    marginTop: spacing.S,
  })
);

const DetailText = styled.Text<{ color?: string }>(
  (props: { color?: string }) => ({
    fontSize: typography.fontSize.body1,
    color: props.color || colors.text.primary,
  })
);

const DetailLabel = styled.Text({
  fontWeight: 'bold',
  color: colors.text.primary,
  fontSize: typography.fontSize.body1,
});

// --- CARD HEADER COMPONENTS ---
const CardHeader = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: spacing.S,
});

const CardTitle = styled.Text({
  fontSize: typography.fontSize.h4,
  fontWeight: 'bold',
  color: colors.text.primary,
});

const HeaderActions = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.S,
});

const CloseButton = styled.TouchableOpacity({
  padding: spacing.S,
});

const DeleteButton = styled.TouchableOpacity({
  padding: spacing.S,
});

// --- ADMIN-SPECIFIC STYLED COMPONENTS ---

const StatusButtonText = styled.Text<{ active: boolean }>(
  (props: { active: boolean }) => ({
    color: props.active ? colors.white : colors.text.primary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.overline,
  })
);

const StatusGrid = styled.View({
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: spacing.M,
  marginTop: spacing.layout.cardPadding,
  marginBottom: spacing.layout.cardPadding,
});

const StatusButton = styled.TouchableOpacity<{ active: boolean; activeColor: string }>(
  (props: { active: boolean; activeColor: string }) => ({
    backgroundColor: props.active ? props.activeColor : colors.background.secondary,
    paddingVertical: spacing.L,
    paddingHorizontal: spacing.S,
    borderRadius: spacing.radius.M,
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

    <View style={{ marginBottom: spacing.layout.cardPadding }}>
      <DetailLabel>{t('reports.description')}</DetailLabel>
      <DetailText>{report.description}</DetailText>
    </View>

    <View style={{ marginBottom: spacing.layout.cardPadding }}>
      <DetailText color={statusColor} style={{ fontWeight: 'bold' }}>{t(getStatusTranslationKey(report.status))}</DetailText>
      <StatusNote style={{ marginTop: spacing.XXS, marginBottom: 0 }}>{t(getStatusNoteTranslationKey(report.status))}</StatusNote>
    </View>

    <View style={{ marginBottom: spacing.S }}>
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
        {report.status === 'Canceled' && onDelete && (
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

    <View style={{ marginBottom: spacing.layout.cardPadding }}>
      <DetailLabel>{t('reports.description')}:</DetailLabel>
      <DetailText>{report.description}</DetailText>
    </View>

    <View style={{ marginBottom: spacing.layout.cardPadding }}>
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
            backgroundColor: report.status === status ? colors.getStatusColor(status) : colors.background.secondary,
            paddingVertical: spacing.L,
            paddingHorizontal: spacing.S,
            borderRadius: spacing.radius.M,
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

  const { showAlert } = useAlert();

  const statusColor = colors.getStatusColor(report.status);

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
      <CardContainer style={shadows.card} isExpanded={false}>
        <ActivityIndicator size="large" color={colors.primary} />
      </CardContainer>
    );
  }

  return (
    <>
      <CardContainer style={shadows.card} isExpanded={false}>
        <ReportInfo>
          <ReportDate color={statusColor}>{formatDate(report.createdAt.toDate())}</ReportDate>
          <ReportStatusText color={statusColor}>{t(getStatusTranslationKey(report.status))}</ReportStatusText>
          <TouchableButton
            onPress={() => onDetailsPress?.(report)}
            style={{
              backgroundColor: colors.text.primary,
              paddingVertical: spacing.component.buttonPadding,
              paddingHorizontal: spacing.XL,
              borderRadius: spacing.radius.L,
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
                  return <StatusIndicatorText color={statusColor}>...</StatusIndicatorText>;
                case 'Canceled':
                  return <FontAwesome name="times-circle" size={24} color={statusColor} style={{ marginTop: spacing.S }} />;
                default:
                  return <PointsText color={statusColor}>{`${report.points}p`}</PointsText>;
              }
            })()
          )}
        </CarImageContainer>
      </CardContainer>

    </>
  );
};

export default ReportCard;
