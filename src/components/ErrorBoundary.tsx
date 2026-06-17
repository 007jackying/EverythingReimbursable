import theme from '@/constants/theme'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

// Error boundaries must be class components — React has no hook equivalent
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled error:', error, errorInfo.componentStack)
  }

  handleRetry = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    const { children } = this.props

    if (!error) {
      return children
    }

    return (
      <View style={styles.container}>
        <Text style={styles.label}>SOMETHING WENT WRONG</Text>
        <Text style={styles.title}>We hit a snag.</Text>
        <Text style={styles.message}>
          An unexpected error occurred. Your receipts are safe — try again.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Try again"
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={this.handleRetry}
        >
          <Text style={styles.buttonText}>Try Again →</Text>
        </Pressable>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[6]
  },
  label: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors['on-surface-variant'],
    marginBottom: theme.spacing[3]
  },
  title: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing[2]
  },
  message: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    color: theme.colors['on-surface-variant'],
    textAlign: 'center',
    marginBottom: theme.spacing[8]
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    height: 56,
    minWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[6]
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }]
  },
  buttonText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors['on-primary']
  }
})

export default ErrorBoundary
