import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, Animated } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { useAuth } from '../src/context/AuthContext';
import { useTranslation } from '../src/hooks/useTranslation';
import { useShakeAnimation } from '../src/hooks/useShakeAnimation';
import LanguageSwitcher from '../src/components/common/buttons/LanguageSwitcher';
import i18n from '../src/i18n/i18n';
import styled from 'styled-components/native';
import theme from '../src/theme';
import CustomAlert from '../src/components/common/modals/CustomAlert';
import * as Haptics from 'expo-haptics';

// Styled Components
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView)({
  flex: 1,
  backgroundColor: theme.colors.background.primary,
});

const FormContainer = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: theme.spacing.layout.screenPadding,
    paddingTop: 90,
    paddingBottom: 24,
  },
  keyboardShouldPersistTaps: 'handled',
  showsVerticalScrollIndicator: false,
}))`
  flex: 1;
`;

const TitleText = styled.Text({
  fontSize: theme.typography.fontSize.h1,
  fontWeight: 'bold',
  marginBottom: theme.spacing.sm,
  textAlign: 'center',
  color: theme.colors.text.primary,
});

const SubtitleText = styled.Text({
  fontSize: theme.typography.fontSize.body1,
  marginBottom: theme.spacing.lg,
  textAlign: 'center',
  color: theme.colors.text.secondary,
});

const StyledInput = styled.TextInput.attrs({
  placeholderTextColor: theme.colors.text.tertiary,
})({
  backgroundColor: theme.colors.background.primary,
  borderRadius: theme.spacing.md, // 16px
  padding: theme.spacing.md,
  marginBottom: theme.spacing.md,
  borderWidth: 1,
  borderColor: theme.colors.border.medium,
  color: theme.colors.text.primary,
  fontSize: theme.typography.fontSize.input,
});

interface StyledButtonProps {
  isDisabled?: boolean;
}
const StyledButton = styled.TouchableOpacity<StyledButtonProps>((props: StyledButtonProps) => ({
  backgroundColor: props.isDisabled ? theme.colors.secondaryLight : theme.colors.primary,
  borderRadius: theme.spacing.md, // 16px
  padding: theme.spacing.md,
  alignItems: 'center',
  marginTop: theme.spacing.sm,
}));

const ButtonText = styled.Text({
  color: theme.colors.text.light,
  fontWeight: 'bold',
  fontSize: theme.typography.fontSize.button,
});

const BackButtonTouchable = styled.TouchableOpacity({
  marginTop: theme.spacing.lg,
  alignItems: 'center',
});

interface BackButtonTextProps {
  isDisabled?: boolean;
}
const BackButtonText = styled.Text<BackButtonTextProps>((props: BackButtonTextProps) => ({
  color: props.isDisabled ? theme.colors.text.disabled : theme.colors.primary,
  fontSize: theme.typography.fontSize.body2,
  fontWeight: 'bold',
}));

const ErrorText = styled.Text({
  color: theme.colors.error.main,
  marginBottom: theme.spacing.md,
  textAlign: 'center',
});

export default function SignupScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState(params.email as string || '');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, forceUpdate] = useState({});
  const { signUp, loading: authLoading, error } = useAuth();
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
  }>({ title: '', buttons: [] });

  // Shake animation hook
  const { shakeAnimation, triggerShake } = useShakeAnimation();

  const handleLanguageChange = () => {
    forceUpdate({});
  };

  const showAlert = (title: string, message?: string, buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }> = [{ text: t('common.ok') }]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const handleNicknameChange = (text: string) => {
    // Allow typing up to 15 characters, but prevent going beyond
    if (text.length <= 15) {
      setNickname(text);
    } else {
      // Trigger shake animation when trying to exceed limit
      triggerShake();
    }
  };

  const handleSignup = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (nickname.length < 2) {
      showAlert(t('common.error'), t('validation.nicknameTooShort'));
      return;
    }
    if (nickname.length > 15) {
      showAlert(t('common.error'), t('validation.nicknameTooLong'));
      return;
    }
    if (password !== confirmPassword) {
      showAlert(t('common.error'), t('validation.passwordMismatch'));
      return;
    }
    if (!email.includes('@')) {
        showAlert(t('common.error'), t('validation.invalidEmail'));
        return;
    }

    setIsSubmitting(true);
    try {
      // Get current language from i18n
      const currentLanguage = i18n.language as 'en' | 'pl';
      const newUser = await signUp(email, password, nickname, currentLanguage);
      
      if (newUser) {
        console.log('Signup successful, navigating to verification screen.');
        router.replace({ pathname: '/verify-email', params: { email } }); 
      } else {
        console.log('Signup failed (error likely set in context).');
      }
    } catch (err: any) {
      console.error('Signup handler error:', err);
      showAlert(t('common.error'), err.message || t('validation.unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || authLoading;

  return (
    <>
      <StyledKeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <Stack.Screen
          options={{
            title: t('auth.signup'),
            headerShown: true,
          }}
        />

        <LanguageSwitcher onLanguageChange={handleLanguageChange} />
        
        <FormContainer>
          <TitleText>{t('auth.signupTitle')}</TitleText>
          <SubtitleText>
            {t('auth.signupSubtitle')}
          </SubtitleText>

          {error && <ErrorText>{error}</ErrorText>}

          <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
            <StyledInput
              placeholder={t('auth.nickname')}
              value={nickname}
              onChangeText={handleNicknameChange}
              autoCapitalize="words"
              editable={!isLoading}
              onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
            />
          </Animated.View>

          <StyledInput
            placeholder={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
            onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
          />

          <StyledInput
            placeholder={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!isLoading}
            onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
          />

          <StyledInput
            placeholder={t('auth.password')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!isLoading}
            onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
          />

          <StyledButton 
            isDisabled={isLoading}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.text.light} />
            ) : (
              <ButtonText>{t('auth.signup')}</ButtonText>
            )}
          </StyledButton>

          <BackButtonTouchable 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              Keyboard.dismiss();
              router.replace('/login');
            }}
            disabled={isLoading}
          >
            <BackButtonText isDisabled={isLoading}>{t('auth.alreadyHaveAccount')}</BackButtonText>
          </BackButtonTouchable>
        </FormContainer>
      </StyledKeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={hideAlert}
      />
    </>
  );
} 