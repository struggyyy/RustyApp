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
import React from "react";

// External libraries
import { useRouter, useLocalSearchParams } from "expo-router";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";
import { useAlert } from "@/core/context/AlertContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { useAuthForm } from "@/shared/hooks/auth/useAuthForm";
import { AuthLayout } from "@/components/common/auth/AuthLayout";
import { AuthInput } from "@/components/common/auth/AuthInput";
import { AuthButton } from "@/components/common/auth/AuthButton";
import {
  AuthTitle,
  AuthSubtitle,
  AuthErrorText,
  AuthLinkButton,
} from "@/components/common/auth/AuthText";
import * as Haptics from "expo-haptics";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { resetPassword, error: authError, clearError } = useAuth();

  // Form state management with validation
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useAuthForm({
    initialValues: {
      email: (params.email as string) || "",
    },
    t,
    onSubmit: async (values) => {
      try {
        await resetPassword(values.email);
        showAlert(t("common.success"), t("auth.passwordResetSent"), [
          { text: "OK", onPress: goToLogin },
        ]);
      } catch (err: any) {
        throw new Error(err.message || t("auth.passwordResetError"));
      }
    },
  });

  // Navigation handler
  const goToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace({
      pathname: "/login",
      params: { email: values.email },
    });
  };

  return (
    <AuthLayout title="auth.resetPassword">
      <AuthTitle>{t("auth.forgotPasswordTitle")}</AuthTitle>
      <AuthSubtitle>{t("auth.forgotPasswordSubtitle")}</AuthSubtitle>

      <AuthInput
        placeholder={t("auth.email")}
        value={values.email}
        onChangeText={(text) => {
          handleChange("email")(text);
          if (authError) clearError();
        }}
        onBlur={handleBlur("email")}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        hasError={!!(touched.email && errors.email)}
      />

      {touched.email && errors.email ? (
        <AuthErrorText>{errors.email}</AuthErrorText>
      ) : null}

      <AuthButton
        title={t("auth.sendResetLink")}
        onPress={handleSubmit}
        loading={isSubmitting}
        loadingText={t("auth.sending")}
        isDisabled={isSubmitting}
      />

      <AuthLinkButton onPress={goToLogin}>
        {t("auth.backToLogin")}
      </AuthLinkButton>
    </AuthLayout>
  );
}
