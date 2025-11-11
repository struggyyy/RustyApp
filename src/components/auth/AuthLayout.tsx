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
import { KeyboardAvoidingView, Platform } from "react-native";

// External libraries
import { Stack } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";

// Internal imports
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "@/components/common/buttons/LanguageSwitcher";
import styled from "styled-components/native";
import theme from "@/theme";

// Styled Components
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView)({
  flex: 1,
  backgroundColor: theme.colors.background.primary,
});

const FormContainer = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingHorizontal: theme.spacing.layout.screenPadding,
    paddingTop: 90,
    paddingBottom: 24,
  },
  keyboardShouldPersistTaps: "handled",
  showsVerticalScrollIndicator: false,
}))`
  flex: 1;
`;

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
  showLanguageSwitcher?: boolean;
}

export function AuthLayout({
  title,
  children,
  showLanguageSwitcher = true,
}: AuthLayoutProps) {
  const { t, i18n } = useTranslation();
  const headerHeight = useHeaderHeight();

  const handleLanguageChange = async () => {
    const newLanguage = i18n.language === "en" ? "pl" : "en";
    await i18n.changeLanguage(newLanguage);
    // Components will re-render automatically via useTranslation hook
  };

  return (
    <>
      <Stack.Screen options={{ title: t(title) }} />
      <StyledKeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight}
      >
        <FormContainer>{children}</FormContainer>
        {showLanguageSwitcher && (
          <LanguageSwitcher onLanguageChange={handleLanguageChange} />
        )}
      </StyledKeyboardAvoidingView>
    </>
  );
}
