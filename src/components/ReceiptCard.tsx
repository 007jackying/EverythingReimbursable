import theme from '@/constants/theme'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Chip from './Chip'

type ReceiptStatus = 'verified' | 'pending' | 'failed'

type Props = {
  merchantName: string
  date: string
  amount: string
  category: string
  status: ReceiptStatus
  onPress?: () => void
}

const ReceiptCard = ({ merchantName, date, amount, category, status, onPress }: Props) => (
  <Pressable style={styles.container} onPress={onPress}>
    <View style={styles.avatarContainer}>
      <MaterialIcons name="storefront" size={24} color={theme.colors.primary} />
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
        {status === 'verified' && <Chip variant="verified" label="VERIFIED" />}
        {status === 'pending' && <Chip variant="pending" label="PENDING" />}
        <Chip variant="category" label={category.toUpperCase()} />
      </View>
    </View>
  </Pressable>
)

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors['surface-container-lowest'],
    borderRadius: theme.radius.xl,
    padding: theme.spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors['surface-container-low'],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[4]
  },
  content: {
    flex: 1
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[1]
  },
  merchantName: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
    flex: 1,
    marginRight: theme.spacing[2]
  },
  amount: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2]
  },
  date: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 12,
    color: theme.colors['on-surface-variant']
  }
})

export default ReceiptCard
