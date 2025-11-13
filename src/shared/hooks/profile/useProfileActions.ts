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
import { useCallback } from "react";

// External libraries
import { useRouter } from "expo-router";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";

interface UseProfileActionsOptions {
  showAlert: (
    title: string,
    message?: string,
    buttons?: Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }>
  ) => void;
  t: (key: string, options?: any) => string;
}

export function useProfileActions({ showAlert, t }: UseProfileActionsOptions) {
  const { logOut, deleteAccount } = useAuth();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      await logOut(router);
    } catch (error: any) {
      showAlert(t("auth.logoutError"), error.message || t("auth.logoutError"));
    }
  }, [logOut, router, showAlert, t]);

  const handleDeleteAccount = useCallback(() => {
    showAlert(t("profile.deleteAccount"), t("profile.deleteAccountConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAccount();
            showAlert(t("common.success"), t("profile.deleteAccountSuccess"), [
              { text: t("common.ok"), onPress: () => router.replace("/login") },
            ]);
          } catch (error: any) {
            showAlert(
              t("common.error"),
              error.message || t("profile.deleteAccountError")
            );
          }
        },
      },
    ]);
  }, [deleteAccount, showAlert, t, router]);

  return {
    handleLogout,
    handleDeleteAccount,
  };
}
