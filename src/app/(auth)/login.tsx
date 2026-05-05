import theme from '@/constants/theme'
import { useAuth } from '@/context/AuthContext'
import { useGoogle } from '@/context/GoogleContext'
import { router } from 'expo-router'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native'
import AppButton from '@/components/AppButton'
import AppInput from '@/components/AppInput'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useState } from 'react'
import Animated, { FadeInDown } from 'react-native-reanimated'

const LoginScreen = () => {
  const { login } = useAuth()
  const { signIn: googleSignIn } = useGoogle()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleLogin = async () => {
    let valid = true
    if (!email.trim()) {
      setEmailError('Email is required')
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Enter a valid email address')
      valid = false
    } else {
      setEmailError('')
    }
    if (!password) {
      setPasswordError('Password is required')
      valid = false
    } else {
      setPasswordError('')
    }
    if (!valid) return
    await login(email, password)
    router.replace('/(main)/home')
  }

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn()
    } catch (error) {
      console.error('Google sign-in failed:', error)
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
              <Text style={styles.forgotLink}>Forgot?</Text>
            </View>
          </View>

          <AppButton
            label="Continue"
            variant="primary"
            onPress={handleLogin}
            trailingIcon={<Text style={styles.arrow}>→</Text>}
          />
        </Animated.View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>AUTHENTICATION PROXY</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
          <MaterialIcons name="g-translate" size={20} color={theme.colors.primary} />
          <Text style={styles.socialLabel}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to the Lens? </Text>
          <Text style={styles.footerLink} onPress={() => router.push('/(auth)/signup')}>
            Create an account
          </Text>
        </View>
      </ScrollView>
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing[6],
    gap: theme.spacing[3]
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors['outline-variant']
  },
  dividerText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors['on-surface-variant'],
    letterSpacing: 1.5
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    height: 52,
    backgroundColor: theme.colors['surface-container-lowest'],
    borderWidth: 1,
    borderColor: theme.colors['outline-variant'],
    borderRadius: theme.radius.md
  },
  socialLabel: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary
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
  }
})

export default LoginScreen
