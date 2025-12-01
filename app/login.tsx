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
import { TextInput, Keyboard, BackHandler } from "react-native";

// External libraries
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import styled from "styled-components/native";
import * as Haptics from "expo-haptics";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";
import { auth } from "@/lib/firebase/firebase";
import { useAlert } from "@/core/context/AlertContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { useAuthForm } from "@/shared/hooks/auth/useAuthForm";
import { useShakeAnimation } from "@/shared/hooks/ui/useShakeAnimation";
import { AuthLayout } from "@/components/common/auth/AuthLayout";
import { AuthInput } from "@/components/common/auth/AuthInput";
import { AuthErrorCard } from "@/components/common/auth/AuthErrorCard";
import { AuthButton } from "@/components/common/auth/AuthButton";
import {
  AuthTitle,
  AuthSubtitle,
  AuthLinkButton,
} from "@/components/common/auth/AuthText";
import theme from "@/core/theme";

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
  const {
    logIn,
    user,
    initialLoading,
    error: authError,
    clearError,
  } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();
  const passwordInputRef = useRef<TextInput | null>(null);

  // Animation hooks
  const { shakeAnimation: emailShakeAnim, triggerShake: triggerEmailShake } =
    useShakeAnimation();
  const {
    shakeAnimation: passwordShakeAnim,
    triggerShake: triggerPasswordShake,
  } = useShakeAnimation();

  // Local state
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  // Form state management with validation
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useAuthForm({
    initialValues: {
      email: (params.email as string) || "",
      password: "",
    },
    t,
    onSubmit: async (values) => {
      try {
        await logIn(values.email, values.password);

        // Check verification status immediately
        if (auth.currentUser && !auth.currentUser.emailVerified) {
          router.replace({
            pathname: "/verify-email",
            params: { email: values.email, reason: "login" },
          });
          return;
        }
      } catch (err: any) {
        // Trigger shake on failure (opposite directions)
        triggerEmailShake();
        triggerPasswordShake();

        if (
          err.code === "auth/user-not-found" ||
          err.code === "auth/invalid-credential"
        ) {
          throw new Error("auth.userNotFound");
        } else if (err.code === "auth/wrong-password") {
          throw new Error("auth.wrongPassword");
        } else if (err.code === "auth/invalid-email") {
          throw new Error("auth.invalidEmail");
        } else if (err.code === "auth/too-many-requests") {
          throw new Error("auth.tooManyAttempts");
        } else {
          throw new Error(err.message || "auth.loginFailed");
        }
      }
    },
  });

  // Custom submit handler to check validation before submitting
  const handleLoginPress = async () => {
    // Check for empty email or invalid format to trigger shake
    if (!values.email || !/\S+@\S+\.\S+/.test(values.email.trim())) {
      triggerEmailShake();
    }

    handleSubmit();
  };

  // Auto-redirect if user is authenticated
  useEffect(() => {
    if (!initialLoading && user) {
      // User authenticated, redirect handled by layout or router
    }
  }, [user, initialLoading]);

  // Handle back button press
  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        // If we are on the login screen, we want to exit the app instead of going back
        // to a potentially protected screen (like home or profile) if the user just logged out.
        if (!user) {
          showAlert(t("common.exitApp"), t("common.exitAppConfirm"), [
            {
              text: t("common.cancel"),
              style: "cancel",
              onPress: () => {},
            },
            {
              text: t("common.yes"),
              style: "success",
              onPress: () => BackHandler.exitApp(),
            },
          ]);
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [user, t, showAlert])
  );

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
        rightIcon={values.email ? "close-circle" : undefined}
        onRightIconPress={() => setFieldValue("email", "")}
        containerStyle={{
          transform: [{ translateX: emailShakeAnim }],
        }}
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
        secureTextEntry={!isPasswordVisible}
        returnKeyType="go"
        onSubmitEditing={handleLoginPress}
        onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        hasError={!!(touched.password && errors.password)}
        rightIcon={isPasswordVisible ? "eye-off" : "eye"}
        onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
        containerStyle={{
          transform: [
            {
              translateX: passwordShakeAnim.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [1, 0, -1], // Invert direction for password
              }),
            },
          ],
        }}
      />

      <ForgotPasswordButton onPress={goToForgotPassword}>
        <ForgotPasswordText>{t("auth.forgotPassword")}</ForgotPasswordText>
      </ForgotPasswordButton>

      <AuthErrorCard
        error={
          authError
            ? t(authError)
            : (touched.email && errors.email ? errors.email : undefined) ||
              (touched.password && errors.password
                ? errors.password
                : undefined)
        }
      />

      <AuthButton
        title={t("auth.login")}
        onPress={handleLoginPress}
        loading={isSubmitting}
        loadingText={t("auth.loggingIn")}
        isDisabled={isSubmitting}
      />

      <AuthLinkButton onPress={goToSignUp}>
        {t("auth.dontHaveAccount")}
      </AuthLinkButton>
    </AuthLayout>
  );
}
