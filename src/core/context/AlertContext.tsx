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
import React, { createContext, useContext, useState, useCallback, PropsWithChildren } from "react";

// Internal imports
import { useTranslation } from "@/shared/hooks/common/useTranslation";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export interface AlertConfig {
  title: string;
  message?: string;
  buttons: AlertButton[];
}

interface AlertContextType {
  alertVisible: boolean;
  alertConfig: AlertConfig;
  showAlert: (
    title: string,
    message?: string,
    buttons?: AlertButton[]
  ) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: "",
    buttons: [],
  });

  const showAlert = useCallback(
    (
      title: string,
      message?: string,
      buttons: AlertButton[] = [{ text: t("common.ok") }]
    ) => {
      setAlertConfig({ title, message, buttons });
      setAlertVisible(true);
    },
    [t]
  );

  const hideAlert = useCallback(() => {
    setAlertVisible(false);
  }, []);

  const value: AlertContextType = {
    alertVisible,
    alertConfig,
    showAlert,
    hideAlert,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};
