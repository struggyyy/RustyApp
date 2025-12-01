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
import React, { useState, useEffect } from "react";

// External libraries
import { useRouter, useLocalSearchParams } from "expo-router";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { AuthLayout } from "@/components/common/auth/AuthLayout";
import { AuthButton } from "@/components/common/auth/AuthButton";
import { AuthTitle, AuthSubtitle } from "@/components/common/auth/AuthText";
import { AuthErrorCard } from "@/components/common/auth/AuthErrorCard";
import * as Haptics from "expo-haptics";

// Styled Components (minimal, for specific elements)
import styled from "styled-components/native";
import theme from "@/core/theme";

const EmailHighlightText = styled.Text({
  fontWeight: "bold",
  color: theme.colors.primary,
});

const FeedbackText = styled.Text<{ isError?: boolean }>(
  ({ isError }: { isError?: boolean }) => ({
    color: isError ? theme.colors.error : theme.colors.primary,
    marginBottom: theme.spacing.M,
    textAlign: "center",
    fontWeight: "bold",
  })
);

const InfoText = styled.Text({
  fontSize: theme.typography.fontSize.caption,
  color: theme.colors.text.tertiary,
  marginTop: theme.spacing.M,
  textAlign: "center",
});

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { user, sendVerificationEmail, logOut } = useAuth();
  const router = useRouter();

  const [isResending, setIsResending] = useState(false);
  const [feedbackKey, setFeedbackKey] = useState("");
  const [isError, setIsError] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);

  // Cooldown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const emailToVerify = (params.email as string) || user?.email;
  const reason = params.reason as string;

  useEffect(() => {
    if (reason === "login") {
      setFeedbackKey("auth.emailNotVerified");
      setIsError(true);
    }
  }, [reason]);

  const handleResendVerification = async () => {
    if (cooldown > 0) {
      setFeedbackKey("auth.cooldownMessage");
      setIsError(false); // Info message, not error
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsResending(true);
    setFeedbackKey("");

    try {
      await sendVerificationEmail();
      setFeedbackKey("auth.emailSentSuccess");
      setIsError(false);

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      // Start cooldown only after 2nd attempt
      if (nextAttempts >= 2) {
        setCooldown(60);
      }
    } catch (err: any) {
      console.error("Resend Error:", err);
      setIsError(true);
      // Check for specific error messages
      if (err.message) {
        setFeedbackKey(err.message);
      } else {
        setFeedbackKey("auth.verificationError");
      }
    } finally {
      setIsResending(false);
    }
  };

  const goToLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await logOut();
      router.replace({ pathname: "/login", params: { email: emailToVerify } });
    } catch (err: any) {
      // Could show an alert here, but keeping it simple
    }
  };

  return (
    <AuthLayout title="Email Verification" options={{ headerLeft: null }}>
      <AuthTitle>{t("auth.verifyEmailTitle")}</AuthTitle>
      <AuthSubtitle>
        {t("auth.verifyEmailMessage")}
        <EmailHighlightText>
          {" "}
          {emailToVerify || t("auth.email")}
        </EmailHighlightText>
      </AuthSubtitle>

      {feedbackKey ? (
        <AuthErrorCard
          error={t(feedbackKey, { seconds: cooldown })}
          type={
            isError
              ? "error"
              : feedbackKey === "auth.emailSentSuccess"
              ? "success"
              : "info"
          }
        />
      ) : null}

      <AuthButton
        title={t("auth.resendEmail")}
        onPress={handleResendVerification}
        loading={isResending}
        loadingText={t("auth.sending")}
        variant="secondary"
        isDisabled={isResending || cooldown > 0}
      />

      <AuthButton title={t("auth.backToLogin")} onPress={goToLogin} />

      <InfoText>{t("auth.checkSpam")}</InfoText>
    </AuthLayout>
  );
}
