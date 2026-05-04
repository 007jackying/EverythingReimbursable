import theme from '@/constants/theme'
import { StyleSheet, Text, View } from 'react-native'

type Props = {
  totalAmount: string
  receiptCount?: number
  monthlyAmount?: string
  monthlyCount?: number
  aiAccuracy?: string
}

const SummaryCard = ({
  totalAmount,
  receiptCount,
  monthlyAmount,
  monthlyCount,
  aiAccuracy
}: Props) => (
  <View style={styles.container}>
    <View style={styles.decorativeCircleTop} />
    <View style={styles.decorativeCircleBottom} />
    <Text style={styles.label}>TOTAL EXPENSES</Text>
    <Text style={styles.amount}>{totalAmount}</Text>
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>THIS MONTH</Text>
        <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
          {monthlyAmount ?? '$0'}
        </Text>
        {monthlyCount !== undefined && <Text style={styles.statSub}>{monthlyCount} receipts</Text>}
      </View>
      <View style={styles.divider} />
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>ALL TIME</Text>
        <Text style={styles.statValue}>{receiptCount ?? 0}</Text>
        <Text style={styles.statSub}>receipts total</Text>
      </View>
    </View>
    {aiAccuracy && (
      <View style={styles.accuracyRow}>
        <View style={styles.accuracyDot} />
        <Text style={styles.accuracyText}>AI Accuracy {aiAccuracy}</Text>
        <Text style={styles.accuracyLink}>View Insights →</Text>
      </View>
    )}
  </View>
)

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors['primary-container'],
    borderRadius: theme.radius.hero,
    padding: theme.spacing[8],
    overflow: 'hidden'
  },
  decorativeCircleTop: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${theme.colors.secondary}1A`
  },
  decorativeCircleBottom: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${theme.colors.primary}33`
  },
  label: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: theme.colors['on-primary-container'],
    textTransform: 'uppercase'
  },
  amount: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors['on-primary'],
    marginTop: theme.spacing[2]
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    marginTop: theme.spacing[5]
  },
  statItem: {
    flex: 1
  },
  statLabel: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors['on-primary-container'],
    textTransform: 'uppercase',
    letterSpacing: 1.5
  },
  statValue: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 30,
    fontWeight: '700',
    color: theme.colors['on-primary'],
    marginTop: theme.spacing[1]
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: theme.spacing[4]
  },
  statSub: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors['on-primary-container'],
    marginTop: 2,
    letterSpacing: 0.5
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing[5],
    gap: theme.spacing[2]
  },
  accuracyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.secondary
  },
  accuracyText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors['secondary-fixed']
  },
  accuracyLink: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors['on-primary'],
    marginLeft: 'auto'
  }
})

export default SummaryCard
