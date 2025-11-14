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
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import styled from "styled-components/native";

// Internal imports
import { useAlert } from "@/core/context/AlertContext";
import TouchableButton from "../buttons/TouchableButton";
import colors from "../../../core/theme/colors";
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

// Styled Components
const ModalOverlay = styled.View({
  flex: 1,
  backgroundColor: colors.background.overlay,
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
});

const ModalContent = styled.View({
  backgroundColor: colors.white,
  borderRadius: 24,
  padding: 24,
  width: "90%",
  maxWidth: 400,
});

const ModalHeader = styled.View({
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 16,
});

const ModalTitle = styled.Text({
  fontSize: 20,
  fontWeight: "bold",
  color: colors.text.primary,
  textAlign: "center",
});

const ModalMessage = styled.Text({
  fontSize: 16,
  color: colors.text.primary,
  lineHeight: "24px",
  marginBottom: 24,
  textAlign: "center",
});

const ButtonContainer = styled.View({
  flexDirection: "row",
  gap: 12,
  justifyContent: "center",
});

const AlertButton = styled.TouchableOpacity<{ variant?: "primary" | "secondary" | "destructive" | "cancel" }>(
  (props: { variant?: "primary" | "secondary" | "destructive" | "cancel" }) => ({
    flex: 1,
    backgroundColor:
      props.variant === "primary"
        ? colors.primary
        : props.variant === "destructive"
        ? colors.primary
        : props.variant === "cancel"
        ? colors.text.primary
        : colors.background.secondary,
    padding: 14,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  })
);

const AlertButtonText = styled.Text<{ variant?: "primary" | "secondary" | "destructive" | "cancel" }>((props: { variant?: "primary" | "secondary" | "destructive" | "cancel" }) => ({
  color:
    props.variant === "primary" || props.variant === "destructive" || props.variant === "cancel"
      ? colors.white
      : colors.text.primary,
  fontSize: 16,
  fontWeight: "bold",
}));

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <ModalOverlay>
        <ModalContent style={theme.shadows.modal}>
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
          </ModalHeader>

          {message && <ModalMessage>{message}</ModalMessage>}

          <ButtonContainer>
            {buttons.map((button, index) => {
              const buttonVariant = getButtonVariant(button.style);
              const handlePress = () => {
                // Always hide the alert first
                onRequestClose?.();
                // Then execute the button's custom onPress if it exists
                button.onPress?.();
              };
              const buttonStyle = {
                flex: 1,
                backgroundColor:
                  buttonVariant === "primary"
                    ? colors.primary
                    : buttonVariant === "destructive"
                    ? colors.primary
                    : buttonVariant === "cancel"
                    ? colors.text.primary
                    : colors.background.secondary,
                padding: 14,
                borderRadius: 20,
                alignItems: "center" as const,
                justifyContent: "center" as const,
                minWidth: 100,
              };

              return (
                <TouchableButton
                  key={index}
                  onPress={handlePress || (() => {})}
                  style={buttonStyle}
                >
                  <AlertButtonText variant={buttonVariant}>
                    {button.text}
                  </AlertButtonText>
                </TouchableButton>
              );
            })}
          </ButtonContainer>
        </ModalContent>
      </ModalOverlay>
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
