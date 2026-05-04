import theme from '@/constants/theme'
import { StyleSheet, Text, View } from 'react-native'

type ChipVariant =
  | 'verified'
  | 'pending'
  | 'category'
  | 'category-large'
  | 'ai-verified'
  | 'bank-grade'

type Props = {
  variant: ChipVariant
  label: string
  icon?: React.ReactNode
}

const Chip = ({ variant, label, icon }: Props) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'verified':
        return [styles.base, styles.verifiedContainer]
      case 'pending':
        return [styles.base, styles.pendingContainer]
      case 'category':
        return [styles.base, styles.categoryContainer]
      case 'category-large':
        return [styles.base, styles.categoryLargeContainer]
      case 'ai-verified':
        return [styles.base, styles.aiVerifiedContainer]
      case 'bank-grade':
        return [styles.base, styles.bankGradeContainer]
      default:
        return [styles.base]
    }
  }

  const getTextStyle = () => {
    switch (variant) {
      case 'verified':
        return [styles.text, { color: theme.colors.secondary }]
      case 'pending':
        return [styles.text, { color: theme.colors.outline }]
      case 'category':
        return [styles.text, { color: theme.colors['primary-container'] }]
      case 'category-large':
        return [styles.textLarge, { color: theme.colors['on-secondary-container'] }]
      case 'ai-verified':
        return [styles.text, { color: theme.colors['on-secondary-container'] }]
      case 'bank-grade':
        return [styles.text, { color: theme.colors['on-secondary-container'] }]
      default:
        return [styles.text]
    }
  }

  return (
    <View style={getContainerStyle()}>
      {icon && <View style={styles.iconSlot}>{icon}</View>}
      {!icon && (variant === 'verified' || variant === 'pending') && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor:
                variant === 'verified' ? theme.colors.secondary : theme.colors.outline
            }
          ]}
        />
      )}
      <Text style={getTextStyle()}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start'
  },
  verifiedContainer: {
    backgroundColor: `${theme.colors.secondary}1A`,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1]
  },
  pendingContainer: {
    backgroundColor: `${theme.colors.outline}1A`,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1]
  },
  categoryContainer: {
    backgroundColor: `${theme.colors['primary-container']}1A`,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2
  },
  categoryLargeContainer: {
    backgroundColor: theme.colors['secondary-container'],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1]
  },
  aiVerifiedContainer: {
    backgroundColor: theme.colors['secondary-container'],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1]
  },
  bankGradeContainer: {
    backgroundColor: `${theme.colors['secondary-container']}4D`,
    borderWidth: 1,
    borderColor: `${theme.colors.secondary}1A`,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1]
  },
  text: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  textLarge: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: theme.spacing[1]
  },
  iconSlot: {
    marginRight: theme.spacing[1]
  }
})

export default Chip
