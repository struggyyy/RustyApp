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
// React specific imports
import React from "react";

// Internal imports
import ReportList from "@/components/features/user/reports-page/ReportList";
import { Report as ReportType, ReportStatus } from "@/shared/types/reports";
import { useTranslation } from "@/shared/hooks/common/useTranslation";

interface AdminListViewProps {
  reports: ReportType[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: ReportStatus) => Promise<void>;
  onDetailsPress: (report: ReportType) => void;
}

export default function AdminListView({
  reports,
  loading,
  error,
  refreshing,
  onRefresh,
  onDelete,
  onStatusChange,
  onDetailsPress,
}: AdminListViewProps) {
  const { t } = useTranslation();

  return (
    <ReportList
      reports={reports}
      loading={loading}
      error={error}
      refreshing={refreshing}
      isAdmin={true}
      onRefresh={onRefresh}
      onDelete={onDelete}
      onStatusChange={onStatusChange}
      loadingText={t("admin.loading")}
      emptyText={t("admin.noReports")}
      onDetailsPress={onDetailsPress}
    />
  );
}
