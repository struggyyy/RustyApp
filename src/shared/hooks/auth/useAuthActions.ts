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
// External imports
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
import AsyncStorage from "@react-native-async-storage/async-storage";

// Internal imports
import { auth } from "../../../lib/firebase/firebase";

// Hook for authentication actions (signup, login, logout, password reset, etc.)
export const useAuthActions = () => {
  // Sign up new user with email and password
  const signUp = async (
    email: string,
    password: string
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
        throw new Error("auth.verificationError");
      }

      return newUser; // Return new user
    } catch (e: any) {
      console.log(
        "[useAuthActions] Sign up error (expected):",
        e.code,
        e.message
      );
      // Map specific errors
      if (e.code === "auth/email-already-in-use") {
        throw new Error("auth.emailAlreadyInUse");
      } else if (e.code === "auth/weak-password") {
        throw new Error("auth.weakPassword");
      } else if (e.code === "auth/invalid-email") {
        throw new Error("auth.invalidEmail");
      } else if (e.code === "auth/network-request-failed") {
        throw new Error("auth.networkError");
      } else {
        throw new Error(e.message || "auth.signupError");
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
      console.log(
        "[useAuthActions] Login error (expected):",
        e.code,
        e.message
      );
      // Map specific errors
      if (
        e.code === "auth/user-not-found" ||
        e.code === "auth/invalid-credential" ||
        e.code === "auth/wrong-password"
      ) {
        throw new Error("auth.loginError");
      } else if (e.code === "auth/invalid-email") {
        throw new Error("auth.invalidEmail");
      } else if (e.code === "auth/too-many-requests") {
        throw new Error("auth.tooManyRequests");
      } else if (e.code === "auth/network-request-failed") {
        throw new Error("auth.networkError");
      } else {
        throw new Error(e.message || "auth.loginFailed");
      }
    }
  };

  // Sign out current user
  const logOut = async () => {
    try {
      console.log("[useAuthActions] Attempting logout...");
      await signOut(auth);
      console.log("[useAuthActions] Logout successful.");
    } catch (e: any) {
      console.log("[useAuthActions] Logout error:", e);
      throw new Error(e.message || "auth.logoutError");
    }
  };

  // Send password reset email
  const resetPassword = async (email: string) => {
    try {
      console.log(`[useAuthActions] Sending password reset email to: ${email}`);
      await sendPasswordResetEmail(auth, email);
      console.log("[useAuthActions] Password reset email sent.");
    } catch (e: any) {
      console.log("[useAuthActions] Password reset error:", e);
      throw new Error(e.message || "auth.passwordResetError");
    }
  };

  // Send email verification to current user
  const sendVerificationEmail = async (): Promise<void> => {
    const targetUser = auth.currentUser;
    if (!targetUser) {
      throw new Error("auth.userNotFound");
    }
    if (targetUser.emailVerified) {
      console.log("[useAuthActions] Email already verified.");
      return;
    }

    try {
      await sendEmailVerification(targetUser);
      console.log("[useAuthActions] Verification email resent successfully.");
    } catch (error: any) {
      console.log(
        "[useAuthActions] Failed to resend verification email:",
        error
      );

      // Handle specific Firebase errors
      if (error.code === "auth/too-many-requests") {
        throw new Error("auth.verificationRateLimit");
      }

      throw new Error("auth.verificationError");
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
      console.log("[useAuthActions] Error sending sign-in link:", e);
      throw new Error(e.message || "auth.signInLinkError");
    }
  };

  // Handle sign-in with email link
  const handleSignInWithLink = async (url: string): Promise<void> => {
    const { isSignInWithEmailLink } = await import("firebase/auth");

    if (isSignInWithEmailLink(auth, url)) {
      let email = await AsyncStorage.getItem("emailForSignIn");
      if (!email) {
        const message = "auth.signInEmailNotFound";
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
        console.log("[useAuthActions] Error signing in with email link:", e);
        throw new Error(e.message || "auth.signInLinkError");
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
