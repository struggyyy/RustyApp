/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2025, @struggyyy                    *
 *                                                                         *
 *                             Project: Rusty                              *
 *                                                                         *
 *                         All Rights Reserved                             *
 *                                                                         *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *                                                                         *
 ************************************************************************** */
// React-specific imports
import React, { useState, useCallback, useEffect } from "react";
import { StatusBar, StyleSheet, Modal, View, Text } from "react-native";

// External libraries
import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router";

// Internal project imports
import { useAuth } from "../src/context/AuthContext";
import { useTranslation } from "../src/hooks/useTranslation";
import {
  getReportsByUserId,
  deleteReport,
} from "../src/components/lib/firebase/reports";
import { Report } from "../src/types/reports";
import ReportList from "../src/components/features/reports/ReportList";
import theme from "../src/theme";
import CustomAlert from "../src/components/common/modals/CustomAlert";
import UserReportModalView from "../src/components/features/my-reports/UserReportModal";

// Shadow styles using StyleSheet to avoid styled-components issues
const shadowStyles = StyleSheet.create({
  modalShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
});

// Main screen styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: 12,
  },
  historyContainer: {
    flex: 1,
    backgroundColor: theme.colors.componentBackground,
    borderRadius: 24,
    padding: 16,
    overflow: "hidden",
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    textAlign: "center",
    marginTop: -10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    padding: 24,
    width: "95%",
    maxWidth: 400,
  },
});

// Main component for user's reports page
export default function MyReportsScreen() {
  // State management for reports, loading, and UI
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
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }>;
  }>({ title: "", buttons: [] });

  // Alert management functions
  const showAlert = (
    title: string,
    message?: string,
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }> = [{ text: t("common.ok") }]
  ) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  // Function to fetch user's reports from Firebase
  const fetchReports = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      setError(t("auth.emailRequired"));
      return;
    }

    try {
      setError(null);
      const userReports = await getReportsByUserId(user.uid);
      setReports(userReports);
    } catch (err) {
      setError(t("reports.deleteReportError"));
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Fetch reports when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReports();
    }, [fetchReports])
  );

  // Handle deep linking to specific report
  useEffect(() => {
    if (reportId && reports.length > 0 && !loading) {
      const reportIndex = reports.findIndex((report) => report.id === reportId);
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

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, [fetchReports]);

  // Close report modal and reset state
  const handleModalClose = () => {
    setShowReportModal(false);
    setSelectedReport(null);
    setScrollToIndex(undefined);
  };

  // Open report details modal
  const handleDetailsPress = (report: Report) => {
    const reportIndex = reports.findIndex((r) => r.id === report.id);
    setSelectedReport(report);
    setShowReportModal(true);
    if (reportIndex !== -1) {
      setScrollToIndex(reportIndex);
    }
  };

  // Delete report from Firebase and update local state
  const handleReportDelete = async (deletedReportId: string) => {
    try {
      // Find the report to get its imageUrl
      const reportToDelete = reports.find(
        (report) => report.id === deletedReportId
      );
      if (reportToDelete) {
        // Delete from Firebase
        await deleteReport(deletedReportId, reportToDelete.imageUrl);
      }
      // Update local state
      setReports((prevReports) =>
        prevReports.filter((report) => report.id !== deletedReportId)
      );
    } catch (error) {
      console.error("Error deleting report:", error);
      // Optionally show an error message to the user
    }
  };

  // Render the main UI
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Stack.Screen options={{ title: t("reports.pageTitle") }} />
        <View style={[styles.historyContainer, shadowStyles.modalShadow]}>
          <Text style={styles.historyTitle}>{t("reports.title")}</Text>
          <ReportList
            reports={reports}
            loading={loading}
            error={error}
            refreshing={refreshing}
            isAdmin={false}
            onRefresh={onRefresh}
            onDelete={handleReportDelete}
            onStatusChange={() => {}} // No-op for users
            loadingText={t("reports.loadingReports")}
            emptyText={t("reports.noReports")}
            onDetailsPress={handleDetailsPress}
            scrollToIndex={scrollToIndex}
          />
        </View>

        <Modal visible={showReportModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, shadowStyles.modalShadow]}>
              {selectedReport && (
                <UserReportModalView
                  report={selectedReport}
                  onClose={handleModalClose}
                  onDelete={handleReportDelete}
                  showAlert={showAlert}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>

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
