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
import React, { useState } from "react";

// External libraries
import { useRouter, useLocalSearchParams } from "expo-router";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { AuthLayout } from "@/components/common/auth/AuthLayout";
import { AuthButton } from "@/components/common/auth/AuthButton";
import { AuthTitle, AuthSubtitle } from "@/components/common/auth/AuthText";
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
  const [resendMessage, setResendMessage] = useState("");
  const [lastResendTime, setLastResendTime] = useState<number>(0);

  const emailToVerify = (params.email as string) || user?.email;

  const handleResendVerification = async () => {
    // Prevent rapid clicking - minimum 10 seconds between requests
    const now = Date.now();
    const timeSinceLastResend = now - lastResendTime;
    const minDelay = 10000; // 10 seconds

    if (timeSinceLastResend < minDelay) {
      setResendMessage(t("auth.verificationRateLimit"));
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsResending(true);
    setResendMessage("");
    setLastResendTime(now);

    try {
      await sendVerificationEmail();
      setResendMessage(t("auth.emailSentSuccess"));
    } catch (err: any) {
      console.error("Resend Error:", err);
      // Check for specific error messages
      if (err.message?.includes("Too many verification emails sent")) {
        setResendMessage(t("auth.verificationRateLimit"));
      } else {
        setResendMessage(t("auth.verificationError"));
      }
    } finally {
      setIsResending(false);
    }
  };

  const goToLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("[VerifyEmail] Logging out before navigating to login...");
    try {
      await logOut(router);
      console.log(
        "[VerifyEmail] Logout successful. Navigating to login screen..."
      );
      router.replace({ pathname: "/login", params: { email: emailToVerify } });
    } catch (err: any) {
      console.error("[VerifyEmail] Logout failed:", err);
      // Could show an alert here, but keeping it simple
    }
  };

  return (
    <AuthLayout
      title="Email Verification"
      options={{ headerLeft: null }}
    >
      <AuthTitle>{t("auth.verifyEmailTitle")}</AuthTitle>
      <AuthSubtitle>
        {t("auth.verifyEmailMessage")}
        <EmailHighlightText>
          {" "}
          {emailToVerify || t("auth.email")}
        </EmailHighlightText>
      </AuthSubtitle>

      {resendMessage && (
        <FeedbackText isError={false}>{resendMessage}</FeedbackText>
      )}

      <AuthButton
        title={t("auth.resendEmail")}
        onPress={handleResendVerification}
        isLoading={isResending}
        variant="secondary"
      />

      <AuthButton title={t("auth.backToLogin")} onPress={goToLogin} />

      <InfoText>{t("auth.checkSpam")}</InfoText>
    </AuthLayout>
  );
}
