import theme from '@/constants/theme'
import { formatAmount, formatDate } from '@/utils/formatters'
import { useReceipts } from '@/context/ReceiptsContext'
import type { Receipt } from '@/types/receipt'
import { router, useLocalSearchParams } from 'expo-router'
import {
  Alert,
  Image,
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
import { useState } from 'react'

const ReceiptDetailScreen = () => {
  const { id, extracted } = useLocalSearchParams<{ id: string; extracted?: string }>()
  const { receipts, addReceipt, updateReceipt, deleteReceipt } = useReceipts()

  const extractedReceipt = extracted ? (JSON.parse(extracted) as Receipt) : null
  const storedReceipt = receipts.find((r) => r.id === id)
  const baseReceipt = extractedReceipt ?? storedReceipt

  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(baseReceipt?.companyName ?? '')
  const [editedAmount, setEditedAmount] = useState(String(baseReceipt?.totalAmount ?? 0))
  const [editedNotes, setEditedNotes] = useState(baseReceipt?.notes ?? '')
  const [showImageModal, setShowImageModal] = useState(false)

  // Show error state if no receipt found
  if (!baseReceipt) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={theme.colors.outline} />
          <Text style={styles.errorTitle}>Receipt Not Found</Text>
          <Text style={styles.errorText}>This receipt may have been deleted.</Text>
          <AppButton label="Go Back" variant="primary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    )
  }

  const receipt: Receipt = {
    ...baseReceipt,
    companyName: editedName,
    totalAmount: parseFloat(editedAmount) || baseReceipt.totalAmount,
    notes: editedNotes || null
  }

  const handleSave = async () => {
    if (extractedReceipt) {
      await addReceipt(receipt)
    } else {
      await updateReceipt(receipt.id, {
        companyName: receipt.companyName,
        totalAmount: receipt.totalAmount,
        notes: receipt.notes
      })
    }
    router.replace('/(main)/home')
  }

  const handleRescan = () => {
    router.replace('/(main)/scan')
  }

  const handleViewImage = () => {
    if (receipt.imageUri) {
      setShowImageModal(true)
    }
  }

  const handleDelete = () => {
    if (extractedReceipt) return
    Alert.alert('Delete Receipt', `Delete receipt from ${receipt.companyName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteReceipt(receipt.id)
          router.replace('/(main)/history')
        }
      }
    ])
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={theme.colors.primary}
              onPress={() => router.back()}
            />
            <Text style={styles.headerAppName}>EverythingReimbursable</Text>
            <View style={styles.headerActions}>
              {!extractedReceipt && (
                <Pressable onPress={handleDelete} hitSlop={8}>
                  <MaterialIcons name="delete-outline" size={22} color={theme.colors.outline} />
                </Pressable>
              )}
              <Pressable onPress={() => setIsEditing((v) => !v)} hitSlop={8}>
                <MaterialIcons
                  name={isEditing ? 'check-circle' : 'edit'}
                  size={22}
                  color={isEditing ? theme.colors.secondary : theme.colors.primary}
                />
              </Pressable>
            </View>
          </View>

          <Text style={styles.validationLabel}>VALIDATION STAGE</Text>
          <Text style={styles.pageTitle}>Review Receipt</Text>

          {/* Main card */}
          <View style={styles.mainCard}>
            <View style={styles.verifiedBadge}>
              <Chip
                variant="ai-verified"
                label="AI VERIFIED"
                icon={<MaterialIcons name="verified" size={12} color={theme.colors.secondary} />}
              />
            </View>

            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Merchant name"
                placeholderTextColor={theme.colors.outline}
              />
            ) : (
              <Text style={styles.merchantName}>{receipt.companyName}</Text>
            )}
            {receipt.address && !isEditing && <Text style={styles.address}>{receipt.address}</Text>}

            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>GRAND TOTAL</Text>
              {isEditing ? (
                <View style={styles.amountEditRow}>
                  <Text style={styles.totalDollar}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={editedAmount}
                    onChangeText={setEditedAmount}
                    keyboardType="decimal-pad"
                    placeholderTextColor={theme.colors.outline}
                  />
                </View>
              ) : (
                <View style={styles.totalRow}>
                  <Text style={styles.totalDollar}>$</Text>
                  <Text style={styles.totalAmount}>{receipt.totalAmount.toFixed(2)}</Text>
                </View>
              )}
            </View>

            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>DATE</Text>
                <Text style={styles.metaValue}>{formatDate(receipt.date)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>PAYMENT</Text>
                <Text style={styles.metaValue}>
                  {receipt.paymentMethod}
                  {receipt.paymentLast4 ? ` ••${receipt.paymentLast4}` : ''}
                </Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>CATEGORY</Text>
                <Chip variant="category-large" label={receipt.category.toUpperCase()} />
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>TAX</Text>
                <Text style={styles.metaValue}>
                  {receipt.taxAmount ? formatAmount(receipt.taxAmount) : 'N/A'}
                </Text>
              </View>
            </View>

            {isEditing && (
              <View style={styles.notesBlock}>
                <Text style={styles.invoiceLabel}>NOTES</Text>
                <TextInput
                  style={styles.notesInput}
                  value={editedNotes}
                  onChangeText={setEditedNotes}
                  placeholder="Add a note..."
                  placeholderTextColor={theme.colors.outline}
                  multiline
                />
              </View>
            )}

            {receipt.eInvoiceId && !isEditing && (
              <View style={styles.invoiceBlock}>
                <Text style={styles.invoiceLabel}>E-INVOICE ID</Text>
                <Text style={styles.invoiceId}>{receipt.eInvoiceId}</Text>
              </View>
            )}
          </View>

          {/* Receipt image */}
          <Pressable style={styles.receiptImage} onPress={handleViewImage}>
            {receipt.imageUri ? (
              <Image
                source={{ uri: receipt.imageUri }}
                style={styles.receiptImageActual}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.receiptImagePlaceholder}>
                <MaterialIcons name="receipt" size={48} color={theme.colors.outline} />
              </View>
            )}
            <View style={styles.viewImageButton}>
              <Text style={styles.viewImageText}>
                {receipt.imageUri ? 'View Full Image' : 'No Image'}
              </Text>
            </View>
          </Pressable>

          {/* Actions */}
          <View style={styles.actions}>
            <AppButton
              label="Save Receipt"
              variant="primary"
              onPress={handleSave}
              trailingIcon={<Text style={styles.arrow}>→</Text>}
            />
            <View style={styles.secondaryActions}>
              <Pressable style={styles.ghostButton} onPress={() => setIsEditing((v) => !v)}>
                <MaterialIcons
                  name={isEditing ? 'close' : 'edit'}
                  size={16}
                  color={theme.colors.primary}
                />
                <Text style={styles.ghostButtonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
              </Pressable>
              <Pressable style={styles.ghostButton} onPress={handleRescan}>
                <MaterialIcons name="camera-alt" size={16} color={theme.colors.primary} />
                <Text style={styles.ghostButtonText}>Re-scan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Full Image Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowImageModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Receipt Image</Text>
              <Pressable onPress={() => setShowImageModal(false)} hitSlop={8}>
                <MaterialIcons name="close" size={24} color={theme.colors.primary} />
              </Pressable>
            </View>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              maximumZoomScale={3}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              {receipt.imageUri && (
                <Image
                  source={{ uri: receipt.imageUri }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}
            </ScrollView>
          </View>
        </Pressable>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3]
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  validationLabel: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors['on-surface-variant'],
    letterSpacing: 2,
    textTransform: 'uppercase'
  },
  pageTitle: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing[6]
  },
  mainCard: {
    backgroundColor: theme.colors['surface-container-lowest'],
    borderRadius: theme.radius.xl,
    padding: theme.spacing[8],
    ...theme.shadows.sm,
    marginBottom: theme.spacing[6],
    position: 'relative',
    overflow: 'hidden'
  },
  verifiedBadge: {
    position: 'absolute',
    top: theme.spacing[5],
    right: theme.spacing[5]
  },
  merchantName: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing[1]
  },
  editInput: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    backgroundColor: theme.colors['surface-container-low'],
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    marginBottom: theme.spacing[4],
    marginRight: theme.spacing[12]
  },
  address: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 14,
    color: theme.colors['on-surface-variant'],
    marginBottom: theme.spacing[6]
  },
  totalSection: { marginBottom: theme.spacing[6] },
  totalLabel: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors['on-surface-variant'],
    letterSpacing: 1.5
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  amountEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing[2]
  },
  totalDollar: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    marginRight: theme.spacing[1]
  },
  totalAmount: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 60,
    fontWeight: '700',
    color: theme.colors.primary,
    lineHeight: 64
  },
  amountInput: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 40,
    fontWeight: '700',
    color: theme.colors.primary,
    backgroundColor: theme.colors['surface-container-low'],
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    flex: 1
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  metaItem: {
    width: '50%',
    paddingVertical: theme.spacing[4]
  },
  metaDivider: {
    width: '100%',
    height: 1,
    backgroundColor: `${theme.colors['outline-variant']}26`
  },
  metaLabel: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors['on-surface-variant'],
    letterSpacing: 1.5,
    marginBottom: theme.spacing[1]
  },
  metaValue: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary
  },
  notesBlock: {
    backgroundColor: theme.colors['surface-container-low'],
    borderRadius: theme.radius.md,
    padding: theme.spacing[4],
    marginTop: theme.spacing[4]
  },
  notesInput: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 14,
    color: theme.colors.primary,
    marginTop: theme.spacing[2],
    minHeight: 60
  },
  invoiceBlock: {
    backgroundColor: theme.colors['surface-container-low'],
    borderRadius: theme.radius.md,
    padding: theme.spacing[4],
    marginTop: theme.spacing[4]
  },
  invoiceLabel: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors['on-surface-variant'],
    letterSpacing: 1.5
  },
  invoiceId: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 15,
    fontWeight: '700',
    color: `${theme.colors.primary}CC`,
    marginTop: theme.spacing[1]
  },
  receiptImage: {
    backgroundColor: theme.colors['surface-container-low'],
    borderRadius: theme.radius.xl,
    height: 192,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: theme.spacing[6]
  },
  receiptImageActual: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.6
  },
  receiptImagePlaceholder: { opacity: 0.3 },
  viewImageButton: {
    position: 'absolute',
    bottom: theme.spacing[4],
    backgroundColor: `${theme.colors['surface-container-lowest']}E6`,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.xl
  },
  viewImageText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary
  },
  actions: { gap: theme.spacing[3] },
  secondaryActions: {
    flexDirection: 'row',
    gap: theme.spacing[3]
  },
  ghostButton: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    borderWidth: 1,
    borderColor: `${theme.colors['outline-variant']}4D`,
    borderRadius: theme.radius.md
  },
  ghostButtonText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary
  },
  arrow: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors['on-primary']
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: theme.colors['surface-container-lowest'],
    borderRadius: theme.radius.xl,
    width: '90%',
    maxHeight: '90%',
    overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors['outline-variant']
  },
  modalTitle: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary
  },
  modalScroll: {
    flexGrow: 0
  },
  modalScrollContent: {
    alignItems: 'center',
    padding: theme.spacing[4]
  },
  fullImage: {
    width: 320,
    height: 480,
    borderRadius: theme.radius.lg
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[8],
    gap: theme.spacing[4]
  },
  errorTitle: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary
  },
  errorText: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    color: theme.colors['on-surface-variant'],
    textAlign: 'center',
    marginBottom: theme.spacing[4]
  }
})

export default ReceiptDetailScreen
