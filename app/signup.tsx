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

// Internal imports
import { useAuth } from "@/core/context/AuthContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { useShakeAnimation } from "@/shared/hooks/ui/useShakeAnimation";
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
import i18n from "@/core/i18n/i18n";
import * as Haptics from "expo-haptics";

export default function SignupScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { signUp } = useAuth();
  const router = useRouter();
  const passwordInputRef = useRef<TextInput | null>(null);
  const confirmPasswordInputRef = useRef<TextInput | null>(null);

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
    onSubmit: async (values) => {
      // Custom nickname validation (2-15 characters)
      if (values.nickname.length < 2) {
        triggerShake();
        throw new Error(t("validation.nicknameTooShort"));
      }
      if (values.nickname.length > 15) {
        triggerShake();
        throw new Error(t("validation.nicknameTooLong"));
      }

      // Password confirmation validation
      if (values.password !== values.confirmPassword) {
        throw new Error(t("validation.passwordMismatch"));
      }

      // Email validation
      if (!values.email.includes("@")) {
        throw new Error(t("validation.invalidEmail"));
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
          console.log("Signup successful, navigating to verification screen.");
          router.replace({
            pathname: "/verify-email",
            params: { email: values.email },
          });
        } else {
          console.log("Signup failed (error likely set in context).");
        }
      } catch (err: any) {
        console.error("Signup handler error:", err);
        throw new Error(err.message || t("validation.unexpectedError"));
      }
    },
  });

  // Custom nickname handler with shake animation
  const handleNicknameChange = (text: string) => {
    if (text.length <= 15) {
      handleChange("nickname")(text);
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
        onChangeText={handleChange("email")}
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
        onChangeText={handleChange("password")}
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
        onChangeText={handleChange("confirmPassword")}
        onBlur={handleBlur("confirmPassword")}
        secureTextEntry
        autoCapitalize="none"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        hasError={!!(touched.confirmPassword && errors.confirmPassword)}
        editable={!isSubmitting}
      />

      {(touched.nickname && errors.nickname) ||
      (touched.email && errors.email) ||
      (touched.password && errors.password) ||
      (touched.confirmPassword && errors.confirmPassword) ? (
        <AuthErrorText>
          {touched.nickname && errors.nickname
            ? errors.nickname
            : touched.email && errors.email
            ? errors.email
            : touched.password && errors.password
            ? errors.password
            : touched.confirmPassword && errors.confirmPassword
            ? errors.confirmPassword
            : ""}
        </AuthErrorText>
      ) : null}

      <AuthButton
        title={t("auth.signup")}
        onPress={handleSubmit}
        isLoading={isSubmitting}
      />

      <AuthLinkButton onPress={goToLogin}>
        {t("auth.alreadyHaveAccount")}
      </AuthLinkButton>
    </AuthLayout>
  );
}
