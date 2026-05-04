import theme from '@/constants/theme'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { useState } from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

type Props = {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  secureTextEntry?: boolean
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad'
  error?: string
}

const AppInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  error
}: Props) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={`${theme.colors.outline}99`}
          secureTextEntry={secureTextEntry && !showPassword}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry && (
          <MaterialIcons
            name={showPassword ? 'visibility' : 'visibility-off'}
            size={24}
            color={theme.colors.outline}
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          />
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: theme.spacing[4]
  },
  label: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: theme.colors['on-surface-variant'],
    marginBottom: theme.spacing[2],
    textTransform: 'uppercase'
  },
  inputContainer: {
    height: 48,
    backgroundColor: theme.colors['surface-container-low'],
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center'
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: `${theme.colors.primary}1A`
  },
  inputError: {
    borderWidth: 2,
    borderColor: theme.colors.error
  },
  input: {
    flex: 1,
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors['on-surface']
  },
  eyeIcon: {
    padding: theme.spacing[1]
  },
  errorText: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 13,
    color: theme.colors.error,
    marginTop: theme.spacing[1]
  }
})

export default AppInput
