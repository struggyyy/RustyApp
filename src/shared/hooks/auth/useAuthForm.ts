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
import { useState, useCallback, useEffect } from "react";

// External libraries
import * as Haptics from "expo-haptics";

interface UseAuthFormOptions {
  initialValues?: Record<string, string>;
  onSubmit?: (values: Record<string, string>) => Promise<void> | void;
  validateOnChange?: boolean;
  t?: (key: string, options?: any) => string;
}

export function useAuthForm({
  initialValues = {},
  onSubmit,
  validateOnChange = true,
  t,
}: UseAuthFormOptions = {}) {
  // Form state
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set field value
  const setFieldValue = useCallback(
    (field: string, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field] && validateOnChange) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors, validateOnChange]
  );

  // Set field error
  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  // Mark field as touched
  const setFieldTouched = useCallback((field: string, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  // Handle input change
  const handleChange = useCallback(
    (field: string) => (value: string) => {
      setFieldValue(field, value);
    },
    [setFieldValue]
  );

  // Handle input blur
  const handleBlur = useCallback(
    (field: string) => () => {
      setFieldTouched(field, true);
    },
    [setFieldTouched]
  );

  // Validate form (basic validation - can be extended)
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (values.email && !/\S+@\S+\.\S+/.test(values.email.trim())) {
      newErrors.email = t ? t("validation.invalidEmail") : "Invalid email format";
    }

    // Password validation (minimum length)
    if (values.password && values.password.length < 6) {
      newErrors.password = t ? t("validation.passwordTooShort") : "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (values.confirmPassword && values.password !== values.confirmPassword) {
      newErrors.confirmPassword = t ? t("validation.passwordMismatch") : "Passwords do not match";
    }

    // Required fields
    Object.keys(values).forEach((field) => {
      if (!values[field]?.trim()) {
        newErrors[field] = t ? t("validation.required") : `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, t]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Trim email before submitting
      const trimmedValues = { ...values };
      if (trimmedValues.email) {
        trimmedValues.email = trimmedValues.email.trim();
        setValues(trimmedValues); // Update the form state with trimmed email
      }
      await onSubmit?.(trimmedValues);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, isSubmitting, validate, onSubmit]);

  // Clear errors when values change
  useEffect(() => {
    if (validateOnChange) {
      const newErrors = { ...errors };
      Object.keys(values).forEach((field) => {
        if (newErrors[field] && values[field]) {
          delete newErrors[field];
        }
      });
      setErrors(newErrors);
    }
  }, [values, validateOnChange]); // Removed 'errors' to prevent infinite loop

  return {
    // State
    values,
    errors,
    touched,
    isSubmitting,

    // Actions
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    reset,
    validate,
  };
}
