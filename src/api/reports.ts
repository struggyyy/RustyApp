import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  FieldValue
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Report, StatusHistoryEntry, ReportStatus } from '../types/reportTypes'; // Import the types

const REPORTS_COLLECTION = 'reports';

// Helper to convert Firestore doc to Report object
const docToReport = (doc: QueryDocumentSnapshot<DocumentData>): Report => {
  const data = doc.data();
  // Basic conversion, handle potential missing fields and timestamp conversion
  return {
    id: doc.id,
    userId: data.userId,
    images: data.images || [],
    description: data.description,
    vehicleDetails: data.vehicleDetails,
    location: data.location,
    suspiciousTraits: data.suspiciousTraits,
    // Convert Firestore Timestamps to JS Date objects if needed, or keep as Timestamps
    submittedAt: data.submittedAt, // Keep as Timestamp or FieldValue
    lastUpdatedAt: data.lastUpdatedAt,
    status: data.status,
    statusHistory: data.statusHistory || [],
    verificationScore: data.verificationScore,
    authorityId: data.authorityId,
  } as Report;
};

/**
 * Adds a new report to Firestore.
 * @param reportData - The report data (without id, with FieldValue for timestamps).
 * @returns The ID of the newly created report.
 */
export const addReport = async (reportData: Omit<Report, 'id'>): Promise<string> => {
  try {
    console.log('[API/Reports] Adding report for user:', reportData.userId);
    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
        ...reportData,
        // Ensure timestamps are set using serverTimestamp()
        submittedAt: reportData.submittedAt || serverTimestamp(),
        lastUpdatedAt: serverTimestamp(),
        // Ensure status history has server timestamps
        statusHistory: reportData.statusHistory.map(entry => ({
            ...entry,
            timestamp: entry.timestamp || serverTimestamp()
        }))
    });
    console.log('[API/Reports] Report added with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('[API/Reports] Error adding report:', error);
    throw new Error(`Failed to add report: ${error.message}`);
  }
};

/**
 * Fetches all reports submitted by a specific user.
 * @param userId - The ID of the user whose reports to fetch.
 * @returns An array of Report objects.
 */
export const getUserReports = async (userId: string): Promise<Report[]> => {
  try {
    console.log(`[API/Reports] Fetching reports for user: ${userId}`);
    const q = query(
      collection(db, REPORTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc') // Order by most recent
    );
    const querySnapshot = await getDocs(q);
    const reports = querySnapshot.docs.map(docToReport);
    console.log(`[API/Reports] Found ${reports.length} reports for user ${userId}`);
    return reports;
  } catch (error: any) {
    console.error('[API/Reports] Error fetching user reports:', error);
    throw new Error(`Failed to fetch reports: ${error.message}`);
  }
};

/**
 * Fetches a single report by its ID.
 * @param reportId - The ID of the report to fetch.
 * @returns The Report object or null if not found.
 */
export const getReportById = async (reportId: string): Promise<Report | null> => {
  try {
    console.log(`[API/Reports] Fetching report with ID: ${reportId}`);
    const docRef = doc(db, REPORTS_COLLECTION, reportId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log(`[API/Reports] Report found: ${reportId}`);
      return docToReport(docSnap);
    } else {
      console.warn(`[API/Reports] Report not found: ${reportId}`);
      return null;
    }
  } catch (error: any) {
    console.error('[API/Reports] Error fetching report by ID:', error);
    throw new Error(`Failed to fetch report: ${error.message}`);
  }
};

/**
 * Updates specific fields of a report.
 * @param reportId - The ID of the report to update.
 * @param updates - An object containing the fields to update.
 *                  Use FieldValue for timestamps (e.g., { lastUpdatedAt: serverTimestamp() }).
 */
export const updateReport = async (reportId: string, updates: Partial<Report> & { lastUpdatedAt?: FieldValue }) => {
  try {
    console.log(`[API/Reports] Updating report: ${reportId}`, updates);
    const docRef = doc(db, REPORTS_COLLECTION, reportId);
    await updateDoc(docRef, {
        ...updates,
        lastUpdatedAt: updates.lastUpdatedAt || serverTimestamp(), // Ensure lastUpdatedAt is always updated
    });
    console.log(`[API/Reports] Report updated successfully: ${reportId}`);
  } catch (error: any) {
    console.error('[API/Reports] Error updating report:', error);
    throw new Error(`Failed to update report: ${error.message}`);
  }
};

/**
 * Updates the status of a report and adds an entry to the status history.
 * @param reportId - The ID of the report to update.
 * @param newStatus - The new status for the report.
 * @param note - An optional note for the status change.
 */
export const updateReportStatus = async (reportId: string, newStatus: ReportStatus, note?: string) => {
    try {
        console.log(`[API/Reports] Updating status for report ${reportId} to ${newStatus}`);
        const report = await getReportById(reportId);
        if (!report) {
            throw new Error(`Report not found: ${reportId}`);
        }

        const newHistoryEntry: StatusHistoryEntry = {
            status: newStatus,
            timestamp: serverTimestamp(),
            ...(note && { note }),
        };

        const updatedHistory = [...report.statusHistory, newHistoryEntry];

        await updateReport(reportId, {
            status: newStatus,
            statusHistory: updatedHistory,
            lastUpdatedAt: serverTimestamp()
        });
        console.log(`[API/Reports] Status updated successfully for report: ${reportId}`);

    } catch (error: any) {
        console.error('[API/Reports] Error updating report status:', error);
        throw new Error(`Failed to update report status: ${error.message}`);
    }
};


/**
 * Deletes a report from Firestore.
 * @param reportId - The ID of the report to delete.
 */
export const deleteReport = async (reportId: string): Promise<void> => {
  try {
    console.log(`[API/Reports] Deleting report: ${reportId}`);
    const docRef = doc(db, REPORTS_COLLECTION, reportId);
    await deleteDoc(docRef);
    console.log(`[API/Reports] Report deleted successfully: ${reportId}`);
  } catch (error: any) {
    console.error('[API/Reports] Error deleting report:', error);
    throw new Error(`Failed to delete report: ${error.message}`);
  }
};

// Potential future functions:
// - getReportsByLocation(lat, lng, radius)
// - getReportsByStatus(status)
// - assignReportToAuthority(reportId, authorityId) 