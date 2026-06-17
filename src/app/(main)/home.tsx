import theme from '@/constants/theme'
import { formatAmount, formatDate } from '@/utils/formatters'
import { getGreeting, isCurrentMonth } from '@/utils/time'
import { copyImageToCache } from '@/utils/fileHandler'
import { useReceipts } from '@/context/ReceiptsContext'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import SummaryCard from '@/components/SummaryCard'
import ReceiptCard from '@/components/ReceiptCard'
import AppButton from '@/components/AppButton'
import ScreenHeader from '@/components/ScreenHeader'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { RECENT_RECEIPTS_LIMIT } from '@/constants/app'

const HomeScreen = () => {
  const { receipts, syncWithCloud } = useReceipts()
  const { user } = useAuth()
  const { currency } = useCurrency()
  const [refreshing, setRefreshing] = useState(false)

  const {
    monthlyTotal,
    monthlyCount,
    totalExpenses,
    avgConfidence,
    hasMixedCurrencies,
    displayCurrency
  } = useMemo(() => {
    const monthlyReceipts = receipts.filter((r) => isCurrentMonth(r.date))
    // Sums are nominal — no FX conversion. With a single receipt currency, totals
    // display in it; with mixed currencies, the preferred currency + a note.
    const distinctCurrencies = [...new Set(receipts.map((r) => r.currency))]
    return {
      monthlyTotal: monthlyReceipts.reduce((sum, r) => sum + r.totalAmount, 0),
      monthlyCount: monthlyReceipts.length,
      totalExpenses: receipts.reduce((sum, r) => sum + r.totalAmount, 0),
      avgConfidence:
        receipts.length > 0
          ? receipts.reduce((sum, r) => sum + r.confidence, 0) / receipts.length
          : null,
      hasMixedCurrencies: distinctCurrencies.length > 1,
      displayCurrency: distinctCurrencies.length === 1 ? distinctCurrencies[0] : currency
    }
  }, [receipts, currency])

  const recentReceipts = receipts.slice(0, RECENT_RECEIPTS_LIMIT)
  const hasMore = receipts.length > RECENT_RECEIPTS_LIMIT

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await syncWithCloud()
    } finally {
      setRefreshing(false)
    }
  }, [syncWithCloud])

  const handleUploadPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85
    })
    if (!result.canceled && result.assets[0]) {
      try {
        const destUri = await copyImageToCache(result.assets[0].uri)
        router.push({ pathname: '/ai-processing', params: { imageUri: destUri } })
      } catch (error) {
        console.error('[Home] Failed to copy image:', error)
      }
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.secondary}
            colors={[theme.colors.secondary]}
          />
        }
      >
        <View style={styles.container}>
          <ScreenHeader />

          <View style={styles.greeting}>
            <Text style={styles.greetingText}>
              {getGreeting()}, {user?.name?.split(' ')[0] ?? 'there'}
            </Text>
            <Text style={styles.greetingSub}>Ready to organize your finances?</Text>
          </View>

          <SummaryCard
            totalAmount={formatAmount(totalExpenses, displayCurrency)}
            receiptCount={receipts.length}
            monthlyAmount={formatAmount(monthlyTotal, displayCurrency)}
            monthlyCount={monthlyCount}
            aiAccuracy={avgConfidence !== null ? `${(avgConfidence * 100).toFixed(1)}%` : undefined}
            mixedCurrencies={hasMixedCurrencies}
            onInsightsPress={() => router.push('/(main)/history')}
          />

          <View style={styles.quickActions}>
            <View style={styles.quickActionItem}>
              <AppButton
                label="Scan Receipt"
                variant="quick-action-dark"
                onPress={() => router.push('/(main)/scan')}
                icon={
                  <MaterialIcons name="camera-alt" size={24} color={theme.colors['on-primary']} />
                }
              />
            </View>
            <View style={styles.quickActionItem}>
              <AppButton
                label="Upload Photo"
                variant="quick-action-light"
                onPress={handleUploadPhoto}
                icon={<MaterialIcons name="photo-library" size={24} color={theme.colors.primary} />}
              />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Receipts</Text>
            <Text style={styles.sectionLink} onPress={() => router.push('/(main)/history')}>
              {hasMore ? `View All (${receipts.length})` : 'View All'}
            </Text>
          </View>

          {recentReceipts.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="receipt-long" size={36} color={theme.colors.outline} />
              </View>
              <Text style={styles.emptyTitle}>No receipts yet</Text>
              <Text style={styles.emptySub}>Scan your first receipt and it will appear here.</Text>
            </View>
          ) : (
            <View style={styles.receiptList}>
              {recentReceipts.map((receipt) => (
                <ReceiptCard
                  key={receipt.id}
                  merchantName={receipt.companyName}
                  date={formatDate(receipt.date)}
                  amount={formatAmount(receipt.totalAmount, receipt.currency)}
                  category={receipt.category}
                  status={receipt.status}
                  onPress={() =>
                    router.push({
                      pathname: '/receipt-detail',
                      params: { id: receipt.id }
                    })
                  }
                />
              ))}
              {hasMore && (
                <View style={styles.viewMoreRow}>
                  <Text style={styles.viewMoreText} onPress={() => router.push('/(main)/history')}>
                    {receipts.length - RECENT_RECEIPTS_LIMIT} more in History →
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  scrollView: {
    flex: 1
  },
  container: {
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[10]
  },
  greeting: {
    marginBottom: theme.spacing[6]
  },
  greetingText: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 30,
    fontWeight: '700',
    color: theme.colors.primary
  },
  greetingSub: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors['on-surface-variant'],
    marginTop: theme.spacing[1]
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginTop: theme.spacing[6]
  },
  quickActionItem: {
    flex: 1
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing[8],
    marginBottom: theme.spacing[4]
  },
  sectionTitle: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary
  },
  sectionLink: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.secondary
  },
  receiptList: {
    gap: theme.spacing[4]
  },
  viewMoreRow: {
    alignItems: 'center',
    paddingVertical: theme.spacing[2]
  },
  viewMoreText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors['on-surface-variant']
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing[10],
    gap: theme.spacing[2]
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors['surface-container-low'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2]
  },
  emptyTitle: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary
  },
  emptySub: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 14,
    color: theme.colors['on-surface-variant'],
    textAlign: 'center'
  }
})

export default HomeScreen
