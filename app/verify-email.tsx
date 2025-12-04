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
import React, { useEffect } from "react";
import { Text, StyleSheet } from "react-native";

// External libraries
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

// Internal imports
import { useAuth } from "@context/AuthContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { useEmailVerification } from "@/shared/hooks/auth/useEmailVerification";
import { AuthLayout } from "@components/common/auth/AuthLayout";
import { AuthButton } from "@components/common/auth/AuthButton";
import { AuthTitle, AuthSubtitle } from "@components/common/auth/AuthText";
import { AuthErrorCard } from "@components/common/auth/AuthErrorCard";
import theme from "@theme/index";

// Styles
const styles = StyleSheet.create({
  emailHighlight: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  infoText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.M,
    textAlign: "center",
  },
});

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { user, logOut } = useAuth();
  const router = useRouter();

  const emailToVerify = (params.email as string) || user?.email;
  const reason = params.reason as string;

  // Custom hook for email verification logic
  const {
    isResending,
    feedbackKey,
    isError,
    cooldown,
    setFeedbackKey,
    setIsError,
    handleResendVerification,
  } = useEmailVerification({ emailToVerify: emailToVerify || undefined });

  // Handle initial feedback based on reason
  useEffect(() => {
    if (reason === "login") {
      setFeedbackKey("auth.emailNotVerified");
      setIsError(true);
    }
  }, [reason, setFeedbackKey, setIsError]);

  // Navigation handler
  const goToLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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
        <Text style={styles.emailHighlight}>
          {" "}
          {emailToVerify || t("auth.email")}
        </Text>
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
        isDisabled={isResending}
      />

      <AuthButton title={t("auth.backToLogin")} onPress={goToLogin} />

      <Text style={styles.infoText}>{t("auth.checkSpam")}</Text>
    </AuthLayout>
  );
}
