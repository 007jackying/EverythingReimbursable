import theme from '@/constants/theme'
import type { ReceiptStatus } from '@/types/receipt'
import AppButton from '@/components/AppButton'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

interface FilterSheetProps {
  visible: boolean
  selectedStatus: ReceiptStatus | 'all'
  onSelectStatus: (status: ReceiptStatus | 'all') => void
  onClose: () => void
}

const STATUS_OPTIONS: { label: string; value: ReceiptStatus | 'all' }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Verified', value: 'verified' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' }
]

const FilterSheet = ({ visible, selectedStatus, onSelectStatus, onClose }: FilterSheetProps) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose} />
    <View style={styles.sheet}>
      <View style={styles.sheetHandle} />
      <Text style={styles.sheetTitle}>Filter Receipts</Text>

      <Text style={styles.sheetSectionLabel}>STATUS</Text>
      <View style={styles.sheetOptions}>
        {STATUS_OPTIONS.map((opt) => {
          const active = selectedStatus === opt.value
          return (
            <Pressable
              key={opt.value}
              style={[styles.sheetOption, active && styles.sheetOptionActive]}
              onPress={() => onSelectStatus(opt.value)}
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
          onPress={onClose}
          trailingIcon={
            <MaterialIcons name="arrow-forward" size={18} color={theme.colors['on-primary']} />
          }
        />
        <AppButton
          label="Clear All"
          variant="ghost"
          onPress={() => {
            onSelectStatus('all')
            onClose()
          }}
        />
      </View>
    </View>
  </Modal>
)

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.scrim
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
  sheetActions: { gap: theme.spacing[3] }
})

export default FilterSheet
