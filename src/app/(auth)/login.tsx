import theme from '@/constants/theme'
import { useAuth } from '@/context/AuthContext'
import { validateEmail, validatePassword } from '@/utils/validators'
import { router } from 'expo-router'
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import AppButton from '@/components/AppButton'
import AppInput from '@/components/AppInput'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useState } from 'react'
import Animated, { FadeInDown } from 'react-native-reanimated'

const LoginScreen = () => {
  const { login, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Forgot password modal
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [isSendingReset, setIsSendingReset] = useState(false)

  const handleLogin = async () => {
    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)

    setEmailError(emailErr || '')
    setPasswordError(passErr || '')

    if (emailErr || passErr) return

    try {
      await login(email, password)
      router.replace('/(main)/home')
    } catch (e) {
      Alert.alert('Sign in failed', (e as Error).message)
    }
  }

  const openForgot = () => {
    setForgotEmail(email)
    setForgotError('')
    setForgotOpen(true)
  }

  const handleSendReset = async () => {
    const emailErr = validateEmail(forgotEmail)
    if (emailErr) {
      setForgotError(emailErr)
      return
    }
    setIsSendingReset(true)
    try {
      await resetPassword(forgotEmail)
      setForgotOpen(false)
      Alert.alert(
        'Check your email',
        `If an account exists for ${forgotEmail}, a password reset link is on its way.`
      )
    } catch (e) {
      setForgotError((e as Error).message)
    } finally {
      setIsSendingReset(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoSmall}>
            <MaterialIcons name="receipt-long" size={24} color={theme.colors['on-primary']} />
          </View>
          <Text style={styles.appNameSmall}>EverythingReimbursable</Text>
        </View>

        <Animated.View entering={FadeInDown.duration(400)} style={styles.form}>
          <Text style={styles.heading}>Welcome back.</Text>
          <Text style={styles.subHeading}>Step back into your curated financial world.</Text>

          <View style={styles.fields}>
            <AppInput
              label="EMAIL ADDRESS"
              value={email}
              onChangeText={(t) => {
                setEmail(t)
                setEmailError('')
              }}
              placeholder="you@example.com"
              keyboardType="email-address"
              error={emailError}
            />
            <View>
              <AppInput
                label="PASSWORD"
                value={password}
                onChangeText={(t) => {
                  setPassword(t)
                  setPasswordError('')
                }}
                error={passwordError}
                placeholder="Enter your password"
                secureTextEntry
              />
              <Text
                style={styles.forgotLink}
                onPress={openForgot}
                accessibilityRole="button"
                accessibilityLabel="Forgot password"
              >
                Forgot?
              </Text>
            </View>
          </View>

          <AppButton
            label="Continue"
            variant="primary"
            onPress={handleLogin}
            trailingIcon={<Text style={styles.arrow}>→</Text>}
          />
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to the Lens? </Text>
          <Text style={styles.footerLink} onPress={() => router.push('/(auth)/signup')}>
            Create an account
          </Text>
        </View>
      </ScrollView>

      {/* Forgot password modal */}
      <Modal
        visible={forgotOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setForgotOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setForgotOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Reset password</Text>
            <Text style={styles.modalSub}>Enter your email and we will send you a reset link.</Text>
            <AppInput
              label="EMAIL ADDRESS"
              value={forgotEmail}
              onChangeText={(t) => {
                setForgotEmail(t)
                setForgotError('')
              }}
              placeholder="you@example.com"
              keyboardType="email-address"
              error={forgotError}
            />
            <AppButton
              label={isSendingReset ? 'Sending...' : 'Send Reset Link'}
              variant={isSendingReset ? 'disabled' : 'primary'}
              onPress={handleSendReset}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[12]
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[10]
  },
  logoSmall: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  appNameSmall: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary
  },
  form: {
    marginBottom: theme.spacing[6]
  },
  heading: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: theme.spacing[2]
  },
  subHeading: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors['on-surface-variant'],
    marginBottom: theme.spacing[8]
  },
  fields: {
    marginBottom: theme.spacing[6]
  },
  forgotLink: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.secondary,
    textAlign: 'right',
    marginTop: -theme.spacing[3],
    marginBottom: theme.spacing[4]
  },
  arrow: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors['on-primary']
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: theme.spacing[8]
  },
  footerText: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 14,
    color: theme.colors['on-surface-variant']
  },
  footerLink: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 28, 27, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[6]
  },
  modalCard: {
    backgroundColor: theme.colors['surface-container-lowest'],
    borderRadius: theme.radius.lg,
    padding: theme.spacing[6],
    gap: theme.spacing[4]
  },
  modalTitle: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary
  },
  modalSub: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 14,
    color: theme.colors['on-surface-variant']
  }
})

export default LoginScreen
