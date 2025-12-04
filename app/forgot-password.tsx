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
import { Animated } from "react-native";

// External libraries
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";
import { useAlert } from "@/core/context/AlertContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { useAuthForm } from "@/shared/hooks/auth/useAuthForm";
import { AuthLayout } from "@/components/common/auth/AuthLayout";
import { AuthInput } from "@/components/common/auth/AuthInput";
import { AuthButton } from "@/components/common/auth/AuthButton";
import { useShakeAnimation } from "@/shared/hooks/ui/useShakeAnimation";
import {
  AuthTitle,
  AuthSubtitle,
  AuthLinkButton,
} from "@/components/common/auth/AuthText";
import { AuthErrorCard } from "@/components/common/auth/AuthErrorCard";
import * as Haptics from "expo-haptics";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { resetPassword, error: authError, clearError } = useAuth();

  // Clear errors when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      clearError();
    }, [clearError])
  );

  // Animation value for shake effect
  const { shakeAnimation, triggerShake } = useShakeAnimation();

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
    onValidationFailed: triggerShake,
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

      <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
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
      </Animated.View>

      <AuthErrorCard
        error={
          authError
            ? t(authError)
            : touched.email && errors.email
            ? errors.email
            : undefined
        }
      />

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
