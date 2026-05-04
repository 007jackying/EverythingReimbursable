import theme from '@/constants/theme'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Chip from './Chip'

type Props = {
  merchantName: string
  date: string
  amount: string
  category: string
  status: 'verified' | 'pending' | 'failed'
  iconName?: keyof typeof MaterialIcons.glyphMap
  onPress?: () => void
  onLongPress?: () => void
}

const HistoryListItem = ({
  merchantName,
  date,
  amount,
  category,
  status,
  iconName = 'storefront',
  onPress,
  onLongPress
}: Props) => (
  <Pressable style={styles.container} onPress={onPress} onLongPress={onLongPress}>
    <View style={styles.iconContainer}>
      <MaterialIcons name={iconName} size={24} color={theme.colors.primary} />
    </View>
    <View style={styles.content}>
      <View style={styles.topRow}>
        <Text style={styles.merchantName} numberOfLines={1}>
          {merchantName}
        </Text>
        <Text style={styles.amount}>{amount}</Text>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.date}>{date}</Text>
        <View style={styles.separatorDot} />
        <Chip variant="category" label={category.toUpperCase()} />
        {status === 'verified' && <Chip variant="verified" label="VERIFIED" />}
        {status === 'pending' && <Chip variant="pending" label="PENDING" />}
      </View>
    </View>
  </Pressable>
)

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors['surface-container-lowest'],
    borderRadius: theme.radius.md,
    padding: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors['surface-container-low'],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3]
  },
  content: {
    flex: 1
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  merchantName: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
    flex: 1,
    marginRight: theme.spacing[2]
  },
  amount: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2]
  },
  date: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 12,
    color: theme.colors['on-surface-variant']
  },
  separatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors['outline-variant']
  }
})

export default HistoryListItem
