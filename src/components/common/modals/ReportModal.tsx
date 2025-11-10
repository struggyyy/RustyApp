import React from 'react';
import { Modal, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import colors, { getStatusColor } from '../../../theme/colors';
import { Report } from '../../../types/reports';
import IconButton from '../buttons/IconButton';
import TouchableButton from '../buttons/TouchableButton';
import { useTranslation } from '../../../hooks/useTranslation';

// Shadow styles using StyleSheet to avoid styled-components issues
const shadowStyles = StyleSheet.create({
  modalShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
});

interface ReportModalProps {
  visible: boolean;
  report: Report | null;
  onClose: () => void;
  onNavigate?: () => void;
  onViewReport?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasMultiple?: boolean;
}

// Styled Components
const ModalOverlay = styled.View({
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
});

const ModalContent = styled.View({
  backgroundColor: colors.white,
  borderRadius: 24,
  padding: 24,
  width: '90%',
  maxWidth: 400,
});

const ModalHeader = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4,
});

const ModalTitle = styled.Text({
  fontSize: 20,
  fontWeight: 'bold',
  color: colors.text.primary,
});

const DateText = styled.Text({
  fontSize: 18,
  fontWeight: 'bold',
  color: colors.text.primary,
  marginBottom: 12,
  textAlign: 'left',
});

const ReportImage = styled.Image({
  width: '100%',
  height: 180,
  borderRadius: 16,
  marginBottom: 16,
});

const NavigationView = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
});

const ActionButtons = styled.View({
  flexDirection: 'row',
  gap: 12,
  marginTop: 16,
});

const ActionButton = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' | 'navigate' | 'close' }>((props: { variant?: 'primary' | 'secondary' | 'navigate' | 'close' }) => ({
  flex: 1,
  backgroundColor: props.variant === 'primary' ? colors.primary : props.variant === 'navigate' ? colors.navigation : props.variant === 'close' ? colors.text.secondary : colors.componentBackground,
  padding: 14,
  borderRadius: 20,
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 8,
}));

const ActionButtonText = styled.Text<{ variant?: 'primary' | 'secondary' | 'navigate' | 'close' }>((props: { variant?: 'primary' | 'secondary' | 'navigate' | 'close' }) => ({
  color: (props.variant === 'primary' || props.variant === 'navigate' || props.variant === 'close') ? colors.white : colors.text.primary,
  fontSize: 16,
  fontWeight: 'bold',
}));

// Helper function to format date
const formatDate = (date: Date): string => {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
};

const ReportModal: React.FC<ReportModalProps> = ({ visible, report, onClose, onNavigate, onViewReport, onPrev, onNext, hasMultiple }) => {
  const { t } = useTranslation();
  if (!report) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <ModalOverlay>
        <ModalContent style={shadowStyles.modalShadow}>
          <ModalHeader>
            <ModalTitle>{t('reports.reportDetails')}</ModalTitle>
            <IconButton
              onPress={onClose}
              size={40}
              backgroundColor="transparent"
            >
              <MaterialIcons name="close" size={24} color={colors.text.primary} />
            </IconButton>
          </ModalHeader>

          <DateText style={{ color: getStatusColor(report.status) }}>{formatDate(report.createdAt.toDate())}</DateText>

          <ReportImage source={{ uri: report.imageUrl }} resizeMode="cover" />

          {hasMultiple && (
            <NavigationView>
              <IconButton
                onPress={onPrev || (() => {})}
                size={40}
                backgroundColor="transparent"
              >
                <MaterialIcons name="chevron-left" size={30} color={colors.text.primary} />
              </IconButton>
              <IconButton
                onPress={onNext || (() => {})}
                size={40}
                backgroundColor="transparent"
              >
                <MaterialIcons name="chevron-right" size={30} color={colors.text.primary} />
              </IconButton>
            </NavigationView>
          )}

          <ActionButtons>
            {onViewReport && (
              <TouchableButton
                onPress={onViewReport}
                style={{
                  flex: 1,
                  backgroundColor: colors.text.secondary,
                  padding: 14,
                  borderRadius: 20,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <ActionButtonText variant="close">{t('common.more')}</ActionButtonText>
              </TouchableButton>
            )}
            {onNavigate && (
              <TouchableButton
                onPress={onNavigate}
                style={{
                  flex: 1,
                  backgroundColor: colors.navigation,
                  padding: 14,
                  borderRadius: 20,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <MaterialIcons name="navigation" size={20} color={colors.white} />
                <ActionButtonText variant="navigate">{t('common.navigate')}</ActionButtonText>
              </TouchableButton>
            )}
          </ActionButtons>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default ReportModal;
