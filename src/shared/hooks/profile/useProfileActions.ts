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
import { useCallback, useState } from "react";

// External libraries
import { useRouter } from "expo-router";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";
import { useAlert } from "../../../core/context/AlertContext";

// Hook options interface
interface UseProfileActionsOptions {
  t: (key: string, options?: any) => string;
}

// Main hook function
export function useProfileActions({ t }: UseProfileActionsOptions) {
  const { logOut, deleteAccount } = useAuth();
  const router = useRouter();
  const { showAlert } = useAlert();

  // Loading state for account deletion
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Logout handler
  const handleLogout = useCallback(async () => {
    try {
      await logOut(router);
    } catch (error: any) {
      showAlert(t("auth.logoutError"), error.message || t("auth.logoutError"));
    }
  }, [logOut, router, showAlert, t]);

  // Delete account handler with confirmation
  const handleDeleteAccount = useCallback(() => {
    // Prevent multiple deletion attempts
    if (isDeletingAccount) return;

    showAlert(t("profile.deleteAccount"), t("profile.deleteAccountConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          // Prevent duplicate requests
          if (isDeletingAccount) return;

          setIsDeletingAccount(true);
          try {
            await deleteAccount();
            showAlert(t("common.success"), t("profile.deleteAccountSuccess"), [
              { text: t("common.ok"), onPress: () => router.replace("/login") },
            ]);
          } catch (error: any) {
            console.error("Account deletion failed:", error);
            // Map error codes to i18n keys
            let errorKey = "profile.deleteAccountError";
            if (error.code === "auth/requires-recent-login") {
              errorKey = "profile.deleteAccountAuthRequired";
            } else if (error.code === "deleteAccount/storageError") {
              errorKey = "profile.deleteAccountStorageError";
            } else if (error.code === "deleteAccount/firestoreError") {
              errorKey = "profile.deleteAccountFirestoreError";
            } else if (error.code === "deleteAccount/genericError") {
              errorKey = "profile.deleteAccountGenericError";
            }

            showAlert(t("common.error"), t(errorKey), [
              {
                text: t("common.ok"),
                style: "default",
              },
            ]);
          } finally {
            setIsDeletingAccount(false);
          }
        },
      },
    ]);
  }, [deleteAccount, showAlert, t, router, isDeletingAccount]);

  // Hook return interface
  return {
    handleLogout,
    handleDeleteAccount,
    isDeletingAccount,
  };
}
