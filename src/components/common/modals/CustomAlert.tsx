import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import styled from "styled-components/native";
import colors from "../../../theme/colors";
import TouchableButton from "../buttons/TouchableButton";

// Shadow styles using StyleSheet to avoid styled-components issues
const shadowStyles = StyleSheet.create({
  modalShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
});

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

interface ButtonVariant {
  variant?: "primary" | "secondary" | "destructive" | "cancel";
}

// Styled Components
const ModalOverlay = styled.View({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
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

const AlertButton = styled.TouchableOpacity<ButtonVariant>(
  (props: ButtonVariant) => ({
    flex: 1,
    backgroundColor:
      props.variant === "primary"
        ? colors.primary
        : props.variant === "destructive"
        ? colors.primary
        : props.variant === "cancel"
        ? colors.text.secondary
        : colors.background.secondary,
    padding: 14,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  })
);

const AlertButtonText = styled.Text<ButtonVariant>((props: ButtonVariant) => ({
  color:
    props.variant === "primary" || props.variant === "destructive" || props.variant === "cancel"
      ? colors.white
      : colors.text.primary,
  fontSize: 16,
  fontWeight: "bold",
}));

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: "OK" }],
  onRequestClose,
}) => {
  const getButtonVariant = (
    style?: "default" | "cancel" | "destructive"
  ): ButtonVariant["variant"] => {
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
        <ModalContent style={shadowStyles.modalShadow}>
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
          </ModalHeader>

          {message && <ModalMessage>{message}</ModalMessage>}

          <ButtonContainer>
            {buttons.map((button, index) => {
              const buttonVariant = getButtonVariant(button.style);
              const handlePress = button.onPress || onRequestClose;
              const buttonStyle = {
                flex: 1,
                backgroundColor:
                  buttonVariant === "primary"
                    ? colors.primary
                    : buttonVariant === "destructive"
                    ? colors.primary
                    : buttonVariant === "cancel"
                    ? colors.text.secondary
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

export default CustomAlert;
