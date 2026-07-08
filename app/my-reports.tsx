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
import React, { useCallback } from "react";
import { StatusBar, StyleSheet, Modal, View, Text } from "react-native";

// External libraries
import { Stack, useFocusEffect } from "expo-router";

// Internal imports
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { useMyReports } from "@/shared/hooks/reports/useMyReports";
import ReportList from "@/components/features/user/reports-page/ReportList";
import UserReportModalView from "@/components/features/user/reports-page/UserReportModal";
import theme from "@theme/index";

// Main screen styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: 12,
  },
  historyContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
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
  const { t } = useTranslation();

  // Use custom hook for logic
  const {
    reports,
    loading,
    error,
    refreshing,
    onRefresh,
    handleReportDelete,
    showReportModal,
    selectedReport,
    scrollToIndex,
    handleModalClose,
    handleDetailsPress,
    fetchReports,
  } = useMyReports();

  // Fetch reports when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports]),
  );

  // Render the main UI
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Stack.Screen options={{ title: t("reports.pageTitle") }} />
        <View style={[styles.historyContainer, theme.shadows.modal]}>
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
            <View style={[styles.modalContent, theme.shadows.modal]}>
              {selectedReport && (
                <UserReportModalView
                  report={selectedReport}
                  onClose={handleModalClose}
                  onDelete={handleReportDelete}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}
