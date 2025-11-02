import React, { useState, useCallback, useEffect } from 'react';
import { View, Button, StyleSheet, Modal, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import styled from 'styled-components/native';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { getAllReports, updateReportStatus, deleteReport } from '../src/services/firebase/reports';
import { Stack } from 'expo-router';
import { Report, ReportStatus, reportStatuses } from '../src/types/reports';
import ReportList from '../src/components/ReportList';
import FilterPanel from '../src/components/admin/FilterPanel';
import ReportCard from '../src/components/ReportCard';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../src/theme';

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
  maxHeight: '95%',
});

const ModalHeader = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
});

const ModalTitle = styled.Text({
  fontSize: 20,
  fontWeight: 'bold',
  color: theme.colors.text.primary,
});

const ModalCloseButton = styled.TouchableOpacity({
  padding: 8,
});

// Helper function for status colors
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
      return theme.colors.text.primary;
  }
};

// Helper function for date formatting
const formatDate = (date: Date): string => {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
};

// Helper function for capitalizing
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Styled components for expanded view
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

const StatusGrid = styled.View({
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: 10,
  marginTop: 16,
  marginBottom: 16,
});

const StatusButton = styled.TouchableOpacity<{ active: boolean; activeColor: string }>((props: { active: boolean; activeColor: string }) => ({
  backgroundColor: props.active ? props.activeColor : theme.colors.componentBackground,
  paddingVertical: 18,
  paddingHorizontal: 8,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  width: '48%',
}));

const StatusButtonText = styled.Text<{ active: boolean }>((props: { active: boolean }) => ({
  color: props.active ? theme.colors.white : theme.colors.text.primary,
  fontWeight: 'bold',
  fontSize: 12,
}));

const Container = styled.View({
  flex: 1,
  backgroundColor: theme.colors.white,
  paddingHorizontal: 12,
  paddingVertical: 12,
});

const DashboardShadowWrapper = styled.View({
  flex: 1,
  borderRadius: 24,
});

const DashboardContainer = styled.View({
  flex: 1,
  backgroundColor: theme.colors.componentBackground,
  borderRadius: 24,
  padding: 20,
});

const AdminExpandedView = ({ report, statusColor, onClose, onStatusUpdate, onDelete }: {
  report: Report;
  statusColor: string;
  onClose: () => void;
  onStatusUpdate?: (newStatus: ReportStatus) => void;
  onDelete?: () => void;
}) => (
  <View style={{ maxHeight: '100%' }}>
    {/* Fixed Header */}
    <CardHeader>
      <CardTitle>Report Details</CardTitle>
      <HeaderActions>
        {report.status === 'Report canceled' && onDelete && (
          <DeleteButton onPress={onDelete}>
            <MaterialIcons name="delete" size={24} color={theme.colors.primary} />
          </DeleteButton>
        )}
        <CloseButton onPress={onClose}>
          <MaterialIcons name="close" size={24} color={theme.colors.text.primary} />
        </CloseButton>
      </HeaderActions>
    </CardHeader>

    {/* Scrollable Content */}
    <ScrollView 
      showsVerticalScrollIndicator={false}
      style={{ flexGrow: 0, flexShrink: 1 }}
      contentContainerStyle={{ flexGrow: 0 }}
    >
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
    </ScrollView>

    {/* Fixed Footer */}
    <View style={{ marginTop: 16 }}>
      <DetailLabel>Report Status:</DetailLabel>
      <StatusGrid>
        {reportStatuses.map((status) => (
          <StatusButton
            key={status}
            active={report.status === status}
            activeColor={getStatusColor(status)}
            onPress={() => onStatusUpdate && onStatusUpdate(status)}
            disabled={report.status === status}
          >
            <StatusButtonText active={report.status === status}>{capitalize(status.replace('Report ', ''))}</StatusButtonText>
          </StatusButton>
        ))}
      </StatusGrid>
    </View>
  </View>
);

const AdminDashboard = () => {
  const { logOut, isAdmin } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<ReportStatus[]>([]);
  const [maxDistance, setMaxDistance] = useState<number | null>(5);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/home');
    }
  }, [isAdmin, router]);

  // Get user's current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Apply filters to reports
  useEffect(() => {
    let filtered = [...reports];

    // Filter by status (multi-select). Empty array = Show All
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(report => selectedStatuses.includes(report.status));
    }

    // Filter by distance
    if (maxDistance !== null && userLocation) {
      filtered = filtered.filter(report => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          report.location.latitude,
          report.location.longitude
        );
        return distance <= maxDistance;
      });
    }

    setFilteredReports(filtered);
  }, [reports, selectedStatuses, maxDistance, userLocation]);

  const fetchAllReports = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      setError(null);
      const allReports = await getAllReports();
      setReports(allReports);
    } catch (err) {
      setError('Failed to fetch reports. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin]);

  useFocusEffect(
    useCallback(() => {
      if (isAdmin) {
        setLoading(true);
        fetchAllReports();
      }
    }, [fetchAllReports, isAdmin])
  );

  const onRefresh = useCallback(() => {
    if (isAdmin) {
      setRefreshing(true);
      fetchAllReports();
    }
  }, [fetchAllReports, isAdmin]);

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

  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    try {
      // Find the report to get userId and current status
      const report = reports.find(r => r.id === reportId);
      if (report) {
        // Update in Firebase
        await updateReportStatus(reportId, report.userId, report.status, newStatus);
      }
      // Update local state
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );
    } catch (error) {
      console.error('Error updating report status:', error);
      // Optionally show an error message to the user
    }
  };

  const handleLogout = () => {
    router.push('/admin-profile');
  };

  const handleModalClose = () => {
    setShowReportModal(false);
    setSelectedReport(null);
  };

  const handleModalStatusUpdate = async (newStatus: ReportStatus) => {
    if (selectedReport) {
      await handleStatusChange(selectedReport.id, newStatus);
      // Update the selected report with new status
      setSelectedReport({ ...selectedReport, status: newStatus });
    }
  };

  const handleModalDelete = async () => {
    if (selectedReport) {
      await handleReportDelete(selectedReport.id);
      handleModalClose();
    }
  };

  const handleDetailsPress = (report: Report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Admin' }} />
      <Container>
      <FilterPanel
        selectedStatuses={selectedStatuses}
        onStatusesChange={setSelectedStatuses}
        maxDistance={maxDistance}
        onDistanceChange={setMaxDistance}
        onProfile={handleLogout}
      />
      <DashboardShadowWrapper style={shadowStyles.modalShadow}>
        <DashboardContainer>
          <ReportList
            reports={filteredReports}
            loading={loading}
            error={error}
            refreshing={refreshing}
            isAdmin={true}
            onRefresh={onRefresh}
            onDelete={handleReportDelete}
            onStatusChange={handleStatusChange}
            loadingText="Loading all reports..."
            emptyText="No reports match the current filters."
            onDetailsPress={handleDetailsPress}
          />
        </DashboardContainer>
      </DashboardShadowWrapper>

      <Modal visible={showReportModal} transparent animationType="fade">
        <ModalOverlay>
          <ModalContent style={shadowStyles.modalShadow}>
            {selectedReport && (
              <AdminExpandedView
                report={selectedReport}
                statusColor={getStatusColor(selectedReport.status)}
                onClose={handleModalClose}
                onStatusUpdate={handleModalStatusUpdate}
                onDelete={handleModalDelete}
              />
            )}
          </ModalContent>
        </ModalOverlay>
      </Modal>
      </Container>
    </>
  );
};

export default AdminDashboard;
