import React, { useState, useCallback, useEffect } from 'react';
import { StatusBar, StyleSheet, Modal, View, ScrollView } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import styled from 'styled-components/native';
import { useAuth } from '../src/context/AuthContext';
import { useTranslation } from '../src/hooks/useTranslation';
import { getReportsByUserId, deleteReport } from '../src/components/lib/firebase/reports';
import { Report, ReportStatus } from '../src/types/reports';
import ReportList from '../src/components/features/reports/ReportList';
import theme from '../src/theme';
import CustomAlert from '../src/components/common/modals/CustomAlert';

import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import IconButton from '../src/components/common/buttons/IconButton';
import { getStatusTranslationKey, getStatusNoteTranslationKey, getStatusColor } from '../src/utils/statusTranslation';

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

// Helper functions
const formatDate = (date: Date): string => {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
};

// Styled components for modal view
const CardHeader = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
});

const CardTitle = styled.Text({
  fontSize: 20,
  fontWeight: 'bold',
  color: theme.colors.text.primary,
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

const ReportDate = styled.Text<{ color: string }>((props: { color: string }) => ({
  fontSize: 18,
  fontWeight: 'bold',
  color: props.color,
  marginBottom: 8,
}));

const ExpandedCarImage = styled.Image({
  width: '100%',
  height: 180,
  borderRadius: 10,
  marginTop: 8,
  marginBottom: 16,
});

const DetailLabel = styled.Text({
  fontWeight: 'bold',
  color: theme.colors.text.primary,
  fontSize: 16,
});

const DetailText = styled.Text<{ color?: string }>((props: { color?: string }) => ({
  fontSize: 16,
  color: props.color || theme.colors.text.primary,
}));

const StatusNote = styled.Text({
  fontSize: 14,
  color: theme.colors.text.secondary,
  marginBottom: 16,
  fontStyle: 'italic',
});

interface UserReportModalViewProps {
  report: Report;
  onClose: () => void;
  onDelete: (id: string) => void;
  showAlert: (title: string, message?: string, buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>) => void;
}

const UserReportModalView: React.FC<UserReportModalViewProps> = ({ report, onClose, onDelete, showAlert }) => {
  const { t } = useTranslation();
  const statusColor = getStatusColor(report.status);

  const handleDeletePress = () => {
    showAlert(
      t('reports.deleteReport'),
      t('reports.deleteReportConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(report.id);
              onClose(); // Close the modal first
              // Show success message
              setTimeout(() => {
                showAlert(
                  t('common.success'),
                  t('reports.deleteReportSuccess'),
                  [{ text: t('common.ok') }]
                );
              }, 300);
            } catch (error) {
              showAlert(
                t('common.error'),
                t('reports.deleteReportError'),
                [{ text: t('common.ok') }]
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ maxHeight: '100%' }}>
      {/* Fixed Header */}
      <CardHeader>
        <CardTitle>{t('reports.reportDetails')}</CardTitle>
        <HeaderActions>
          <IconButton
            onPress={handleDeletePress}
            size={40}
            backgroundColor="transparent"
            color={theme.colors.primary}
          >
            <MaterialIcons name="delete" size={24} color={theme.colors.primary} />
          </IconButton>
          <IconButton
            onPress={onClose}
            size={40}
            backgroundColor="transparent"
          >
            <MaterialIcons name="close" size={24} color={theme.colors.text.primary} />
          </IconButton>
        </HeaderActions>
      </CardHeader>

      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <ReportDate color={statusColor}>{formatDate(report.createdAt.toDate())}</ReportDate>
        <ExpandedCarImage source={{ uri: report.imageUrl }} />

        <View style={{ marginBottom: 16 }}>
          <DetailLabel>{t('reports.description')}</DetailLabel>
          <DetailText>{report.description}</DetailText>
        </View>

        <View style={{ marginBottom: 16 }}>
          <DetailText color={statusColor} style={{ fontWeight: 'bold' }}>{t(getStatusTranslationKey(report.status))}</DetailText>
          <StatusNote>{t(getStatusNoteTranslationKey(report.status))}</StatusNote>
        </View>

        <View style={{ marginBottom: 8 }}>
          <DetailText><DetailLabel>{t('reports.points')}: </DetailLabel>{report.points}</DetailText>
        </View>
      </ScrollView>
    </View>
  );
};

// Styled Components
const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.white};
  padding: 12px 12px;
`;

const HistoryContainer = styled.View`
  flex: 1;
  background-color: ${theme.colors.componentBackground};
  border-radius: 24px;
  padding: 16px;
  overflow: hidden;
`;

const HistoryTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${theme.colors.text.primary};
  text-align: center;
  margin-top: -10px;
`;

const ModalOverlay = styled.View({
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
});

const ModalContent = styled.View({
  backgroundColor: theme.colors.white,
  borderRadius: 24,
  padding: 24,
  width: '95%',
  maxWidth: 400,
});

export default function MyReportsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { reportId } = useLocalSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [scrollToIndex, setScrollToIndex] = useState<number | undefined>(undefined);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
  }>({ title: '', buttons: [] });

  const showAlert = (title: string, message?: string, buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }> = [{ text: t('common.ok') }]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const fetchReports = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      setError(t('auth.emailRequired'));
      return;
    }

    try {
      setError(null);
      const userReports = await getReportsByUserId(user.uid);
      setReports(userReports);
    } catch (err) {
      setError(t('reports.deleteReportError'));
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReports();
    }, [fetchReports])
  );

  // Handle reportId parameter from navigation
  useEffect(() => {
    if (reportId && reports.length > 0 && !loading) {
      const reportIndex = reports.findIndex(report => report.id === reportId);
      if (reportIndex !== -1) {
        const report = reports[reportIndex];
        setSelectedReport(report);
        setScrollToIndex(reportIndex);
        
        // Delay modal opening to prevent flash and ensure smooth transition
        setTimeout(() => {
          setShowReportModal(true);
        }, 250);
      }
    }
  }, [reportId, reports, loading]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, [fetchReports]);

  const handleModalClose = () => {
    setShowReportModal(false);
    setSelectedReport(null);
    setScrollToIndex(undefined);
  };

  const handleDetailsPress = (report: Report) => {
    const reportIndex = reports.findIndex(r => r.id === report.id);
    setSelectedReport(report);
    setShowReportModal(true);
    if (reportIndex !== -1) {
      setScrollToIndex(reportIndex);
    }
  };

  const handleReportDelete = async (deletedReportId: string) => {
    try {
      // Find the report to get its imageUrl
      const reportToDelete = reports.find(report => report.id === deletedReportId);
      if (reportToDelete) {
        // Delete from Firebase
        await deleteReport(deletedReportId, reportToDelete.imageUrl);
      }
      // Update local state
      setReports(prevReports => prevReports.filter(report => report.id !== deletedReportId));
    } catch (error) {
      console.error('Error deleting report:', error);
      // Optionally show an error message to the user
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Container>
        <Stack.Screen options={{ title: t('reports.pageTitle') }} />
        <HistoryContainer style={shadowStyles.modalShadow}>
          <HistoryTitle>{t('reports.title')}</HistoryTitle>
          <ReportList
            reports={reports}
            loading={loading}
            error={error}
            refreshing={refreshing}
            isAdmin={false}
            onRefresh={onRefresh}
            onDelete={handleReportDelete}
            onStatusChange={() => {}} // No-op for users
            loadingText={t('reports.loadingReports')}
            emptyText={t('reports.noReports')}
            onDetailsPress={handleDetailsPress}
            scrollToIndex={scrollToIndex}
          />
        </HistoryContainer>

        <Modal visible={showReportModal} transparent animationType="fade">
          <ModalOverlay>
            <ModalContent style={shadowStyles.modalShadow}>
              {selectedReport && (
                <UserReportModalView 
                  report={selectedReport} 
                  onClose={handleModalClose}
                  onDelete={handleReportDelete}
                  showAlert={showAlert}
                />
              )}
            </ModalContent>
          </ModalOverlay>
        </Modal>
      </Container>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={hideAlert}
      />
    </>
  );
}