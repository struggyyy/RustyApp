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

// Hook return type interface
export interface UseReportsReturn {
  reports: Report[];
  fetchReports: () => Promise<void>;
}

// Main hook function
export function useReports(): UseReportsReturn {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);

  // Fetch user reports from Firebase
  const fetchReports = useCallback(async () => {
    if (user) {
      try {
        const userReports = await getReportsByUserId(user.uid);
        setReports(userReports);
      } catch (err) {
        // Silently fail
      }
    }
  }, [user]);

  // Hook return interface
  return {
    reports,
    fetchReports,
  };
}
