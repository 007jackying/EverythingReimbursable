import theme from '@/constants/theme'
import { setSessionFromTokens, updatePassword } from '@/services/supabaseAuth'
import { validatePassword } from '@/utils/validators'
import { router } from 'expo-router'
import { useURL } from 'expo-linking'
import { useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import AppButton from '@/components/AppButton'
import AppInput from '@/components/AppInput'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

// Supabase recovery links deliver tokens in the URL fragment:
// everythingreimbursable://reset-password#access_token=...&refresh_token=...&type=recovery
const parseFragmentParams = (url: string): Record<string, string> => {
  const fragment = url.split('#')[1]
  if (!fragment) return {}
  return fragment.split('&').reduce<Record<string, string>>((acc, pair) => {
    const [key, value] = pair.split('=')
    if (key && value !== undefined) acc[key] = decodeURIComponent(value)
    return acc
  }, {})
}

type RecoveryState = 'pending' | 'ready' | 'invalid'

const ResetPasswordScreen = () => {
  const url = useURL()
  const [recoveryState, setRecoveryState] = useState<RecoveryState>('pending')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!url) return
    const params = parseFragmentParams(url)
    if (params.access_token && params.refresh_token) {
      setSessionFromTokens(params.access_token, params.refresh_token).then(({ error }) => {
        setRecoveryState(error ? 'invalid' : 'ready')
      })
    } else {
      setRecoveryState('invalid')
    }
  }, [url])

  const handleSave = async () => {
    const passErr = validatePassword(newPassword)
    setPasswordError(passErr || '')
    setConfirmError(newPassword !== confirmPassword ? 'Passwords do not match' : '')
    if (passErr || newPassword !== confirmPassword) return

    setIsSaving(true)
    const { error } = await updatePassword(newPassword)
    setIsSaving(false)

    if (error) {
      Alert.alert('Update failed', error)
      return
    }
    Alert.alert('Password updated', 'You are signed in with your new password.', [
      { text: 'Continue', onPress: () => router.replace('/(main)/home') }
    ])
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
            <MaterialIcons name="lock-reset" size={24} color={theme.colors['on-primary']} />
          </View>
          <Text style={styles.appNameSmall}>EverythingReimbursable</Text>
        </View>

        {recoveryState === 'invalid' ? (
          <View style={styles.form}>
            <Text style={styles.heading}>Link expired.</Text>
            <Text style={styles.subHeading}>
              This password reset link is invalid or has expired. Request a new one from the sign in
              screen.
            </Text>
            <AppButton
              label="Back to Sign In"
              variant="primary"
              onPress={() => router.replace('/(auth)/login')}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.heading}>New password.</Text>
            <Text style={styles.subHeading}>Choose a new password for your account.</Text>

            <View style={styles.fields}>
              <AppInput
                label="NEW PASSWORD"
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t)
                  setPasswordError('')
                }}
                placeholder="Enter new password"
                secureTextEntry
                error={passwordError}
              />
              <AppInput
                label="CONFIRM PASSWORD"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t)
                  setConfirmError('')
                }}
                placeholder="Repeat new password"
                secureTextEntry
                error={confirmError}
              />
            </View>

            <AppButton
              label={isSaving ? 'Saving...' : 'Save Password'}
              variant={recoveryState === 'ready' && !isSaving ? 'primary' : 'disabled'}
              onPress={handleSave}
            />
          </View>
        )}
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
  }
})

export default ResetPasswordScreen
