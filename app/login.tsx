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
import React, { useRef, useEffect } from "react";
import { TextInput, Keyboard } from "react-native";

// External libraries
import { useRouter, useLocalSearchParams } from "expo-router";

// Internal imports
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthForm } from "@/hooks/auth/useAuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import {
  AuthTitle,
  AuthSubtitle,
  AuthErrorText,
  AuthLinkButton,
} from "@/components/auth/AuthText";
import * as Haptics from "expo-haptics";

// Styled Components (minimal, for specific elements)
import styled from "styled-components/native";
import theme from "@/theme";

const ForgotPasswordButton = styled.TouchableOpacity({
  alignSelf: "flex-end",
  marginBottom: theme.spacing.M,
});

const ForgotPasswordText = styled.Text({
  color: theme.colors.primary,
  fontSize: theme.typography.fontSize.body2,
});

export default function Login() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { logIn, user, initialLoading } = useAuth();
  const router = useRouter();
  const passwordInputRef = useRef<TextInput | null>(null);

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
      password: "",
    },
    onSubmit: async (values) => {
      try {
        console.log("Calling useAuth logIn function for:", values.email);
        await logIn(values.email, values.password);
        console.log(
          "logIn function completed successfully (redirect handled by listener in _layout)."
        );
      } catch (err: any) {
        console.error("Login handler error:", err.code, err.message);
        if (
          err.code === "auth/user-not-found" ||
          err.code === "auth/invalid-credential"
        ) {
          throw new Error(t("auth.userNotFound"));
        } else if (err.code === "auth/wrong-password") {
          throw new Error(t("auth.wrongPassword"));
        } else if (err.code === "auth/invalid-email") {
          throw new Error(t("auth.invalidEmail"));
        } else if (err.code === "auth/too-many-requests") {
          throw new Error(t("auth.tooManyAttempts"));
        } else {
          throw new Error(err.message || t("auth.loginFailed"));
        }
      }
    },
  });

  // Auto-redirect if user is authenticated
  useEffect(() => {
    console.log("Login screen rendered, auth state:", {
      hasUser: !!user,
      initialLoading: initialLoading,
      userEmail: user?.email || "none",
    });

    if (!initialLoading && user) {
      console.log(
        "User authenticated in login screen, redirecting to home:",
        user.email
      );
    }
  }, [user, initialLoading]);

  // Navigation handlers
  const goToSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    router.push({
      pathname: "/signup",
      params: { email: values.email },
    });
  };

  const goToForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    router.push({
      pathname: "/forgot-password",
      params: { email: values.email },
    });
  };

  return (
    <AuthLayout title="auth.login">
      <AuthTitle>{t("auth.welcomeBack")}</AuthTitle>
      <AuthSubtitle>{t("auth.loginSubtitle")}</AuthSubtitle>

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
      />

      <AuthInput
        ref={passwordInputRef}
        placeholder={t("auth.password")}
        value={values.password}
        onChangeText={handleChange("password")}
        onBlur={handleBlur("password")}
        secureTextEntry
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        hasError={!!(touched.password && errors.password)}
      />

      <ForgotPasswordButton onPress={goToForgotPassword}>
        <ForgotPasswordText>{t("auth.forgotPassword")}</ForgotPasswordText>
      </ForgotPasswordButton>

      {(touched.email && errors.email) ||
      (touched.password && errors.password) ? (
        <AuthErrorText>
          {touched.email && errors.email
            ? errors.email
            : touched.password && errors.password
            ? errors.password
            : ""}
        </AuthErrorText>
      ) : null}

      <AuthButton
        title={t("auth.login")}
        onPress={handleSubmit}
        isLoading={isSubmitting}
      />

      <AuthLinkButton onPress={goToSignUp}>
        {t("auth.dontHaveAccount")}
      </AuthLinkButton>
    </AuthLayout>
  );
}
