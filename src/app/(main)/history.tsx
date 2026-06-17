import theme from '@/constants/theme'
import { formatAmount, formatDate } from '@/utils/formatters'
import { STATUS_LABELS, CATEGORY_LABELS } from '@/constants/app'
import { useReceipts } from '@/context/ReceiptsContext'
import { getCategoryIcon } from '@/utils/categories'
import { exportReceiptsCsv } from '@/utils/exportCsv'
import { isCurrentMonth, getMonthYear } from '@/utils/time'
import { router } from 'expo-router'
import { Alert, Pressable, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native'
import SearchBar from '@/components/SearchBar'
import FilterTab from '@/components/FilterTab'
import HistoryListItem from '@/components/HistoryListItem'
import TimelineHeader from '@/components/TimelineHeader'
import AppButton from '@/components/AppButton'
import ScreenHeader from '@/components/ScreenHeader'
import FilterSheet from '@/components/FilterSheet'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { memo, useCallback, useMemo, useState } from 'react'
import type { Receipt, ReceiptStatus } from '@/types/receipt'

type FilterMode = 'All' | 'This Month' | 'By Category' | 'Filters'

const FILTER_MODES: FilterMode[] = ['All', 'This Month', 'By Category', 'Filters']

const getEmptySubtext = (query: string, filter: FilterMode) => {
  if (query) return `No receipts match "${query}"`
  if (filter === 'This Month') return 'You have not added any receipts this month.'
  return 'Scan your first receipt to get started.'
}

const ItemSeparator = () => <View style={styles.itemSeparator} />

// Memoized row — receipt references are stable across list re-renders, so
// rows skip re-rendering while searching/filtering
const ReceiptRow = memo(
  ({
    receipt,
    onItemPress,
    onItemLongPress
  }: {
    receipt: Receipt
    onItemPress: (id: string) => void
    onItemLongPress: (receipt: Receipt) => void
  }) => (
    <HistoryListItem
      merchantName={receipt.companyName}
      date={formatDate(receipt.date)}
      amount={formatAmount(receipt.totalAmount, receipt.currency)}
      category={receipt.category}
      status={receipt.status}
      iconName={getCategoryIcon(receipt.category) as any}
      onPress={() => onItemPress(receipt.id)}
      onLongPress={() => onItemLongPress(receipt)}
    />
  )
)
ReceiptRow.displayName = 'ReceiptRow'

const matchesSearch = (receipt: Receipt, search: string): boolean => {
  if (!search.trim()) return true
  const query = search.toLowerCase()
  return (
    receipt.companyName.toLowerCase().includes(query) ||
    receipt.category.toLowerCase().includes(query) ||
    (receipt.notes?.toLowerCase().includes(query) ?? false)
  )
}

const HistoryScreen = () => {
  const { receipts, deleteReceipt } = useReceipts()
  const [isExporting, setIsExporting] = useState(false)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

  // ponytail: Inlined filtering state & logic from useReceiptFilter hook (YAGNI/ultra)
  const [filterMode, setFilterMode] = useState<FilterMode>('All')
  const [searchText, setSearchText] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ReceiptStatus | 'all'>('all')

  const filteredReceipts = useMemo(() => {
    let result = receipts

    // Apply search filter
    result = result.filter((r) => matchesSearch(r, searchText))

    // Apply mode-based filters
    if (filterMode === 'This Month') {
      result = result.filter((r) => isCurrentMonth(r.date))
    } else if (filterMode === 'Filters') {
      if (selectedStatus !== 'all') {
        result = result.filter((r) => r.status === selectedStatus)
      }
    }

    // Sort by date descending
    return [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [receipts, filterMode, searchText, selectedStatus])

  const groupedReceipts = useMemo(() => {
    if (filterMode === 'By Category') {
      return filteredReceipts.reduce<Record<string, Receipt[]>>((acc, r) => {
        const key = CATEGORY_LABELS[r.category] ?? r.category
        ;(acc[key] ??= []).push(r)
        return acc
      }, {})
    }

    return filteredReceipts.reduce<Record<string, Receipt[]>>((acc, r) => {
      const key = getMonthYear(r.date)
      ;(acc[key] ??= []).push(r)
      return acc
    }, {})
  }, [filteredReceipts, filterMode])

  const isEmpty = filteredReceipts.length === 0

  const sections = useMemo(
    () => Object.entries(groupedReceipts).map(([title, data]) => ({ title, data })),
    [groupedReceipts]
  )

  const handleItemPress = useCallback((id: string) => {
    router.push({ pathname: '/receipt-detail', params: { id } })
  }, [])

  const handleItemLongPress = useCallback(
    (receipt: Receipt) => {
      Alert.alert('Delete Receipt', `Delete receipt from ${receipt.companyName}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteReceipt(receipt.id) }
      ])
    },
    [deleteReceipt]
  )

  const handleExport = async () => {
    if (isExporting) return
    setIsExporting(true)
    try {
      await exportReceiptsCsv(receipts)
    } catch (e) {
      Alert.alert('Export failed', (e as Error).message)
    } finally {
      setIsExporting(false)
    }
  }

  const handleFilterTabPress = (f: FilterMode) => {
    setFilterMode(f)
    if (f === 'Filters') setFilterPanelOpen(true)
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        ItemSeparatorComponent={ItemSeparator}
        renderSectionHeader={({ section }) => (
          <TimelineHeader label={section.title.toUpperCase()} />
        )}
        renderItem={({ item: receipt }) => (
          <ReceiptRow
            receipt={receipt}
            onItemPress={handleItemPress}
            onItemLongPress={handleItemLongPress}
          />
        )}
        ListHeaderComponent={
          <View>
            <ScreenHeader />

            <Text style={styles.pageTitle}>History</Text>
            <Text style={styles.pageSub}>Your digital archive of curated expenses.</Text>

            <SearchBar value={searchText} onChangeText={setSearchText} />

            {/* Filter tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterRow}
              contentContainerStyle={styles.filterContent}
            >
              {FILTER_MODES.map((f) => (
                <FilterTab
                  key={f}
                  label={
                    f === 'Filters' && selectedStatus !== 'all'
                      ? `Status: ${STATUS_LABELS[selectedStatus] ?? selectedStatus}`
                      : f
                  }
                  active={filterMode === f}
                  onPress={() => handleFilterTabPress(f)}
                  icon={
                    f === 'Filters' ? (
                      <MaterialIcons
                        name="tune"
                        size={16}
                        color={
                          filterMode === f
                            ? theme.colors['on-primary']
                            : theme.colors['on-surface-variant']
                        }
                      />
                    ) : undefined
                  }
                />
              ))}
            </ScrollView>

            {/* Active filter badge */}
            {filterMode === 'Filters' && selectedStatus !== 'all' && (
              <View style={styles.activeBadgeRow}>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>
                    Status: {STATUS_LABELS[selectedStatus] ?? selectedStatus.toUpperCase()}
                  </Text>
                  <Pressable onPress={() => setSelectedStatus('all')} hitSlop={8}>
                    <MaterialIcons
                      name="close"
                      size={14}
                      color={theme.colors['on-primary-container']}
                    />
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="receipt-long" size={40} color={theme.colors.outline} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchText ? 'No results found' : 'No receipts yet'}
            </Text>
            <Text style={styles.emptySub}>{getEmptySubtext(searchText, filterMode)}</Text>
            {!searchText && (
              <AppButton
                label="Scan Receipt"
                variant="primary"
                onPress={() => router.push('/(main)/scan')}
                trailingIcon={
                  <MaterialIcons name="camera-alt" size={18} color={theme.colors['on-primary']} />
                }
              />
            )}
          </View>
        }
        ListFooterComponent={
          !isEmpty ? (
            <View style={styles.exportCard}>
              <MaterialIcons
                name="ios-share"
                size={80}
                color={`${theme.colors.primary}0D`}
                style={styles.exportBgIcon}
              />
              <Text style={styles.exportTitle}>Export History</Text>
              <Text style={styles.exportDesc}>
                Download a detailed report of all your receipt data.
              </Text>
              <AppButton
                label={isExporting ? 'Exporting...' : 'Download Report'}
                variant={isExporting ? 'disabled' : 'primary'}
                onPress={handleExport}
              />
            </View>
          ) : null
        }
      />

      {/* Filters bottom sheet */}
      <FilterSheet
        visible={filterPanelOpen}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        onClose={() => setFilterPanelOpen(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  container: {
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[10]
  },
  pageTitle: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 30,
    fontWeight: '800',
    color: theme.colors.primary
  },
  pageSub: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors['on-surface-variant'],
    opacity: 0.7,
    marginBottom: theme.spacing[6]
  },
  filterRow: { marginVertical: theme.spacing[4] },
  filterContent: {
    gap: theme.spacing[2],
    paddingRight: theme.spacing[6]
  },
  activeBadgeRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing[3]
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    backgroundColor: theme.colors['primary-container'],
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1]
  },
  activeBadgeText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors['on-primary-container'],
    letterSpacing: 1
  },
  itemSeparator: { height: theme.spacing[3] },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing[16],
    gap: theme.spacing[3]
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors['surface-container-low'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2]
  },
  emptyTitle: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary
  },
  emptySub: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 14,
    color: theme.colors['on-surface-variant'],
    textAlign: 'center',
    marginBottom: theme.spacing[4]
  },
  // Export card
  exportCard: {
    backgroundColor: theme.colors['surface-container-low'],
    borderRadius: theme.radius.xl,
    padding: theme.spacing[6],
    marginTop: theme.spacing[8],
    overflow: 'hidden'
  },
  exportBgIcon: { position: 'absolute', right: -10, top: -10 },
  exportTitle: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing[1]
  },
  exportDesc: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors['on-surface-variant'],
    marginBottom: theme.spacing[4]
  }
})

export default HistoryScreen
