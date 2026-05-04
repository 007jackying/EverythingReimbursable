import theme from '@/constants/theme'
import { formatAmount, formatDate, getMonthYear } from '@/data/mockReceipts'
import { useReceipts } from '@/context/ReceiptsContext'
import type { Receipt, ReceiptCategory, ReceiptStatus } from '@/types/receipt'
import { getCategoryIcon } from '@/utils/categories'
import { exportReceiptsCsv } from '@/utils/exportCsv'
import { router } from 'expo-router'
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import SearchBar from '@/components/SearchBar'
import FilterTab from '@/components/FilterTab'
import HistoryListItem from '@/components/HistoryListItem'
import TimelineHeader from '@/components/TimelineHeader'
import AppButton from '@/components/AppButton'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'

type FilterMode = 'All' | 'This Month' | 'By Category' | 'Filters'

const FILTER_MODES: FilterMode[] = ['All', 'This Month', 'By Category', 'Filters']

const CATEGORY_LABELS: Record<ReceiptCategory, string> = {
  dining: 'Dining',
  grocery: 'Grocery',
  electronics: 'Electronics',
  travel: 'Travel',
  transport: 'Transport',
  healthcare: 'Healthcare',
  utilities: 'Utilities',
  other: 'Other'
}

const STATUS_OPTIONS: { label: string; value: ReceiptStatus | 'all' }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Verified', value: 'verified' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' }
]

// ── helpers ─────────────────────────────────────────────────────────────────

const isThisMonth = (isoDate: string) => {
  const d = new Date(isoDate)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

const groupByMonth = (list: Receipt[]) =>
  list.reduce<Record<string, Receipt[]>>((acc, r) => {
    const key = getMonthYear(r.date)
    ;(acc[key] ??= []).push(r)
    return acc
  }, {})

const groupByCategory = (list: Receipt[]) =>
  list.reduce<Record<string, Receipt[]>>((acc, r) => {
    const key = CATEGORY_LABELS[r.category] ?? r.category
    ;(acc[key] ??= []).push(r)
    return acc
  }, {})

const getEmptySubtext = (query: string, filter: FilterMode) => {
  if (query) return `No receipts match "${query}"`
  if (filter === 'This Month') return 'You have not added any receipts this month.'
  return 'Scan your first receipt to get started.'
}

// ── component ────────────────────────────────────────────────────────────────

const HistoryScreen = () => {
  const { receipts, deleteReceipt } = useReceipts()
  const [searchQuery, setSearchQuery] = useState('')
  const [isExporting, setIsExporting] = useState(false)

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
  const [activeFilter, setActiveFilter] = useState<FilterMode>('All')
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ReceiptStatus | 'all'>('all')

  // 1. search
  const searched = searchQuery
    ? receipts.filter((r) => r.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
    : receipts

  // 2. filter mode
  const filtered = (() => {
    switch (activeFilter) {
      case 'This Month':
        return searched.filter((r) => isThisMonth(r.date))
      case 'Filters':
        return statusFilter === 'all' ? searched : searched.filter((r) => r.status === statusFilter)
      default:
        return searched
    }
  })()

  // 3. group
  const grouped =
    activeFilter === 'By Category' ? groupByCategory(filtered) : groupByMonth(filtered)

  const isEmpty = filtered.length === 0

  const handleFilterTabPress = (f: FilterMode) => {
    setActiveFilter(f)
    if (f === 'Filters') setFilterPanelOpen(true)
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="menu" size={24} color={theme.colors.primary} />
            <Text style={styles.headerAppName}>EverythingReimbursable</Text>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={20} color={theme.colors['on-primary']} />
            </View>
          </View>

          <Text style={styles.pageTitle}>History</Text>
          <Text style={styles.pageSub}>Your digital archive of curated expenses.</Text>

          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

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
                  f === 'Filters' && statusFilter !== 'all'
                    ? `${CATEGORY_LABELS[statusFilter as ReceiptCategory] ?? statusFilter}`
                    : f
                }
                active={activeFilter === f}
                onPress={() => handleFilterTabPress(f)}
                icon={
                  f === 'Filters' ? (
                    <MaterialIcons
                      name="tune"
                      size={16}
                      color={
                        activeFilter === f
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
          {activeFilter === 'Filters' && statusFilter !== 'all' && (
            <View style={styles.activeBadgeRow}>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Status: {statusFilter.toUpperCase()}</Text>
                <Pressable onPress={() => setStatusFilter('all')} hitSlop={8}>
                  <MaterialIcons
                    name="close"
                    size={14}
                    color={theme.colors['on-primary-container']}
                  />
                </Pressable>
              </View>
            </View>
          )}

          {/* Empty state */}
          {isEmpty ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="receipt-long" size={40} color={theme.colors.outline} />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No results found' : 'No receipts yet'}
              </Text>
              <Text style={styles.emptySub}>{getEmptySubtext(searchQuery, activeFilter)}</Text>
              {!searchQuery && (
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
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <View key={group}>
                <TimelineHeader label={group.toUpperCase()} />
                <View style={styles.listContainer}>
                  {items.map((receipt) => (
                    <HistoryListItem
                      key={receipt.id}
                      merchantName={receipt.companyName}
                      date={formatDate(receipt.date)}
                      amount={formatAmount(receipt.totalAmount)}
                      category={receipt.category}
                      status={receipt.status}
                      iconName={getCategoryIcon(receipt.category) as any}
                      onPress={() =>
                        router.push({
                          pathname: '/receipt-detail',
                          params: { id: receipt.id }
                        })
                      }
                      onLongPress={() =>
                        Alert.alert(
                          'Delete Receipt',
                          `Delete receipt from ${receipt.companyName}?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: () => deleteReceipt(receipt.id)
                            }
                          ]
                        )
                      }
                    />
                  ))}
                </View>
              </View>
            ))
          )}

          {/* Export card */}
          {!isEmpty && (
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
          )}
        </View>
      </ScrollView>

      {/* Filters bottom sheet */}
      <Modal
        visible={filterPanelOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterPanelOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setFilterPanelOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Filter Receipts</Text>

          <Text style={styles.sheetSectionLabel}>STATUS</Text>
          <View style={styles.sheetOptions}>
            {STATUS_OPTIONS.map((opt) => {
              const active = statusFilter === opt.value
              return (
                <Pressable
                  key={opt.value}
                  style={[styles.sheetOption, active && styles.sheetOptionActive]}
                  onPress={() => setStatusFilter(opt.value)}
                >
                  <Text style={[styles.sheetOptionText, active && styles.sheetOptionTextActive]}>
                    {opt.label}
                  </Text>
                  {active && (
                    <MaterialIcons name="check" size={16} color={theme.colors['on-primary']} />
                  )}
                </Pressable>
              )
            })}
          </View>

          <View style={styles.sheetActions}>
            <AppButton
              label="Apply Filters"
              variant="primary"
              onPress={() => setFilterPanelOpen(false)}
              trailingIcon={<Text style={styles.arrow}>→</Text>}
            />
            <AppButton
              label="Clear All"
              variant="ghost"
              onPress={() => {
                setStatusFilter('all')
                setFilterPanelOpen(false)
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  scrollView: { flex: 1 },
  container: {
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[10]
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[4]
  },
  headerAppName: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
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
  listContainer: { gap: theme.spacing[3] },
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
  },
  // Bottom sheet
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 28, 27, 0.4)'
  },
  sheet: {
    backgroundColor: theme.colors['surface-container-lowest'],
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[12],
    ...theme.shadows.md
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors['outline-variant'],
    alignSelf: 'center',
    marginBottom: theme.spacing[6]
  },
  sheetTitle: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing[6]
  },
  sheetSectionLabel: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors['on-surface-variant'],
    letterSpacing: 1.5,
    marginBottom: theme.spacing[3]
  },
  sheetOptions: { gap: theme.spacing[2], marginBottom: theme.spacing[6] },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors['surface-container-low']
  },
  sheetOptionActive: {
    backgroundColor: theme.colors['primary-container']
  },
  sheetOptionText: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary
  },
  sheetOptionTextActive: {
    color: theme.colors['on-primary']
  },
  sheetActions: { gap: theme.spacing[3] },
  arrow: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors['on-primary']
  }
})

export default HistoryScreen
