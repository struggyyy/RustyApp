/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2026, @struggyyy                    *
 *                                                                         *
 *                              Project: Rusty                             *
 *                                                                         *
 *                         All Rights Reserved                             *
 *                                                                         *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *                                                                         *
 ************************************************************************** */

// External imports
import { renderHook, act } from "@testing-library/react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

// Internal imports
import { useAuthActions } from "../useAuthActions";

// Mock Firebase
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(() => ({})),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendEmailVerification: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock("@/lib/firebase/firebase", () => ({
  auth: {
    currentUser: { email: "test@example.com", emailVerified: false },
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("useAuthActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("signUp creates user and sends verification email", async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: { email: "new@example.com" },
    });
    (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuthActions());

    await result.current.signUp("new@example.com", "password123");

    expect(createUserWithEmailAndPassword).toHaveBeenCalled();
    expect(sendEmailVerification).toHaveBeenCalled();
  });

  it("logIn calls signInWithEmailAndPassword", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: { email: "test@example.com" },
    });

    const { result } = renderHook(() => useAuthActions());

    await result.current.logIn("test@example.com", "password123");

    expect(signInWithEmailAndPassword).toHaveBeenCalled();
  });

  it("handles signUp errors correctly", async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
      code: "auth/email-already-in-use",
    });

    const { result } = renderHook(() => useAuthActions());

    await expect(
      result.current.signUp("taken@example.com", "password123"),
    ).rejects.toThrow("auth.emailAlreadyInUse");
  });
});
