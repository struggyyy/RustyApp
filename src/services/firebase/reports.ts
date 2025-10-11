import {
  addDoc,
  collection,
  GeoPoint,
  serverTimestamp,
  Timestamp,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase"; // Assuming 'db' and 'storage' are exported from your main firebase config
import { Report } from "../../types/reports";

/**
 * Uploads an image to Firebase Storage for a specific report.
 * @param imageUri The local URI of the image file.
 * @param userId The ID of the user uploading the image.
 * @param fileName The unique file name for the image.
 * @returns The public download URL of the uploaded image.
 */
export const uploadReportImage = (
  imageUri: string,
  userId: string,
  fileName: string
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("uploadReportImage: Starting upload process for:", imageUri);

      // ***** THIS IS THE CRITICAL CHANGE! *****
      // Replace the entire XMLHttpRequest block with this fetch approach.
      const response = await fetch(imageUri);
      const blob: Blob = await response.blob();
      // ***************************************

      console.log("uploadReportImage: Blob created from imageUri using fetch.");

      const storageRef = ref(storage, `reports/${userId}/${fileName}`);
      const metadata = { contentType: "image/jpeg" };

      console.log("uploadReportImage: Calling uploadBytesResumable...");
      const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
          // You can use this progress to update a UI indicator in your app
        },
        (error) => {
          // No need to close the blob when using fetch.blob()
          console.error("Upload failed:", error);
          if ((error as any).serverResponse) {
            console.error("Server response:", (error as any).serverResponse);
          }
          reject(new Error("Image upload failed."));
        },
        async () => {
          try {
            console.log(
              "uploadReportImage: Upload complete! Getting download URL..."
            );
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log(
              "uploadReportImage: Download URL received:",
              downloadURL
            );
            resolve(downloadURL);
          } catch (error) {
            console.error(
              "Error getting download URL after successful upload:",
              error
            );
            reject(
              new Error("Image uploaded, but failed to get download URL.")
            );
          }
        }
      );
    } catch (error) {
      console.error("Error preparing image for upload or during fetch:", error);
      reject(new Error("Image could not be prepared for upload."));
    }
  });
};

/**
 * Creates a new report document in Firestore.
 * @param reportData An object containing the report details.
 * @returns The newly created report document data.
 */
export const createReport = async (reportData: {
  userId: string;
  description: string;
  location: { latitude: number; longitude: number };
  imageUrl: string;
}): Promise<Report> => {
  try {
    const docRef = await addDoc(collection(db, "reports"), {
      userId: reportData.userId,
      description: reportData.description,
      location: new GeoPoint(
        reportData.location.latitude,
        reportData.location.longitude
      ),
      imageUrl: reportData.imageUrl,
      createdAt: serverTimestamp(),
    });

    console.log("Report created with ID: ", docRef.id);

    // The returned object conforms to the Report type, assuming serverTimestamp() will be resolved.
    return {
      ...reportData,
      id: docRef.id,
      createdAt: Timestamp.now(), // Use a client-side timestamp for immediate feedback
      location: new GeoPoint(
        reportData.location.latitude,
        reportData.location.longitude
      ),
    } as Report;
  } catch (error) {
    console.error("Error creating report:", error);
    throw new Error("Report could not be created.");
  }
};

/**
 * Fetches all reports submitted by a specific user.
 * @param userId The ID of the user whose reports are to be fetched.
 * @returns A promise that resolves to an array of the user's reports.
 */
export const getReportsByUserId = async (userId: string): Promise<Report[]> => {
  try {
    const reportsRef = collection(db, "reports");
    const q = query(
      reportsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const reports: Report[] = [];

    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() } as Report);
    });

    return reports;
  } catch (error) {
    console.error("Error fetching user reports:", error);
    throw new Error("Could not fetch reports.");
  }
};

/**
 * Deletes a single image from Firebase Storage.
 * @param imageUrl The full URL of the image to delete.
 */
export const deleteReportImage = async (imageUrl: string) => {
  if (!imageUrl) return; // Do nothing if the URL is not provided

  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    // If the image doesn't exist, we don't need to throw an error.
    if (error.code === 'storage/object-not-found') {
      console.warn(`Image at ${imageUrl} not found, but proceeding.`);
    } else {
      console.error(`Failed to delete image at ${imageUrl}:`, error);
      throw error; // Re-throw other errors
    }
  }
};

/**
 * Deletes a report document from Firestore and its associated image from Storage.
 * @param reportId The ID of the report to delete.
 * @param imageUrl The URL of the image associated with the report.
 */
/**
 * Fetches all reports from the database, ordered by creation date.
 * Intended for admin use.
 * @returns A promise that resolves to an array of all reports.
 */
export const getAllReports = async (): Promise<Report[]> => {
  try {
    const reportsRef = collection(db, "reports");
    const q = query(reportsRef, orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(q);
    const reports: Report[] = [];

    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() } as Report);
    });

    return reports;
  } catch (error) {
    console.error("Error fetching all reports:", error);
    throw new Error("Could not fetch all reports.");
  }
};

export const deleteReport = async (reportId: string, imageUrl: string) => {
  if (!reportId) {
    throw new Error('Report ID is required to delete a report.');
  }

  try {
    // Delete the image from Storage first
    await deleteReportImage(imageUrl);

    // Then delete the report document from Firestore
    const reportDocRef = doc(db, 'reports', reportId);
    await deleteDoc(reportDocRef);

    console.log(`Report ${reportId} and associated image deleted successfully.`);
  } catch (error) {
    console.error('Error deleting report:', error);
    throw new Error('Failed to delete report. Please check logs for details.');
  }
};
