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
import { Modal, View, Text, StyleSheet } from "react-native";

// Internal imports
import { useAlert } from "@/core/context/AlertContext";
import TouchableButton from "../buttons/TouchableButton";
import theme from "../../../core/theme";

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onRequestClose?: () => void;
}

// Alert component styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.background.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.M,
  },
  content: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.radius.XL,
    padding: theme.spacing.M,
    width: "90%",
    maxWidth: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.S,
  },
  title: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    textAlign: "center",
  },
  message: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text.primary,
    lineHeight: 24,
    marginBottom: theme.spacing.M,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: theme.spacing.S,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  button: {
    minWidth: 100,
    paddingVertical: theme.spacing.component.buttonPadding,
    paddingHorizontal: 16,
    borderRadius: theme.spacing.radius.L,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.background.secondary,
  },
  buttonDestructive: {
    backgroundColor: theme.colors.primary,
  },
  buttonCancel: {
    backgroundColor: theme.colors.text.primary,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: "bold",
  },
  buttonTextPrimary: {
    color: theme.colors.white,
  },
  buttonTextSecondary: {
    color: theme.colors.text.primary,
  },
  buttonTextDestructive: {
    color: theme.colors.white,
  },
  buttonTextCancel: {
    color: theme.colors.white,
  },
});

// Internal alert component for displaying modal alerts
const InternalAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: "OK" }],
  onRequestClose,
}) => {
  const getButtonVariant = (
    style?: "default" | "cancel" | "destructive"
  ): "primary" | "secondary" | "destructive" | "cancel" => {
    switch (style) {
      case "destructive":
        return "destructive";
      case "cancel":
        return "cancel";
      default:
        return buttons.length === 1 ? "primary" : "secondary";
    }
  };

  const getButtonStyle = (variant: "primary" | "secondary" | "destructive" | "cancel") => [
    styles.button,
    variant === "primary" && styles.buttonPrimary,
    variant === "secondary" && styles.buttonSecondary,
    variant === "destructive" && styles.buttonDestructive,
    variant === "cancel" && styles.buttonCancel,
  ];

  const getButtonTextStyle = (variant: "primary" | "secondary" | "destructive" | "cancel") => [
    styles.buttonText,
    variant === "primary" && styles.buttonTextPrimary,
    variant === "secondary" && styles.buttonTextSecondary,
    variant === "destructive" && styles.buttonTextDestructive,
    variant === "cancel" && styles.buttonTextCancel,
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, theme.shadows.modal]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>

          {message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => {
              const buttonVariant = getButtonVariant(button.style);
              const handlePress = () => {
                onRequestClose?.();
                button.onPress?.();
              };

              return (
                <TouchableButton
                  key={index}
                  onPress={handlePress}
                  style={getButtonStyle(buttonVariant)}
                >
                  <Text style={getButtonTextStyle(buttonVariant)}>
                    {button.text}
                  </Text>
                </TouchableButton>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CustomAlert: React.FC = () => {
  const { alertVisible, alertConfig, hideAlert } = useAlert();

  return (
    <InternalAlert
      visible={alertVisible}
      title={alertConfig.title}
      message={alertConfig.message}
      buttons={alertConfig.buttons}
      onRequestClose={hideAlert}
    />
  );
};

export default CustomAlert;
