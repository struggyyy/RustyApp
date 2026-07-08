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
import { useEffect, useState } from "react";

// External libraries
import { useRouter, useLocalSearchParams } from "expo-router";

// Internal imports
import { Report as ReportType } from "@/shared/types/reports";

interface UseAdminDeepLinkingProps {
  reports: ReportType[];
  loading: boolean;
  onOpenReport: (report: ReportType) => void;
}

export const useAdminDeepLinking = ({
  reports,
  loading,
  onOpenReport,
}: UseAdminDeepLinkingProps) => {
  const router = useRouter();
  const { reportId } = useLocalSearchParams();
  const [processedReportId, setProcessedReportId] = useState<string | null>(
    null,
  );

  // Effect to handle report ID from URL parameters
  useEffect(() => {
    const normalizedReportId = Array.isArray(reportId) ? reportId[0] : reportId;
    if (
      normalizedReportId &&
      reports.length > 0 &&
      !loading &&
      normalizedReportId !== processedReportId
    ) {
      const report = reports.find((r) => r.id === normalizedReportId);
      if (report) {
        onOpenReport(report);
        setProcessedReportId(normalizedReportId);
        // Clear URL param after opening the modal with a small delay
        setTimeout(() => {
          router.setParams({});
        }, 100);
      }
    }
  }, [reportId, reports, loading, router, processedReportId, onOpenReport]);
};
