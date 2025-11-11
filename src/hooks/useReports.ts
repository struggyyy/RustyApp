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
import { useAuth } from "@/context/AuthContext";
import { getReportsByUserId } from "@/components/lib/firebase/reports";
import { Report } from "@/types/reports";

export interface UseReportsReturn {
  reports: Report[];
  fetchReports: () => Promise<void>;
}

export function useReports(): UseReportsReturn {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);

  const fetchReports = useCallback(async () => {
    if (user) {
      try {
        const userReports = await getReportsByUserId(user.uid);
        setReports(userReports);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      }
    }
  }, [user]);

  return {
    reports,
    fetchReports,
  };
}
