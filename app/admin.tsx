import React, { useState, useCallback, useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import styled from 'styled-components/native';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { getAllReports } from '../src/services/firebase/reports';
import { Stack } from 'expo-router';
import { Report, ReportStatus } from '../src/types/reports';
import ReportList from '../src/components/ReportList';
import FilterPanel from '../src/components/admin/FilterPanel';
import * as Location from 'expo-location';
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

const Container = styled.View({
  flex: 1,
  backgroundColor: theme.colors.white,
  paddingHorizontal: 12,
  paddingVertical: 12,
});

const DashboardContainer = styled.View({
  flex: 1,
  backgroundColor: theme.colors.componentBackground,
  borderRadius: 24,
  padding: 12,
  overflow: 'hidden',
});


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

  const handleReportDelete = (deletedReportId: string) => {
    setReports(prevReports => prevReports.filter(report => report.id !== deletedReportId));
  };

  const handleStatusChange = (reportId: string, newStatus: ReportStatus) => {
    setReports(prevReports =>
      prevReports.map(report =>
        report.id === reportId ? { ...report, status: newStatus } : report
      )
    );
  };

  const handleLogout = () => {
    router.push('/admin-profile');
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
      <DashboardContainer style={shadowStyles.modalShadow}>
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
        />
      </DashboardContainer>
      </Container>
    </>
  );
};

export default AdminDashboard;
