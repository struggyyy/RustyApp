import { ReportStatus } from '../types/reports';

/**
 * Maps report status values to translation keys
 * @param status - The report status from Firebase
 * @returns Translation key for the status
 */
export const getStatusTranslationKey = (status: ReportStatus | string | undefined): string => {
  const safeStatus = status as ReportStatus;

  switch (safeStatus) {
    case 'Submitted':
      return 'reports.statusSubmitted';
    case 'Accepted':
      return 'reports.statusAccepted';
    case 'Completed':
      return 'reports.statusCompleted';
    case 'Canceled':
      return 'reports.statusCanceled';
    default:
      return 'reports.statusSubmitted';
  }
};

/**
 * Maps report status values to note translation keys
 * @param status - The report status from Firebase
 * @returns Translation key for the status note
 */
export const getStatusNoteTranslationKey = (status: ReportStatus | string | undefined): string => {
  const safeStatus = status as ReportStatus;

  switch (safeStatus) {
    case 'Submitted':
      return 'reports.reportSubmittedNote';
    case 'Accepted':
      return 'reports.reportAcceptedNote';
    case 'Completed':
      return 'reports.reportCompletedNote';
    case 'Canceled':
      return 'reports.reportCanceledNote';
    default:
      return 'reports.reportSubmittedNote';
  }
};

