import theme from '@/constants/theme'
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

type ButtonVariant = 'primary' | 'ghost' | 'quick-action-dark' | 'quick-action-light' | 'disabled'

type Props = {
  label: string
  variant?: ButtonVariant
  onPress?: () => void
  icon?: React.ReactNode
  trailingIcon?: React.ReactNode
  fullWidth?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const AppButton = ({
  label,
  variant = 'primary',
  onPress,
  icon,
  trailingIcon,
  fullWidth = true
}: Props) => {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 200 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 200 })
  }

  const getContainerStyle = () => {
    const base: ViewStyle[] = [styles.base]
    if (fullWidth) base.push(styles.fullWidth)

    switch (variant) {
      case 'primary':
        base.push(styles.primaryContainer)
        break
      case 'ghost':
        base.push(styles.ghostContainer)
        break
      case 'quick-action-dark':
        base.push(styles.quickActionDarkContainer)
        break
      case 'quick-action-light':
        base.push(styles.quickActionLightContainer)
        break
      case 'disabled':
        base.push(styles.disabledContainer)
        break
      default:
        break
    }
    return base
  }

  const getLabelStyle = () => {
    switch (variant) {
      case 'primary':
      case 'quick-action-dark':
        return [styles.label, { color: theme.colors['on-primary'] }]
      case 'ghost':
        return [styles.label, { color: theme.colors.primary }]
      case 'quick-action-light':
        return [styles.label, { color: theme.colors.primary }]
      case 'disabled':
        return [styles.label, { color: theme.colors['on-surface-variant'] }]
      default:
        return [styles.label, { color: theme.colors['on-surface'] }]
    }
  }

  return (
    <AnimatedPressable
      style={[getContainerStyle(), animatedStyle]}
      onPress={variant === 'disabled' ? undefined : onPress}
      onPressIn={variant === 'disabled' ? undefined : handlePressIn}
      onPressOut={variant === 'disabled' ? undefined : handlePressOut}
      disabled={variant === 'disabled'}
    >
      {icon && <View style={styles.iconSlot}>{icon}</View>}
      <Text style={getLabelStyle()}>{label}</Text>
      {trailingIcon && <View style={styles.trailingIconSlot}>{trailingIcon}</View>}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md
  },
  fullWidth: {
    width: '100%'
  },
  primaryContainer: {
    height: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md
  },
  ghostContainer: {
    height: 52,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors['outline-variant'],
    borderRadius: theme.radius.md
  },
  quickActionDarkContainer: {
    paddingVertical: theme.spacing[5],
    paddingHorizontal: theme.spacing[6],
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    flexDirection: 'column',
    gap: theme.spacing[2]
  },
  quickActionLightContainer: {
    paddingVertical: theme.spacing[5],
    paddingHorizontal: theme.spacing[6],
    backgroundColor: theme.colors['surface-container-high'],
    borderRadius: theme.radius.lg,
    flexDirection: 'column',
    gap: theme.spacing[2]
  },
  disabledContainer: {
    height: 52,
    backgroundColor: theme.colors['surface-container-high'],
    borderRadius: theme.radius.md
  },
  label: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  iconSlot: {
    marginRight: theme.spacing[2]
  },
  trailingIconSlot: {
    marginLeft: theme.spacing[2]
  }
})

export default AppButton
