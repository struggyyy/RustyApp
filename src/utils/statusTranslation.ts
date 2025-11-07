import { ReportStatus } from '../types/reports';

/**
 * Normalizes status to new format (without "Report " prefix)
 * Handles both old format ("Report submitted") and new format ("Submitted")
 */
const normalizeStatus = (status: string | undefined): ReportStatus => {
  if (!status) return 'Submitted';
  
  // If it's already in new format, return as is
  if (['Submitted', 'Accepted', 'Completed', 'Canceled'].includes(status)) {
    return status as ReportStatus;
  }
  
  // Convert old format to new format
  const normalized = status.replace('Report ', '');
  const capitalized = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
  
  // Map to valid status
  switch (capitalized) {
    case 'Submitted':
      return 'Submitted';
    case 'Accepted':
      return 'Accepted';
    case 'Completed':
      return 'Completed';
    case 'Canceled':
      return 'Canceled';
    default:
      return 'Submitted';
  }
};

/**
 * Maps report status values to translation keys
 * @param status - The report status from Firebase (old or new format)
 * @returns Translation key for the status
 */
export const getStatusTranslationKey = (status: ReportStatus | string | undefined): string => {
  const normalizedStatus = normalizeStatus(status as string);

  switch (normalizedStatus) {
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
 * @param status - The report status from Firebase (old or new format)
 * @returns Translation key for the status note
 */
export const getStatusNoteTranslationKey = (status: ReportStatus | string | undefined): string => {
  const normalizedStatus = normalizeStatus(status as string);

  switch (normalizedStatus) {
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

/**
 * Gets the color for a report status
 * @param status - The report status (old or new format)
 * @returns Color hex string
 */
export const getStatusColor = (status: ReportStatus | string | undefined): string => {
  const normalizedStatus = normalizeStatus(status as string);

  switch (normalizedStatus) {
    case 'Submitted':
      return '#1976D2'; // Blue
    case 'Accepted':
      return '#00796B'; // Teal
    case 'Completed':
      return '#2E7D32'; // Green
    case 'Canceled':
      return '#C62828'; // Distinctive red
    default:
      return '#333333';
  }
};
