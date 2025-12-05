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
import { useState, useCallback } from "react";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";
import { getReportsByUserId } from "@/lib/firebase/reports";
import { Report } from "@/shared/types/reports";
import { useTranslation } from "@/shared/hooks/common/useTranslation";

// Hook return type interface
export interface UseReportsReturn {
  reports: Report[];
  loading: boolean;
  error: string | null;
  fetchReports: () => Promise<void>;
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
}

// Main hook function
export function useReports(): UseReportsReturn {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user reports from Firebase
  const fetchReports = useCallback(async () => {
    if (user) {
      try {
        setError(null);
        // Allow background refreshes
        const userReports = await getReportsByUserId(user.uid);
        setReports(userReports);
      } catch (err) {
        setError(t("reports.deleteReportError"));
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [user, t]);

  // Hook return interface
  return {
    reports,
    loading,
    error,
    fetchReports,
    setReports,
  };
}
