import theme from '@/constants/theme'
import { useAuth } from '@/context/AuthContext'
import { router } from 'expo-router'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import AppButton from '@/components/AppButton'
import AppInput from '@/components/AppInput'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useState } from 'react'

const SignUpScreen = () => {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleSignUp = async () => {
    let valid = true
    if (!fullName.trim()) {
      setNameError('Full name is required')
      valid = false
    } else {
      setNameError('')
    }
    if (!email.trim()) {
      setEmailError('Email is required')
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Enter a valid email address')
      valid = false
    } else {
      setEmailError('')
    }
    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      valid = false
    } else {
      setPasswordError('')
    }
    if (!valid) return
    await signUp(fullName, email, password)
    router.replace('/(main)/home')
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
          <Text style={styles.appNameSmall}>EverythingReimbursable</Text>
        </View>

        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.subHeading}>Start curating your digital archives today.</Text>

        <View style={styles.fields}>
          <AppInput
            label="FULL NAME"
            value={fullName}
            onChangeText={(t) => {
              setFullName(t)
              setNameError('')
            }}
            placeholder="Your full name"
            autoCapitalize="words"
            error={nameError}
          />
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
          <AppInput
            label="PASSWORD"
            value={password}
            onChangeText={(t) => {
              setPassword(t)
              setPasswordError('')
            }}
            placeholder="Create a password (min. 6 chars)"
            secureTextEntry
            error={passwordError}
          />
        </View>

        <View style={styles.checkboxRow}>
          <MaterialIcons
            name={agreeTerms ? 'check-box' : 'check-box-outline-blank'}
            size={20}
            color={agreeTerms ? theme.colors.secondary : theme.colors.outline}
            onPress={() => setAgreeTerms(!agreeTerms)}
          />
          <Text style={styles.checkboxText}>
            I agree to the <Text style={styles.checkboxLink}>Terms of Service</Text> and{' '}
            <Text style={styles.checkboxLink}>Privacy Policy</Text>
          </Text>
        </View>

        <AppButton
          label="Create Account"
          variant={agreeTerms ? 'primary' : 'disabled'}
          onPress={agreeTerms ? handleSignUp : undefined}
          trailingIcon={agreeTerms ? <Text style={styles.arrow}>→</Text> : undefined}
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <View style={styles.socialButton}>
            <MaterialIcons name="g-translate" size={20} color={theme.colors.primary} />
            <Text style={styles.socialLabel}>Google</Text>
          </View>
          <View style={styles.socialButton}>
            <MaterialIcons name="apple" size={20} color={theme.colors.primary} />
            <Text style={styles.socialLabel}>Apple</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already part of the collection? </Text>
          <Text style={styles.footerLink} onPress={() => router.back()}>
            Sign In
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
    marginBottom: theme.spacing[6]
  },
  appNameSmall: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary
  },
  heading: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.primary
  },
  subHeading: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors['on-surface-variant'],
    marginBottom: theme.spacing[6]
  },
  fields: {
    marginBottom: theme.spacing[4]
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[6]
  },
  checkboxText: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 13,
    color: theme.colors['on-surface-variant'],
    flex: 1
  },
  checkboxLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
    color: theme.colors.primary
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
  socialRow: {
    flexDirection: 'row',
    gap: theme.spacing[3]
  },
  socialButton: {
    flex: 1,
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
    textDecorationLine: 'underline',
    color: theme.colors.primary
  }
})

export default SignUpScreen
