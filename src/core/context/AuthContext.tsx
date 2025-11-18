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
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useMemo,
} from "react";

// External libraries
import { User, onAuthStateChanged } from "firebase/auth";

// Internal imports
import { auth, db } from "../../lib/firebase/firebase";
import { getDoc, doc } from "firebase/firestore";
import { ReportStatus } from "../../shared/types/reports";
import { usePushNotifications } from "../../shared/hooks/auth/usePushNotifications";
import { useProfileManagement } from "../../shared/hooks/profile/useProfileManagement";
import { useAuthActions } from "../../shared/hooks/auth/useAuthActions";
import { useAccountDeletion } from "../../shared/hooks/auth/useAccountDeletion";

// Define the shape of the user profile data stored in Firestore
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string | null;
  phoneNumber?: string | null;
  profileImage?: string | null;
  createdAt: any;
  updatedAt?: any;
  role?: "user" | "admin";
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    haptics: boolean;
  };
  pushToken?: string;
  language?: string;
  points?: number;
  adminPreferences?: {
    selectedStatuses?: ReportStatus[];
    maxDistance?: number;
  };
}

// Define the shape of the Auth Context state
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  profileLoaded: boolean;
  signUp: (
    email: string,
    password: string,
    nickname: string,
    language?: "en" | "pl"
  ) => Promise<User | null>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: (router: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  signInWithEmailLink: (email: string) => Promise<void>;
  handleSignInWithLink: (url: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateUserAuth: (updates: {
    displayName?: string;
    photoURL?: string;
    email?: string;
  }) => Promise<void>;
  uploadProfileImage: (
    userId: string,
    fileUri: string
  ) => Promise<string | undefined>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component for managing authentication state
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Core authentication state
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [profileLoaded, setProfileLoaded] = useState<boolean>(false);

  // Initialize modular hooks for different authentication concerns
  const { registerForPushNotifications } = usePushNotifications();
  const {
    createInitialProfile,
    updateUserProfile: updateProfileData,
    updateUserAuth: performUpdateUserAuth,
    uploadProfileImage: uploadImage,
  } = useProfileManagement();
  const {
    signUp: performSignUp,
    logIn: performLogIn,
    logOut: performLogOut,
    resetPassword: performResetPassword,
    sendVerificationEmail: performSendVerificationEmail,
    signInWithEmailLink: performSignInWithEmailLink,
    handleSignInWithLink: performHandleSignInWithLink,
  } = useAuthActions();
  const { deleteAccount: performDeleteAccount } = useAccountDeletion();

  // Listen to Firebase auth state changes and sync profile data
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        await firebaseUser.reload();
        firebaseUser = auth.currentUser;
      }

      setUser(firebaseUser);

      if (firebaseUser) {
        setLoading(true);
        setError(null);
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userProfile = docSnap.data() as UserProfile;
            if (isMounted) {
              setProfile(userProfile);
              setProfileLoaded(true);

              if (userProfile.role === "admin") {
                setIsAdmin(true);
              } else {
                setIsAdmin(false);
              }

              registerForPushNotifications(userProfile, firebaseUser.uid);
            }
          } else {
            if (isMounted) {
              const newProfile = await createInitialProfile(firebaseUser);
              setProfile(newProfile);
              setProfileLoaded(true);
            }
          }
        } catch (fetchError: any) {
          console.error("Profile loading error:", fetchError);
          if (isMounted) {
            setError(fetchError.message || "Failed to load profile data.");
            setProfile(null);
            setProfileLoaded(false);
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        if (isMounted) {
          setProfile(null);
          setIsAdmin(false);
          setProfileLoaded(false);
          setLoading(false);
        }
      }

      if (initialLoading) {
        if (isMounted) setInitialLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Authentication action handlers - wrap modular hook functions with loading states

  // Create new user account and initial profile
  const signUp = async (
    email: string,
    password: string,
    nickname: string,
    language?: "en" | "pl"
  ): Promise<User | null> => {
    // Create a new user account and initialize their profile
    setLoading(true);
    setError(null);
    try {
      const newUser = await performSignUp(email, password, nickname, language);
      if (newUser) {
        const newProfile = await createInitialProfile(
          newUser,
          nickname,
          language
        );
        setProfile(newProfile);
        setProfileLoaded(true);
      }
      return newUser;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Sign in existing user
  const logIn = async (email: string, password: string): Promise<void> => {
    // Authenticate an existing user
    setLoading(true);
    setError(null);
    try {
      await performLogIn(email, password);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Sign out current user and navigate to login
  const logOut = async (router: any) => {
    // Sign out the current user and navigate to the login page
    setLoading(true);
    setError(null);
    try {
      await performLogOut(router);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Send password reset email
  const resetPassword = async (email: string) => {
    // Send a password reset email to the user
    setLoading(true);
    setError(null);
    try {
      await performResetPassword(email);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Send email verification to current user
  const sendVerificationEmail = async (): Promise<void> => {
    // Send an email verification to the current user
    const targetUser = auth.currentUser;
    if (!targetUser) {
      setError("No user is currently logged in.");
      throw new Error("No user logged in.");
    }
    if (targetUser.emailVerified) {
      setError("Your email is already verified.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await performSendVerificationEmail();
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Send sign-in link to email for passwordless authentication
  const signInWithEmailLink = async (email: string): Promise<void> => {
    // Send a sign-in link to the user's email for passwordless authentication
    setLoading(true);
    setError(null);
    try {
      await performSignInWithEmailLink(email);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Complete sign-in with email link
  const handleSignInWithLink = async (url: string): Promise<void> => {
    // Complete the sign-in process with the email link
    setLoading(true);
    setError(null);
    try {
      await performHandleSignInWithLink(url);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile data in Firestore
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    // Update the user's profile data in Firestore
    if (!user) {
      setError("Not authenticated");
      throw new Error("User not authenticated for profile update.");
    }
    setLoading(true);
    setError(null);
    try {
      await updateProfileData(user.uid, updates, setProfile);
    } catch (e: any) {
      setError(e.message || "Failed to update profile.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Update Firebase Auth user details (displayName, photoURL, email)
  const updateUserAuth = async (updates: {
    displayName?: string;
    photoURL?: string;
    email?: string;
  }) => {
    // Update the user's Firebase Auth details
    if (!auth.currentUser) {
      setError("Not authenticated");
      throw new Error("User not authenticated for auth update.");
    }
    setLoading(true);
    setError(null);
    try {
      await performUpdateUserAuth(auth.currentUser, updates, setUser);
    } catch (e: any) {
      setError(e.message || "Failed to update authentication details.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Upload and update profile image
  const uploadProfileImage = async (
    userId: string,
    fileUri: string
  ): Promise<string | undefined> => {
    // Upload and update the user's profile image
    if (!userId) throw new Error("User ID is required for upload.");
    setLoading(true);
    setError(null);
    try {
      return await uploadImage(
        userId,
        fileUri,
        (updates) => updateUserAuth(updates),
        (updates) => updateUserProfile(updates)
      );
    } catch (e: any) {
      setError(e.message || "Failed to upload image.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Permanently delete user account and all associated data
  const deleteAccount = async (): Promise<void> => {
    // Permanently delete the user's account and all associated data
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError("No user logged in.");
      throw new Error("No user is currently logged in to delete.");
    }

    setLoading(true);
    setError(null);
    try {
      await performDeleteAccount(currentUser, profile);
    } catch (e: any) {
      // Handle specific error types for better user feedback
      if (e.code === "auth/requires-recent-login") {
        setError("Authentication required for account deletion");
        throw e;
      }

      // Handle storage deletion errors
      if (e.message?.includes("storage") || e.code?.startsWith("storage/")) {
        setError("Failed to delete profile data");
        throw e;
      }

      // Handle Firestore deletion errors
      if (
        e.message?.includes("firestore") ||
        e.code?.startsWith("firestore/")
      ) {
        setError("Failed to delete account records");
        throw e;
      }

      // Generic error with code for i18n
      setError("Account deletion failed");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      initialLoading,
      error,
      isAdmin,
      profileLoaded,
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
    }),
    [user, profile, loading, initialLoading, error, isAdmin, profileLoaded]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
