import React, { useState, useCallback, useEffect } from 'react';
import { View, Button } from 'react-native';
import { useFocusEffect } from 'expo-router';
import styled from 'styled-components/native';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { getAllReports } from '../src/services/firebase/reports';
import { Report, ReportStatus } from '../src/types/reports';
import ReportList from '../src/components/ReportList';
import FilterPanel from '../src/components/admin/FilterPanel';
import * as Location from 'expo-location';
import theme from '../src/theme';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.white};
  padding: 24px 12px;
`;

const DashboardContainer = styled.View`
  flex: 1;
  background-color: ${theme.colors.componentBackground};
  border-radius: 24px;
  padding: 20px;
  overflow: hidden;
`;


const AdminDashboard = () => {
  const { logOut, isAdmin } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'All'>('All');
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
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

    // Filter by status
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(report => report.status === selectedStatus);
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
  }, [reports, selectedStatus, maxDistance, userLocation]);

  const fetchAllReports = useCallback(async () => {
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchAllReports();
    }, [fetchAllReports])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllReports();
  }, [fetchAllReports]);

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

  const handleLogout = async () => {
    try {
      await logOut(router);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <Container>
      <FilterPanel
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        maxDistance={maxDistance}
        onDistanceChange={setMaxDistance}
        onLogout={handleLogout}
      />
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
        />
      </DashboardContainer>
    </Container>
  );
};

export default AdminDashboard;
