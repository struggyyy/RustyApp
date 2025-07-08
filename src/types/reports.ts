import { GeoPoint, Timestamp } from 'firebase/firestore';

export interface Report {
  id: string; // The document ID
  userId: string; // ID of the user who created the report
  description: string;
  location: GeoPoint; // Firebase GeoPoint for location
  imageUrl: string; // URL of the image in Firebase Storage
  createdAt: Timestamp; // Timestamp of when the report was created
  status?: string; // e.g., 'Pending', 'In Progress', 'Resolved'
  points?: string; // e.g., '+100p'
}
