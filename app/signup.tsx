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
import React, { useRef } from "react";
import { TextInput, Keyboard, Animated } from "react-native";

// External libraries
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { useShakeAnimation } from "@/shared/hooks/ui/useShakeAnimation";
import { useAuthForm } from "@/shared/hooks/auth/useAuthForm";
import { AuthLayout } from "@/components/common/auth/AuthLayout";
import { AuthInput } from "@/components/common/auth/AuthInput";
import { AuthErrorCard } from "@/components/common/auth/AuthErrorCard";
import { AuthButton } from "@/components/common/auth/AuthButton";
import {
  AuthTitle,
  AuthSubtitle,
  AuthLinkButton,
} from "@/components/common/auth/AuthText";
import i18n from "@/core/i18n/i18n";

export default function SignupScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { signUp, error: authError, clearError } = useAuth();
  const router = useRouter();
  const passwordInputRef = useRef<TextInput | null>(null);
  const confirmPasswordInputRef = useRef<TextInput | null>(null);

  // Flag to prevent double navigation
  const hasNavigatedRef = useRef(false);

  // Shake animation for nickname validation
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
      nickname: "",
      email: (params.email as string) || "",
      password: "",
      confirmPassword: "",
    },
    t,
    onSubmit: async (values) => {
      // Custom nickname validation (2-15 characters)
      if (values.nickname.length < 2) {
        triggerShake();
        throw new Error("validation.nicknameTooShort");
      }
      if (values.nickname.length > 15) {
        triggerShake();
        throw new Error("validation.nicknameTooLong");
      }

      // Password confirmation validation
      if (values.password !== values.confirmPassword) {
        throw new Error("validation.passwordMismatch");
      }

      // Email validation
      if (!values.email.includes("@")) {
        throw new Error("validation.invalidEmail");
      }

      try {
        const currentLanguage = i18n.language as "en" | "pl";
        const newUser = await signUp(
          values.email,
          values.password,
          values.nickname,
          currentLanguage
        );

        if (newUser) {
          if (!hasNavigatedRef.current) {
            hasNavigatedRef.current = true;
            router.replace({
              pathname: "/verify-email",
              params: { email: values.email },
            });
          }
        }
      } catch (err: any) {
        throw new Error(err.message || "validation.unexpectedError");
      }
    },
  });

  // Custom nickname handler with shake animation
  const handleNicknameChange = (text: string) => {
    if (text.length <= 15) {
      handleChange("nickname")(text);
      if (authError) clearError();
    } else {
      triggerShake();
    }
  };

  // Navigation handler
  const goToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    router.replace("/login");
  };

  return (
    <AuthLayout title="auth.signup">
      <AuthTitle>{t("auth.signupTitle")}</AuthTitle>
      <AuthSubtitle>{t("auth.signupSubtitle")}</AuthSubtitle>

      <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
        <AuthInput
          placeholder={t("auth.nickname")}
          value={values.nickname}
          onChangeText={handleNicknameChange}
          onBlur={handleBlur("nickname")}
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          hasError={!!(touched.nickname && errors.nickname)}
          editable={!isSubmitting}
        />
      </Animated.View>

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
        returnKeyType="next"
        onSubmitEditing={() => passwordInputRef.current?.focus()}
        onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        hasError={!!(touched.email && errors.email)}
        editable={!isSubmitting}
      />

      <AuthInput
        ref={passwordInputRef}
        placeholder={t("auth.password")}
        value={values.password}
        onChangeText={(text) => {
          handleChange("password")(text);
          if (authError) clearError();
        }}
        onBlur={handleBlur("password")}
        secureTextEntry
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
        onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        hasError={!!(touched.password && errors.password)}
        editable={!isSubmitting}
      />

      <AuthInput
        ref={confirmPasswordInputRef}
        placeholder={t("auth.confirmPassword")}
        value={values.confirmPassword}
        onChangeText={(text) => {
          handleChange("confirmPassword")(text);
          if (authError) clearError();
        }}
        onBlur={handleBlur("confirmPassword")}
        secureTextEntry
        autoCapitalize="none"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        hasError={!!(touched.confirmPassword && errors.confirmPassword)}
        editable={!isSubmitting}
      />

      <AuthErrorCard
        error={
          (touched.nickname && errors.nickname
            ? t(errors.nickname)
            : undefined) ||
          (touched.email && errors.email ? t(errors.email) : undefined) ||
          (touched.password && errors.password
            ? t(errors.password)
            : undefined) ||
          (touched.confirmPassword && errors.confirmPassword
            ? t(errors.confirmPassword)
            : undefined)
        }
      />

      <AuthButton
        title={t("auth.signup")}
        onPress={handleSubmit}
        loading={isSubmitting}
        loadingText={t("auth.signingUp")}
        isDisabled={isSubmitting}
      />

      <AuthLinkButton onPress={goToLogin}>
        {t("auth.alreadyHaveAccount")}
      </AuthLinkButton>
    </AuthLayout>
  );
}
