import theme from '@/constants/theme'
import { useAuth } from '@/context/AuthContext'
import { useGoogle } from '@/context/GoogleContext'
import { useReceipts } from '@/context/ReceiptsContext'
import { exportReceiptsCsv } from '@/utils/exportCsv'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Chip from '@/components/Chip'
import AppButton from '@/components/AppButton'
import { SafeAreaView } from 'react-native-safe-area-context'

const PREF_CURRENCY_KEY = 'pref_currency'

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' }
]

const ProfileScreen = () => {
  const { user, logout, updateName } = useAuth()
  const { receipts } = useReceipts()
  const {
    isAuthenticated: isGoogleConnected,
    signIn: googleSignIn,
    signOut: googleSignOut,
    user: googleUser
  } = useGoogle()
  const [isExporting, setIsExporting] = useState(false)

  // Edit name modal
  const [editNameOpen, setEditNameOpen] = useState(false)
  const [draftName, setDraftName] = useState(user?.name ?? '')

  // Currency picker sheet
  const [currencySheetOpen, setCurrencySheetOpen] = useState(false)
  const [currency, setCurrency] = useState('USD')

  useEffect(() => {
    AsyncStorage.getItem(PREF_CURRENCY_KEY).then((val) => {
      if (val) setCurrency(val)
    })
  }, [])

  const handleSaveName = async () => {
    const trimmed = draftName.trim()
    if (!trimmed) return
    await updateName(trimmed)
    setEditNameOpen(false)
  }

  const handleSelectCurrency = async (code: string) => {
    setCurrency(code)
    await AsyncStorage.setItem(PREF_CURRENCY_KEY, code)
    setCurrencySheetOpen(false)
  }

  const avgConfidence =
    receipts.length > 0 ? receipts.reduce((sum, r) => sum + r.confidence, 0) / receipts.length : 0
  const avgConfidenceLabel = `${(avgConfidence * 100).toFixed(1)}%`

  const handleLogout = async () => {
    await logout()
    router.replace('/(auth)/login')
  }

  const handleExportData = async () => {
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

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Push notification settings coming soon.')
  }

  const handleGoogleConnect = async () => {
    if (isGoogleConnected) {
      Alert.alert(
        'Disconnect Google Drive',
        'Are you sure you want to disconnect Google Drive? Your uploaded receipt images will remain in your Drive.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disconnect', style: 'destructive', onPress: () => googleSignOut() }
        ]
      )
    } else {
      await googleSignIn()
    }
  }

  const activeCurrency = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0]

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <MaterialIcons name="menu" size={24} color={theme.colors.primary} />
            <Text style={styles.headerAppName}>EverythingReimbursable</Text>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={20} color={theme.colors['on-primary']} />
            </View>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.avatarLarge}>
              <MaterialIcons name="person" size={48} color={theme.colors['on-primary']} />
              <View style={styles.avatarBadge}>
                <MaterialIcons name="verified" size={16} color={theme.colors.secondary} />
              </View>
            </View>

            {/* Tap name to edit */}
            <Pressable
              style={styles.nameRow}
              onPress={() => {
                setDraftName(user?.name ?? '')
                setEditNameOpen(true)
              }}
              hitSlop={8}
            >
              <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
              <MaterialIcons name="edit" size={16} color={theme.colors['on-surface-variant']} />
            </Pressable>

            <Text style={styles.email}>{user?.email ?? ''}</Text>
            <Chip
              variant="bank-grade"
              label="PREMIUM MEMBER"
              icon={<MaterialIcons name="star" size={12} color={theme.colors.secondary} />}
            />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>RECEIPTS SCANNED</Text>
              <Text style={styles.statValue}>{receipts.length}</Text>
              <Text style={styles.statSub}>+12%</Text>
            </View>
            <View style={styles.statCardDark}>
              <Text style={styles.statLabelDark}>CONFIDENCE</Text>
              <Text style={styles.statValueWhite}>{avgConfidenceLabel}</Text>
              <Text style={styles.statSubDark}>AI-Powered</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>PREFERENCES & SECURITY</Text>

          <View style={styles.settingsContainer}>
            <Pressable style={styles.settingsRow} onPress={handleNotifications}>
              <View style={styles.settingsIcon}>
                <MaterialIcons
                  name="notifications"
                  size={24}
                  color={theme.colors['primary-container']}
                />
              </View>
              <View style={styles.settingsContent}>
                <Text style={styles.settingsLabel}>Notifications</Text>
                <Text style={styles.settingsDesc}>Push & email alerts</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.outline} />
            </Pressable>

            <Pressable style={styles.settingsRow} onPress={handleGoogleConnect}>
              <View style={styles.settingsIcon}>
                <MaterialIcons name="cloud" size={24} color={theme.colors['primary-container']} />
              </View>
              <View style={styles.settingsContent}>
                <Text style={styles.settingsLabel}>Google Drive</Text>
                <Text style={styles.settingsDesc}>
                  {isGoogleConnected
                    ? (googleUser?.email ?? 'Connected')
                    : 'Connect to backup receipt images'}
                </Text>
              </View>
              {isGoogleConnected ? (
                <View style={styles.connectedBadge}>
                  <MaterialIcons name="check-circle" size={16} color={theme.colors.secondary} />
                </View>
              ) : (
                <MaterialIcons name="chevron-right" size={24} color={theme.colors.outline} />
              )}
            </Pressable>

            <Pressable style={styles.settingsRow} onPress={() => setCurrencySheetOpen(true)}>
              <View style={styles.settingsIcon}>
                <MaterialIcons
                  name="attach-money"
                  size={24}
                  color={theme.colors['primary-container']}
                />
              </View>
              <View style={styles.settingsContent}>
                <Text style={styles.settingsLabel}>Currency</Text>
                <Text style={styles.settingsDesc}>
                  {activeCurrency.code} — {activeCurrency.label}
                </Text>
              </View>
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyBadgeText}>{activeCurrency.symbol}</Text>
              </View>
            </Pressable>

            <Pressable style={styles.settingsRow} onPress={handleExportData} disabled={isExporting}>
              <View style={styles.settingsIcon}>
                <MaterialIcons
                  name="download"
                  size={24}
                  color={theme.colors['primary-container']}
                />
              </View>
              <View style={styles.settingsContent}>
                <Text style={styles.settingsLabel}>
                  {isExporting ? 'Exporting...' : 'Export Data'}
                </Text>
                <Text style={styles.settingsDesc}>CSV report of all receipts</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.outline} />
            </Pressable>
          </View>

          <View style={styles.logoutRow} onTouchEnd={handleLogout}>
            <MaterialIcons name="logout" size={24} color={theme.colors['on-surface-variant']} />
            <Text style={styles.logoutText}>Logout Account</Text>
          </View>

          <View style={styles.helpRow}>
            <View>
              <Text style={styles.helpText}>Need Help? Our support team is here 24/7</Text>
            </View>
            <View style={styles.helpButton}>
              <Text style={styles.helpButtonText}>Contact</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={editNameOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setEditNameOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setEditNameOpen(false)} />
        <View style={styles.editNameSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Edit Display Name</Text>
          <Text style={styles.sheetSectionLabel}>NAME</Text>
          <TextInput
            style={styles.nameInput}
            value={draftName}
            onChangeText={setDraftName}
            placeholder="Your name"
            placeholderTextColor={theme.colors.outline}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSaveName}
          />
          <View style={styles.sheetActions}>
            <AppButton
              label="Save Name"
              variant="primary"
              onPress={handleSaveName}
              trailingIcon={<Text style={styles.arrow}>→</Text>}
            />
            <AppButton label="Cancel" variant="ghost" onPress={() => setEditNameOpen(false)} />
          </View>
        </View>
      </Modal>

      {/* Currency Picker Sheet */}
      <Modal
        visible={currencySheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCurrencySheetOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setCurrencySheetOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Select Currency</Text>
          <Text style={styles.sheetSectionLabel}>CURRENCY</Text>
          <View style={styles.sheetOptions}>
            {CURRENCIES.map((c) => {
              const active = currency === c.code
              return (
                <Pressable
                  key={c.code}
                  style={[styles.sheetOption, active && styles.sheetOptionActive]}
                  onPress={() => handleSelectCurrency(c.code)}
                >
                  <View style={styles.currencyOptionLeft}>
                    <Text
                      style={[styles.currencySymbolLarge, active && styles.currencySymbolActive]}
                    >
                      {c.symbol}
                    </Text>
                    <View>
                      <Text
                        style={[styles.sheetOptionText, active && styles.sheetOptionTextActive]}
                      >
                        {c.code}
                      </Text>
                      <Text
                        style={[
                          styles.currencyOptionLabel,
                          active && styles.currencyOptionLabelActive
                        ]}
                      >
                        {c.label}
                      </Text>
                    </View>
                  </View>
                  {active && (
                    <MaterialIcons name="check" size={18} color={theme.colors['on-primary']} />
                  )}
                </Pressable>
              )
            })}
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
  scrollView: {
    flex: 1
  },
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
  profileSection: {
    alignItems: 'center',
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[8]
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors['primary-container'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[4]
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.full,
    padding: 2
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2]
  },
  name: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary
  },
  email: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 14,
    color: theme.colors['on-surface-variant'],
    marginTop: theme.spacing[1],
    marginBottom: theme.spacing[3]
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[8]
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors['surface-container-low'],
    borderRadius: theme.radius.xl,
    padding: theme.spacing[5]
  },
  statCardDark: {
    flex: 1,
    backgroundColor: theme.colors['primary-container'],
    borderRadius: theme.radius.xl,
    padding: theme.spacing[5]
  },
  statLabel: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors['on-surface-variant'],
    letterSpacing: 1.5
  },
  statLabelDark: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors['on-primary-container'],
    letterSpacing: 1.5
  },
  statValue: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 30,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: theme.spacing[1]
  },
  statValueWhite: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 30,
    fontWeight: '700',
    color: theme.colors['on-primary'],
    marginTop: theme.spacing[1]
  },
  statSub: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.secondary,
    marginTop: theme.spacing[1]
  },
  statSubDark: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors['on-primary-container'],
    marginTop: theme.spacing[1]
  },
  sectionLabel: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors['on-surface-variant'],
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: theme.spacing[4]
  },
  settingsContainer: {
    backgroundColor: theme.colors['surface-container-lowest'],
    borderRadius: theme.radius.xl,
    ...theme.shadows.sm,
    marginBottom: theme.spacing[4]
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
    gap: theme.spacing[3]
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors['surface-container-low'],
    alignItems: 'center',
    justifyContent: 'center'
  },
  settingsContent: {
    flex: 1
  },
  settingsLabel: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary
  },
  settingsDesc: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 14,
    color: theme.colors['on-surface-variant']
  },
  currencyBadge: {
    backgroundColor: theme.colors['primary-container'],
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    minWidth: 36,
    alignItems: 'center'
  },
  currencyBadgeText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors['on-primary']
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors['surface-container-low'],
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6]
  },
  logoutText: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors['on-surface-variant']
  },
  helpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  helpText: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 13,
    color: theme.colors['on-surface-variant'],
    flex: 1
  },
  helpButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.md
  },
  helpButtonText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors['on-primary']
  },
  // Shared sheet styles
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
  editNameSheet: {
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
  nameInput: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    backgroundColor: theme.colors['surface-container-low'],
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    marginBottom: theme.spacing[6]
  },
  sheetActions: {
    gap: theme.spacing[3]
  },
  sheetOptions: {
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4]
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors['surface-container-low']
  },
  sheetOptionActive: {
    backgroundColor: theme.colors['primary-container']
  },
  currencyOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3]
  },
  currencySymbolLarge: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    width: 28,
    textAlign: 'center'
  },
  currencySymbolActive: {
    color: theme.colors['on-primary']
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
  currencyOptionLabel: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 13,
    color: theme.colors['on-surface-variant']
  },
  currencyOptionLabelActive: {
    color: theme.colors['on-primary-container']
  },
  arrow: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors['on-primary']
  }
})

export default ProfileScreen
