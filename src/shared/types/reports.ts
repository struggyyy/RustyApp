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
// External libraries
import { GeoPoint, Timestamp } from "firebase/firestore";

export type ReportStatus = "Submitted" | "Accepted" | "Completed" | "Canceled";

export const reportStatuses: ReportStatus[] = [
  "Submitted",
  "Accepted",
  "Completed",
  "Canceled",
];

export interface Report {
  id: string; // The document ID
  userId: string; // ID of the user who created the report
  description: string; // User-provided description of the reported issue
  location: GeoPoint; // Firebase GeoPoint for precise location coordinates
  imageUrl: string; // URL of the uploaded image in Firebase Storage
  createdAt: Timestamp; // Firestore timestamp of when the report was created
  status: ReportStatus; // Current status of the report (Submitted/Accepted/Completed/Canceled)
  points: number; // Points awarded to the user for this report
  userEmail?: string; // Email of the user who created the report (for admin view)
}
