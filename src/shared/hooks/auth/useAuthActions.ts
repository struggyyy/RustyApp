/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2026, @struggyyy                    *
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
import * as SecureStore from "expo-secure-store";

// Internal imports
import { auth } from "@/lib/firebase/firebase";

// Hook for authentication actions (signup, login, logout, password reset, etc.)
export const useAuthActions = () => {
  // Sign up new user with email and password
  const signUp = async (
    email: string,
    password: string,
  ): Promise<User | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const newUser = userCredential.user;

      // Send verification email
      try {
        await sendEmailVerification(newUser);
      } catch (verificationError: any) {
        console.error(
          "[useAuthActions] Failed to send verification email:",
          verificationError,
        );
        throw new Error("auth.verificationError");
      }

      return newUser; // Return new user
    } catch (e: any) {
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
    } catch (e: any) {
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
      await signOut(auth);
    } catch (e: any) {
      throw new Error(e.message || "auth.logoutError");
    }
  };

  // Send password reset email
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e: any) {
      if (e.code === "auth/user-not-found") {
        throw new Error("auth.userNotFound");
      } else if (e.code === "auth/invalid-email") {
        throw new Error("auth.invalidEmail");
      } else if (e.code === "auth/network-request-failed") {
        throw new Error("auth.networkError");
      } else if (e.code === "auth/too-many-requests") {
        throw new Error("auth.tooManyRequests");
      } else {
        throw new Error(e.message || "auth.passwordResetError");
      }
    }
  };

  // Send email verification to current user
  const sendVerificationEmail = async (): Promise<void> => {
    const targetUser = auth.currentUser;
    if (!targetUser) {
      throw new Error("auth.userNotFound");
    }
    if (targetUser.emailVerified) {
      return;
    }

    try {
      await sendEmailVerification(targetUser);
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.code === "auth/too-many-requests") {
        throw new Error("auth.verificationRateLimit");
      } else if (error.code === "auth/network-request-failed") {
        throw new Error("auth.networkError");
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
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      await SecureStore.setItemAsync("emailForSignIn", email);
    } catch (e: any) {
      throw new Error(e.message || "auth.signInLinkError");
    }
  };

  // Handle sign-in with email link
  const handleSignInWithLink = async (url: string): Promise<void> => {
    const { isSignInWithEmailLink } = await import("firebase/auth");

    if (isSignInWithEmailLink(auth, url)) {
      let email = await SecureStore.getItemAsync("emailForSignIn");
      if (!email) {
        const message = "auth.signInEmailNotFound";
        console.error(message);
        throw new Error(message);
      }

      try {
        const userCredential: UserCredential =
          await firebaseSignInWithEmailLink(auth, email, url);
        await SecureStore.deleteItemAsync("emailForSignIn");
      } catch (e: any) {
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
