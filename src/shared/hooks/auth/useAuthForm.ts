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

// Form configuration options
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
  // Form state management
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Reset form to initial state
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Update field value and clear errors
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

  // Set validation error for field
  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  // Mark field as touched (user interacted with it)
  const setFieldTouched = useCallback((field: string, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  // Handle input value changes
  const handleChange = useCallback(
    (field: string) => (value: string) => {
      setFieldValue(field, value);
    },
    [setFieldValue]
  );

  // Handle input blur events
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
    if ("email" in values) {
      if (!values.email?.trim()) {
        newErrors.email = t
          ? t("validation.emailRequired")
          : "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(values.email.trim())) {
        newErrors.email = t
          ? t("validation.invalidEmail")
          : "Invalid email format";
      }
    }

    // Password validation
    if ("password" in values) {
      if (!values.password) {
        newErrors.password = t
          ? t("validation.passwordRequired")
          : "Password is required";
      } else if (values.password.length < 6) {
        newErrors.password = t
          ? t("validation.passwordTooShort")
          : "Password must be at least 6 characters";
      }
    }

    // Confirm password validation
    if ("confirmPassword" in values) {
      if (
        values.confirmPassword &&
        values.password !== values.confirmPassword
      ) {
        newErrors.confirmPassword = t
          ? t("validation.passwordMismatch")
          : "Passwords do not match";
      }
    }

    // Required fields validation (generic fallback for other fields)
    Object.keys(values).forEach((field) => {
      if (field !== "email" && field !== "password" && !values[field]?.trim()) {
        newErrors[field] = t
          ? t("validation.required")
          : `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, t]);

  // Handle form submission with validation
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    // Mark all fields as touched for validation
    const allTouched = Object.keys(values).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate before submission
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
      console.log("Form submission error (expected for validation):", error);
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
  }, [values, validateOnChange]);

  // Re-validate when translation function changes
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      validate();
    }
  }, [t, validate]);

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,

    // Form actions
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
