import { Timestamp, FieldValue } from 'firebase/firestore';

export type ReportStatus = 
  | "submitted"
  | "awaiting_confirmation"
  | "verified"
  | "in_process"
  | "removed"
  | "recycled";

export interface StatusHistoryEntry {
  status: ReportStatus;
  timestamp: Timestamp | FieldValue; // Firestore Timestamp or ServerTimestamp
  note?: string;
}

export interface Report {
  id?: string; // Firestore document ID, optional before creation
  userId: string;
  images: string[]; // Array of URLs pointing to Firebase Storage
  description?: string;
  vehicleDetails?: {
    make?: string;
    model?: string;
    color?: string;
    condition?: string;
  };
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  suspiciousTraits?: string[]; // e.g., ["flat_tires", "visible_rust", "expired_tags"]
  submittedAt: Timestamp | FieldValue;
  lastUpdatedAt?: Timestamp | FieldValue;
  status: ReportStatus;
  statusHistory: StatusHistoryEntry[];
  verificationScore?: number; // Optional AI score
  authorityId?: string; // ID of assigned authority (if applicable)
}

// Example Usage (not part of the file, just for illustration):
// const newReport: Omit<Report, 'id'> = {
//   userId: 'user123',
//   images: ['url1', 'url2'],
//   description: 'Rusty sedan',
//   location: { lat: 40.7, lng: -74.0, address: '123 Main St' },
//   submittedAt: serverTimestamp(), // Use serverTimestamp() on creation/update
//   status: 'submitted',
//   statusHistory: [
//     { status: 'submitted', timestamp: serverTimestamp(), note: 'Initial report' }
//   ]
// }; 