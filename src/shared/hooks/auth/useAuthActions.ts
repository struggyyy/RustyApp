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
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendSignInLinkToEmail,
  signInWithEmailLink as firebaseSignInWithEmailLink,
  UserCredential,
} from "firebase/auth";

// Internal imports
import { auth } from "../../../lib/firebase/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Hook for authentication actions (signup, login, logout, password reset, etc.)
export const useAuthActions = () => {
  // Sign up new user with email and password
  const signUp = async (
    email: string,
    password: string,
    nickname: string,
    language?: "en" | "pl"
  ): Promise<User | null> => {
    try {
      console.log(`[useAuthActions] Attempting sign up for: ${email}`);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;
      console.log(
        "[useAuthActions] Sign up successful, user created:",
        newUser.uid
      );

      // Send verification email
      try {
        await sendEmailVerification(newUser);
        console.log("[useAuthActions] Verification email sent.");
      } catch (verificationError: any) {
        console.error(
          "[useAuthActions] Failed to send verification email:",
          verificationError
        );
        throw new Error(
          "Signup successful, but failed to send verification email. Please try logging in and resending."
        );
      }

      return newUser; // Return new user
    } catch (e: any) {
      console.error("[useAuthActions] Sign up error:", e.code, e.message);
      // Map specific errors
      if (e.code === "auth/email-already-in-use") {
        throw new Error(
          "This email address is already registered. Try logging in?"
        );
      } else if (e.code === "auth/weak-password") {
        throw new Error("Password is too weak (minimum 6 characters).");
      } else if (e.code === "auth/invalid-email") {
        throw new Error("Please enter a valid email address.");
      } else {
        throw new Error(e.message || "Sign up failed. Please try again.");
      }
    }
  };

  // Sign in with email and password
  const logIn = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log(
        "[useAuthActions] Login request successful. Waiting for auth state change."
      );
    } catch (e: any) {
      console.error("[useAuthActions] Login error:", e.code, e.message);
      // Map specific errors
      if (
        e.code === "auth/user-not-found" ||
        e.code === "auth/invalid-credential" ||
        e.code === "auth/wrong-password"
      ) {
        throw new Error(
          "Invalid email or password. Please try again or sign up."
        );
      } else if (e.code === "auth/invalid-email") {
        throw new Error("Please enter a valid email address.");
      } else if (e.code === "auth/too-many-requests") {
        throw new Error(
          "Access temporarily disabled due to too many failed login attempts. Please reset your password or try again later."
        );
      } else {
        throw new Error(
          e.message || "Login failed. Please check your credentials."
        );
      }
    }
  };

  // Sign out current user
  const logOut = async (router: any) => {
    try {
      console.log("[useAuthActions] Attempting logout...");
      await signOut(auth);
      console.log("[useAuthActions] Logout successful.");
      if (router) {
        router.replace("/login");
      }
    } catch (e: any) {
      console.error("[useAuthActions] Logout error:", e);
      throw new Error(e.message || "Logout failed.");
    }
  };

  // Send password reset email
  const resetPassword = async (email: string) => {
    try {
      console.log(`[useAuthActions] Sending password reset email to: ${email}`);
      await sendPasswordResetEmail(auth, email);
      console.log("[useAuthActions] Password reset email sent.");
    } catch (e: any) {
      console.error("[useAuthActions] Password reset error:", e);
      throw new Error(e.message || "Password reset failed.");
    }
  };

  // Send email verification to current user
  const sendVerificationEmail = async (): Promise<void> => {
    const targetUser = auth.currentUser;
    if (!targetUser) {
      throw new Error("No user is currently logged in.");
    }
    if (targetUser.emailVerified) {
      console.log("[useAuthActions] Email already verified.");
      return;
    }

    try {
      await sendEmailVerification(targetUser);
      console.log("[useAuthActions] Verification email resent successfully.");
    } catch (error: any) {
      console.error(
        "[useAuthActions] Failed to resend verification email:",
        error
      );
      throw new Error(
        "Failed to resend verification email. Please try again later."
      );
    }
  };

  // Send sign-in link to email
  const signInWithEmailLink = async (email: string): Promise<void> => {
    const actionCodeSettings = {
      url: "https://rusty-7faf0.firebaseapp.com/__/auth/action",
      handleCodeInApp: true,
      iOS: {
        bundleId: "com.anonymous.rusty",
      },
      android: {
        packageName: "com.anonymous.rusty",
        installApp: true,
        minimumVersion: "1",
      },
    };

    try {
      console.log(`[useAuthActions] Sending sign-in link to: ${email}`);
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      await AsyncStorage.setItem("emailForSignIn", email);
      console.log("[useAuthActions] Sign-in link sent successfully.");
    } catch (e: any) {
      console.error("[useAuthActions] Error sending sign-in link:", e);
      throw new Error(e.message || "Failed to send sign-in link.");
    }
  };

  // Handle sign-in with email link
  const handleSignInWithLink = async (url: string): Promise<void> => {
    const { isSignInWithEmailLink } = await import("firebase/auth");

    if (isSignInWithEmailLink(auth, url)) {
      let email = await AsyncStorage.getItem("emailForSignIn");
      if (!email) {
        const message =
          "Sign-in email not found. Please try the sign-in process again on this device.";
        console.error(message);
        throw new Error(message);
      }

      try {
        console.log(
          `[useAuthActions] Attempting to sign in with link for email: ${email}`
        );
        const userCredential: UserCredential =
          await firebaseSignInWithEmailLink(auth, email, url);
        console.log(
          "[useAuthActions] Successfully signed in with email link:",
          userCredential.user.uid
        );
        await AsyncStorage.removeItem("emailForSignIn");
      } catch (e: any) {
        console.error("[useAuthActions] Error signing in with email link:", e);
        throw new Error(e.message || "Failed to sign in with email link.");
      }
    }
  };

  return {
    signUp,
    logIn,
    logOut,
    resetPassword,
    sendVerificationEmail,
    signInWithEmailLink,
    handleSignInWithLink,
  };
};
