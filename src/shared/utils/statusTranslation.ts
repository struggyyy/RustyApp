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
// Internal imports
import { ReportStatus } from "@/shared/types/reports";

// Maps report status values to translation keys
export const getStatusTranslationKey = (
  status: ReportStatus | string | undefined,
): string => {
  const safeStatus = status as ReportStatus;

  switch (safeStatus) {
    case "Submitted":
      return "reports.statusSubmitted";
    case "Accepted":
      return "reports.statusAccepted";
    case "Completed":
      return "reports.statusCompleted";
    case "Canceled":
      return "reports.statusCanceled";
    default:
      return "reports.statusSubmitted";
  }
};

// Maps report status values to note translation keys
export const getStatusNoteTranslationKey = (
  status: ReportStatus | string | undefined,
): string => {
  const safeStatus = status as ReportStatus;

  switch (safeStatus) {
    case "Submitted":
      return "reports.reportSubmittedNote";
    case "Accepted":
      return "reports.reportAcceptedNote";
    case "Completed":
      return "reports.reportCompletedNote";
    case "Canceled":
      return "reports.reportCanceledNote";
    default:
      return "reports.reportSubmittedNote";
  }
};
