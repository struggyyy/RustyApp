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
// React specific imports
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// External libraries
import * as Haptics from "expo-haptics";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";

interface UseEmailVerificationProps {
  emailToVerify: string | undefined;
}

export const useEmailVerification = ({
  emailToVerify,
}: UseEmailVerificationProps) => {
  const { sendVerificationEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [feedbackKey, setFeedbackKey] = useState("");
  const [isError, setIsError] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Load cooldown from storage on mount
  useEffect(() => {
    const loadCooldown = async () => {
      if (!emailToVerify) return;
      try {
        const normalizedEmail = emailToVerify.trim().toLowerCase();
        const key = `emailResendCooldownExpiry_${normalizedEmail}`;
        const expiryString = await AsyncStorage.getItem(key);

        if (expiryString) {
          const expiryTime = parseInt(expiryString, 10);
          const now = Date.now();
          if (expiryTime > now) {
            const remaining = Math.ceil((expiryTime - now) / 1000);
            setCooldown(remaining);
          } else {
            await AsyncStorage.removeItem(key);
          }
        }
      } catch (e) {
        // Silently fail if cooldown cannot be loaded
      }
    };

    loadCooldown();
  }, [emailToVerify]);

  // Handle cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (emailToVerify) {
              const normalizedEmail = emailToVerify.trim().toLowerCase();
              AsyncStorage.removeItem(
                `emailResendCooldownExpiry_${normalizedEmail}`,
              ).catch(() => {});
            }
            setFeedbackKey((prevKey) =>
              prevKey === "auth.cooldownMessage" ? "" : prevKey,
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown, emailToVerify]);

  // Resend verification email
  const handleResendVerification = async () => {
    if (cooldown > 0) {
      setFeedbackKey("auth.cooldownMessage");
      setIsError(false);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsResending(true);
    setFeedbackKey("");

    try {
      await sendVerificationEmail();
      setFeedbackKey("auth.emailSentSuccess");
      setIsError(false);

      const COOLDOWN_SECONDS = 60;
      setCooldown(COOLDOWN_SECONDS);

      if (emailToVerify) {
        const normalizedEmail = emailToVerify.trim().toLowerCase();
        const expiryTime = Date.now() + COOLDOWN_SECONDS * 1000;
        await AsyncStorage.setItem(
          `emailResendCooldownExpiry_${normalizedEmail}`,
          expiryTime.toString(),
        );
      }
    } catch (err: any) {
      if (err.message === "auth.verificationRateLimit") {
        const COOLDOWN_SECONDS = 60;
        setCooldown(COOLDOWN_SECONDS);
        if (emailToVerify) {
          const normalizedEmail = emailToVerify.trim().toLowerCase();
          const expiryTime = Date.now() + COOLDOWN_SECONDS * 1000;
          AsyncStorage.setItem(
            `emailResendCooldownExpiry_${normalizedEmail}`,
            expiryTime.toString(),
          );
        }
        setFeedbackKey("auth.cooldownMessage");
        setIsError(false);
        return;
      }

      setIsError(true);
      if (err.message) {
        setFeedbackKey(err.message);
      } else {
        setFeedbackKey("auth.verificationError");
      }
    } finally {
      setIsResending(false);
    }
  };

  return {
    isResending,
    feedbackKey,
    isError,
    cooldown,
    setFeedbackKey,
    setIsError,
    handleResendVerification,
  };
};
