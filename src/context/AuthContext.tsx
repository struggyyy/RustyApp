import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
import { auth, db, storage } from '../services/firebase'; // Import Firebase services
import {
  User, // Firebase User type
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail, // If you need to update email separately
  sendEmailVerification, // Import sendEmailVerification
  deleteUser, // <-- Import deleteUser
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink as firebaseSignInWithEmailLink, // Rename to avoid conflicts
  UserCredential,
  // Add other Firebase Auth methods as needed (e.g., GoogleAuthProvider, signInWithCredential)
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, FirestoreError, deleteDoc } from 'firebase/firestore'; // Firestore for user profiles and deleteDoc
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Firebase Storage for uploads
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of the user profile data stored in Firestore
interface UserProfile {
  id: string;
  email: string;
  displayName?: string | null;
  phoneNumber?: string | null;
  profileImage?: string | null; // URL to the image in Firebase Storage
  createdAt: any; // Use Firestore ServerTimestamp
  updatedAt?: any; // Use Firestore ServerTimestamp
  // Add other profile fields as needed based on CONTEXT.md
  notificationPreferences?: {
    email: boolean;
    push: boolean;
  };
  language?: string;
}

// Define the shape of the Auth Context state
interface AuthContextType {
  user: User | null; // Firebase User object
  profile: UserProfile | null; // User profile from Firestore
  loading: boolean;
  initialLoading: boolean; // Tracks initial auth state check
  error: string | null;
  signUp: (email: string, password: string, nickname: string) => Promise<User | null>; // Return user or null
  logIn: (email: string, password: string) => Promise<void>;
  logOut: (router: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>; // Add function to resend
  signInWithEmailLink: (email: string) => Promise<void>;
  handleSignInWithLink: (url: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateUserAuth: (updates: { displayName?: string, photoURL?: string, email?: string }) => Promise<void>;
  uploadProfileImage: (userId: string, fileUri: string) => Promise<string | undefined>;
  deleteAccount: () => Promise<void>; // <-- Add deleteAccount type
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[AuthContext] Setting up auth state listener...');
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      // Reload user data to get latest emailVerified status if needed
      if (firebaseUser) {
        await firebaseUser.reload();
        firebaseUser = auth.currentUser; // Get potentially updated user data
      }
      console.log(`[AuthContext] onAuthStateChanged fired. User: ${firebaseUser?.uid}, Verified: ${firebaseUser?.emailVerified}`);
      setUser(firebaseUser); // Update state with potentially reloaded user

      if (firebaseUser) {
        // Attempt direct fetch (retry logic removed previously)
        console.log(`[AuthContext] Attempting DIRECT profile fetch for user: ${firebaseUser.uid}`);
        setLoading(true);
        setError(null);
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            console.log('[AuthContext] Direct fetch: Profile found.');
            if (isMounted) setProfile(docSnap.data() as UserProfile);
          } else {
            console.warn(`[AuthContext] Direct fetch: No profile found. Creating initial.`);
            if (isMounted) await createInitialProfile(firebaseUser); // Ensure createInitialProfile exists
          }
        } catch (fetchError: any) {
          console.error("[AuthContext] Direct fetch failed:", fetchError);
          if (isMounted) {
            setError(fetchError.message || 'Failed to load profile data.');
            setProfile(null);
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        // No user, clear profile
        if (isMounted) setProfile(null);
      }

      // *** Crucially, set initialLoading to false AFTER the first check completes ***
      if (initialLoading) {
        console.log('[AuthContext] Initial auth check complete.');
        if (isMounted) setInitialLoading(false);
      }
    });

    return () => {
      console.log('[AuthContext] Cleaning up auth state listener.');
      isMounted = false;
      unsubscribe();
    };
  }, []); // Dependency array is empty, runs once on mount

  // Function to create initial profile (ensure this exists)
  const createInitialProfile = async (userToCreateFor: User, nickname?: string) => {
    console.log(`[AuthContext] Creating initial profile for: ${userToCreateFor.uid}`);
    const userDocRef = doc(db, 'users', userToCreateFor.uid);
    const initialProfileData: UserProfile = {
      id: userToCreateFor.uid,
      email: userToCreateFor.email || 'Unknown Email',
      displayName: nickname || userToCreateFor.displayName || 'Nickname',
      createdAt: serverTimestamp(),
      notificationPreferences: { email: true, push: true },
      language: 'en',
    };
    try {
      await setDoc(userDocRef, initialProfileData);
      console.log('[AuthContext] Initial user profile created in Firestore.');
      setProfile(initialProfileData); // Set the newly created profile
    } catch (creationError: any) {
      console.error("[AuthContext] Failed to create initial profile:", creationError);
      // Don't set global error maybe, just log it?
      setProfile(null); // Ensure profile is null if creation fails
    }
  };

  // --- Auth Actions ---

  const signUp = async (email: string, password: string, nickname: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[AuthContext] Attempting sign up for: ${email}`);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      console.log('[AuthContext] Sign up successful, user created:', newUser.uid);

      // Create initial profile immediately
      await createInitialProfile(newUser, nickname);

      // Send verification email
      try {
        await sendEmailVerification(newUser);
        console.log('[AuthContext] Verification email sent.');
      } catch (verificationError: any) {
        console.error('[AuthContext] Failed to send verification email:', verificationError);
        setError('Signup successful, but failed to send verification email. Please try logging in and resending.');
      }
      
      return newUser; // Return new user
    } catch (e: any) {
      console.error('[AuthContext] Sign up error:', e.code, e.message);
      // Map specific errors
      if (e.code === 'auth/email-already-in-use') {
        setError('This email address is already registered. Try logging in?');
      } else if (e.code === 'auth/weak-password') {
        setError('Password is too weak (minimum 6 characters).');
      } else if (e.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(e.message || 'Sign up failed. Please try again.');
      }
      return null; // Indicate failure
    } finally {
      setLoading(false);
    }
  };

  const logIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('[AuthContext] Login request successful. Waiting for auth state change.');
    } catch (e: any) {
      console.error('[AuthContext] Login error:', e.code, e.message);
      // Map specific errors
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again or sign up.');
      } else if (e.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (e.code === 'auth/too-many-requests') {
        setError('Access temporarily disabled due to too many failed login attempts. Please reset your password or try again later.');
      } else {
        setError(e.message || 'Login failed. Please check your credentials.');
      }
      throw e; // Re-throw error
    } finally {
      setLoading(false);
    }
  };

  const logOut = async (router: any) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[AuthContext] Attempting logout...');
      await signOut(auth);
      console.log('[AuthContext] Logout successful.');
      if (router) {
        router.replace('/login');
      }
      // Auth state listener handles clearing user and profile
    } catch (e: any) {
      console.error('[AuthContext] Logout error:', e);
      setError(e.message || 'Logout failed.');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[AuthContext] Sending password reset email to: ${email}`);
      await sendPasswordResetEmail(auth, email);
      console.log('[AuthContext] Password reset email sent.');
      // Inform user to check their email
    } catch (e: any) {
      console.error('[AuthContext] Password reset error:', e);
      setError(e.message || 'Password reset failed.');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    const targetUser = auth.currentUser;
    if (!targetUser) {
      setError('No user is currently logged in.');
      throw new Error('No user logged in.');
    }
    if (targetUser.emailVerified) {
      console.log('[AuthContext] Email already verified.');
      setError('Your email is already verified.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendEmailVerification(targetUser);
      console.log('[AuthContext] Verification email resent successfully.');
      // Consider setting a temporary success message if needed
    } catch (error: any) {
      console.error('[AuthContext] Failed to resend verification email:', error);
      setError('Failed to resend verification email. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile data in Firestore
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      setError('Not authenticated');
      throw new Error('User not authenticated for profile update.');
    }
    setLoading(true);
    setError(null);
    try {
      console.log(`[AuthContext] Updating Firestore profile for user: ${user.uid}`, updates);
      const userDocRef = doc(db, 'users', user.uid);
      const updateData = { ...updates, updatedAt: serverTimestamp() };
      await updateDoc(userDocRef, updateData);
      console.log('[AuthContext] Firestore profile updated successfully.');
      // Re-fetch or optimistically update local profile state
      setProfile(prev => prev ? { ...prev, ...updateData } : null);
    } catch (e: any) {
      console.error('[AuthContext] Firestore profile update error:', e);
      setError(e.message || 'Failed to update profile.');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Update user auth details (e.g., displayName, photoURL, email)
  // Note: Updating email requires re-authentication sometimes.
  const updateUserAuth = async (updates: { displayName?: string | null, photoURL?: string | null, email?: string }) => {
    if (!auth.currentUser) {
      setError('Not authenticated');
      throw new Error('User not authenticated for auth update.');
    }
    setLoading(true);
    setError(null);
    try {
      console.log(`[AuthContext] Updating Firebase Auth profile for user: ${auth.currentUser.uid}`, updates);
      // Separate email update if provided, as it might require verification
      if (updates.email && updates.email !== auth.currentUser.email) {
        // Consider adding verification flow here if needed
        await updateEmail(auth.currentUser, updates.email);
        console.log('[AuthContext] User email update initiated/completed.');
        // Remove email from the profile update object
        delete updates.email;
      }

      // Update displayName and photoURL if present
      if (updates.displayName !== undefined || updates.photoURL !== undefined) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName !== undefined ? updates.displayName : auth.currentUser.displayName,
          photoURL: updates.photoURL !== undefined ? updates.photoURL : auth.currentUser.photoURL,
        });
        console.log('[AuthContext] Firebase Auth profile (displayName/photoURL) updated.');
      }

      // Optimistically update local user state or wait for onAuthStateChanged
      setUser(auth.currentUser); // Refresh local user state
    } catch (e: any) {
      console.error('[AuthContext] Firebase Auth update error:', e);
      setError(e.message || 'Failed to update authentication details.');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Upload profile image to Firebase Storage and update profile URL
  const uploadProfileImage = async (userId: string, fileUri: string): Promise<string | undefined> => {
    if (!userId) throw new Error('User ID is required for upload.');
    setLoading(true);
    setError(null);

    try {
      console.log(`[AuthContext] Uploading profile image for user: ${userId}`);
      // Create blob from file URI (requires platform-specific logic or a helper function)
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // Define storage path
      const fileExtension = fileUri.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `profile_images/${fileName}`);

      console.log(`[AuthContext] Uploading to storage path: ${storageRef.fullPath}`);
      // Upload file
      const snapshot = await uploadBytes(storageRef, blob);
      console.log('[AuthContext] Image uploaded successfully:', snapshot.metadata.fullPath);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('[AuthContext] Image download URL:', downloadURL);

      // Update user profile (both Auth and Firestore)
      await updateUserAuth({ photoURL: downloadURL });
      await updateUserProfile({ profileImage: downloadURL });

      console.log('[AuthContext] Profile image URL updated in Auth and Firestore.');
      return downloadURL;

    } catch (e: any) {
      console.error('[AuthContext] Profile image upload error:', e);
      setError(e.message || 'Failed to upload image.');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmailLink = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);
    const actionCodeSettings = {
      url: 'https://rusty-7faf0.firebaseapp.com/__/auth/action',
      handleCodeInApp: true,
      iOS: {
        bundleId: 'com.anonymous.rusty'
      },
      android: {
        packageName: 'com.anonymous.rusty',
        installApp: true,
        minimumVersion: '1'
      },
    };

    try {
      console.log(`[AuthContext] Sending sign-in link to: ${email}`);
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      await AsyncStorage.setItem('emailForSignIn', email);
      console.log('[AuthContext] Sign-in link sent successfully.');
    } catch (e: any) {
      console.error('[AuthContext] Error sending sign-in link:', e);
      setError(e.message || 'Failed to send sign-in link.');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithLink = async (url: string): Promise<void> => {
    if (isSignInWithEmailLink(auth, url)) {
      let email = await AsyncStorage.getItem('emailForSignIn');
      if (!email) {
        const message = 'Sign-in email not found. Please try the sign-in process again on this device.';
        console.error(message);
        setError(message);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log(`[AuthContext] Attempting to sign in with link for email: ${email}`);
        const userCredential: UserCredential = await firebaseSignInWithEmailLink(auth, email, url);
        console.log('[AuthContext] Successfully signed in with email link:', userCredential.user.uid);
        await AsyncStorage.removeItem('emailForSignIn');
      } catch (e: any) {
        console.error('[AuthContext] Error signing in with email link:', e);
        setError(e.message || 'Failed to sign in with email link.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Delete user account and associated data
  const deleteAccount = async (): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('No user logged in.');
      throw new Error('No user is currently logged in to delete.');
    }

    setLoading(true);
    setError(null);
    console.log(`[AuthContext] Starting account deletion for user: ${currentUser.uid}`);

    try {
      // 1. Delete Firestore document
      const userDocRef = doc(db, 'users', currentUser.uid);
      try {
        await deleteDoc(userDocRef);
        console.log(`[AuthContext] Firestore document deleted for user: ${currentUser.uid}`);
      } catch (firestoreError: any) {
        console.error(`[AuthContext] Failed to delete Firestore document for user ${currentUser.uid}:`, firestoreError);
        // Decide if we should proceed with Auth deletion even if Firestore fails
        // For now, we'll throw to stop the process
        throw new Error('Failed to delete user data. Please try again.');
      }

      // 2. Delete Firebase Auth user
      try {
        await deleteUser(currentUser);
        console.log(`[AuthContext] Firebase Auth user deleted successfully: ${currentUser.uid}`);
        // State will update via onAuthStateChanged listener
      } catch (authError: any) {
        console.error(`[AuthContext] Failed to delete Firebase Auth user ${currentUser.uid}:`, authError.code, authError.message);
        if (authError.code === 'auth/requires-recent-login') {
          setError('This operation requires recent login. Please log out and log back in before deleting your account.');
          throw new Error('Please log out and log back in to delete your account.');
        } else {
          setError(authError.message || 'Failed to delete account.');
          throw authError; // Re-throw other auth errors
        }
      }
    } catch (e: any) {
      // Catch errors from Firestore delete or re-thrown Auth errors
      console.error('[AuthContext] Account deletion process failed:', e);
      if (!error) { // Only set error if not already set by specific handlers
        setError(e.message || 'An unexpected error occurred during account deletion.');
      }
      throw e; // Re-throw the final error
    } finally {
      setLoading(false);
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    profile,
    loading,
    initialLoading,
    error,
    signUp,
    logIn,
    logOut,
    resetPassword,
    sendVerificationEmail,
    signInWithEmailLink,
    handleSignInWithLink,
    updateUserProfile,
    updateUserAuth,
    uploadProfileImage,
    deleteAccount,
  }), [user, profile, loading, initialLoading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 