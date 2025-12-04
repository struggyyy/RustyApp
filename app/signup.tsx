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
import React, { useRef, useState, useCallback } from "react";
import { TextInput, Keyboard, Animated } from "react-native";

// External libraries
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";

// Internal imports
import { useAuth } from "@context/AuthContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { useShakeAnimation } from "@/shared/hooks/ui/useShakeAnimation";
import { useAuthForm } from "@/shared/hooks/auth/useAuthForm";
import { AuthLayout } from "@components/common/auth/AuthLayout";
import { AuthInput } from "@components/common/auth/AuthInput";
import { AuthErrorCard } from "@components/common/auth/AuthErrorCard";
import { AuthButton } from "@components/common/auth/AuthButton";
import {
  AuthTitle,
  AuthSubtitle,
  AuthLinkButton,
} from "@components/common/auth/AuthText";
import i18n from "@/core/i18n/i18n";

export default function SignupScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { signUp, error: authError, clearError } = useAuth();
  const router = useRouter();
  const passwordInputRef = useRef<TextInput | null>(null);
  const confirmPasswordInputRef = useRef<TextInput | null>(null);

  // Clear errors when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      clearError();
    }, [clearError])
  );

  // Local state
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  // Shake animations
  const {
    shakeAnimation: nicknameShakeAnim,
    triggerShake: triggerNicknameShake,
  } = useShakeAnimation();
  const { shakeAnimation: emailShakeAnim, triggerShake: triggerEmailShake } =
    useShakeAnimation();
  const {
    shakeAnimation: passwordShakeAnim,
    triggerShake: triggerPasswordShake,
  } = useShakeAnimation();

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
      nickname: "",
      email: (params.email as string) || "",
      password: "",
      confirmPassword: "",
    },
    t,
    validateCustom: useCallback((values: Record<string, string>) => {
      const errors: Record<string, string> = {};

      // Nickname validation
      if (!values.nickname) {
        errors.nickname = "validation.required";
      } else if (values.nickname.length < 2) {
        errors.nickname = "validation.nicknameTooShort";
      } else if (values.nickname.length > 15) {
        errors.nickname = "validation.nicknameTooLong";
      }

      // Email validation
      if (!values.email) {
        errors.email = "validation.emailRequired";
      } else if (!/\S+@\S+\.\S+/.test(values.email.trim())) {
        errors.email = "validation.invalidEmail";
      }

      // Password validation
      const complexityRegex = /^(?=.*[A-Z])(?=.*\d)/;
      if (!values.password) {
        errors.password = "validation.passwordRequired";
      } else if (values.password.length < 6) {
        errors.password = "validation.passwordTooShort";
      } else if (!complexityRegex.test(values.password)) {
        errors.password = "validation.passwordComplexity";
      }

      // Confirm password validation
      if (values.password !== values.confirmPassword) {
        errors.confirmPassword = "validation.passwordMismatch";
      }

      return errors;
    }, []),
    onSubmit: async (values) => {
      try {
        const currentLanguage = i18n.language as "en" | "pl";

        // Final complexity check before API call (safety net)
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(values.password)) {
          throw new Error("validation.passwordComplexity");
        }

        await signUp(
          values.email,
          values.password,
          values.nickname,
          currentLanguage
        );

        // Navigation is handled by useAuthNavigation hook
      } catch (err: any) {
        if (err.code === "auth/email-already-in-use") {
          throw new Error("auth.emailAlreadyInUse");
        }
        throw new Error(err.message || "validation.unexpectedError");
      }
    },
  });

  // Custom submit handler to check validation before submitting
  const handleSignupPress = () => {
    // Trigger animations based on current values (validation is handled by hook)
    // Nickname shake
    if (
      !values.nickname ||
      values.nickname.length < 2 ||
      values.nickname.length > 15
    ) {
      triggerNicknameShake();
    }

    // Email shake
    if (!values.email || !/\S+@\S+\.\S+/.test(values.email.trim())) {
      triggerEmailShake();
    }

    // Password shake
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (
      !values.password ||
      !passwordRegex.test(values.password) ||
      values.password !== values.confirmPassword
    ) {
      triggerPasswordShake();
    }

    handleSubmit();
  };

  // Custom nickname handler with shake animation
  const handleNicknameChange = (text: string) => {
    if (text.length <= 15) {
      handleChange("nickname")(text);
      if (authError) clearError();
    } else {
      triggerNicknameShake();
    }
  };

  // Navigation handler
  const goToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Keyboard.dismiss();
    router.replace("/login");
  };

  return (
    <AuthLayout title="auth.signup">
      <AuthTitle>{t("auth.signupTitle")}</AuthTitle>
      <AuthSubtitle>{t("auth.signupSubtitle")}</AuthSubtitle>
      <Animated.View style={{ transform: [{ translateX: nicknameShakeAnim }] }}>
        <AuthInput
          placeholder={t("auth.nickname")}
          value={values.nickname}
          onChangeText={handleNicknameChange}
          onBlur={handleBlur("nickname")}
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
          hasError={!!(touched.nickname && errors.nickname)}
          editable={!isSubmitting}
          rightIcon={values.nickname ? "close-circle" : undefined}
          onRightIconPress={() => setFieldValue("nickname", "")}
        />
      </Animated.View>
      <Animated.View style={{ transform: [{ translateX: emailShakeAnim }] }}>
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
          onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
          hasError={!!(touched.email && errors.email)}
          editable={!isSubmitting}
          rightIcon={values.email ? "close-circle" : undefined}
          onRightIconPress={() => setFieldValue("email", "")}
        />
      </Animated.View>
      <Animated.View
        style={{
          transform: [
            {
              translateX: passwordShakeAnim.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [1, 0, -1], // Invert direction for password
              }),
            },
          ],
        }}
      >
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
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
          onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
          hasError={!!(touched.password && errors.password)}
          editable={!isSubmitting}
          rightIcon={isPasswordVisible ? "eye-off" : "eye"}
          onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
        />
      </Animated.View>
      <Animated.View style={{ transform: [{ translateX: passwordShakeAnim }] }}>
        <AuthInput
          ref={confirmPasswordInputRef}
          placeholder={t("auth.confirmPassword")}
          value={values.confirmPassword}
          onChangeText={(text) => {
            handleChange("confirmPassword")(text);
            if (authError) clearError();
          }}
          onBlur={handleBlur("confirmPassword")}
          secureTextEntry={!isConfirmPasswordVisible}
          autoCapitalize="none"
          returnKeyType="go"
          onSubmitEditing={handleSignupPress}
          onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
          hasError={!!(touched.confirmPassword && errors.confirmPassword)}
          editable={!isSubmitting}
          rightIcon={isConfirmPasswordVisible ? "eye-off" : "eye"}
          onRightIconPress={() =>
            setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
          }
        />
      </Animated.View>
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
            : undefined) ||
          (errors.submit ? t(errors.submit) : undefined)
        }
      />
      <AuthButton
        title={t("auth.signup")}
        onPress={handleSignupPress}
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
