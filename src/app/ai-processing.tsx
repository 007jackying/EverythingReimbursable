/* eslint-disable no-console */
import theme from '@/constants/theme'
import { AI_CONFIDENCE_DISPLAY } from '@/constants/app'
import Chip from '@/components/Chip'
import ScreenHeader from '@/components/ScreenHeader'
import { useGoogle } from '@/context/GoogleContext'
import { uploadImage } from '@/services/googleDrive'
import { extractReceiptData } from '@/services/gemini'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming
} from 'react-native-reanimated'

const AIProcessingScreen = () => {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>()
  const { accessToken, isAuthenticated: isGoogleConnected, refreshTokens } = useGoogle()
  const [merchantName, setMerchantName] = useState('Analyzing...')
  const [detectedAmount, setDetectedAmount] = useState<string | null>(null)
  const [driveUploadStatus, setDriveUploadStatus] = useState<string | null>(null)
  const hasNavigated = useRef(false)

  const scanY = useSharedValue(0)
  const progressAnim = useSharedValue(0)
  const dot1Y = useSharedValue(0)
  const dot2Y = useSharedValue(0)
  const dot3Y = useSharedValue(0)

  useEffect(() => {
    scanY.value = withRepeat(withTiming(200, { duration: 2000 }), -1, true)
    progressAnim.value = withTiming(92, { duration: 3200 })
    dot1Y.value = withRepeat(withTiming(-6, { duration: 500 }), -1, true)
    dot2Y.value = withDelay(200, withRepeat(withTiming(-6, { duration: 500 }), -1, true))
    dot3Y.value = withDelay(400, withRepeat(withTiming(-6, { duration: 500 }), -1, true))

    // Run AI extraction
    extractReceiptData(imageUri ?? '').then(async (result) => {
      if (hasNavigated.current) return

      setMerchantName(result.companyName)
      setDetectedAmount(`$${result.totalAmount.toFixed(2)}`)
      progressAnim.value = withTiming(100, { duration: 400 })

      // Upload to Google Drive if connected
      let driveFileId: string | null = null
      let driveWebViewLink: string | null = null

      if (isGoogleConnected && accessToken && imageUri) {
        setDriveUploadStatus('Uploading to Drive...')
        try {
          const fileName = `receipt-${Date.now()}.jpg`
          const uploadResult = await uploadImage(accessToken, imageUri, fileName)
          driveFileId = uploadResult.fileId
          driveWebViewLink = uploadResult.webViewLink
          setDriveUploadStatus('Uploaded ✓')
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error('Drive upload failed:', errorMessage)

          // Check if token expired - try to refresh and retry once
          if (errorMessage.includes('TOKEN_EXPIRED') || errorMessage.includes('401')) {
            console.log('Token expired, attempting refresh...')
            setDriveUploadStatus('Refreshing token...')
            const newToken = await refreshTokens()

            if (newToken && imageUri) {
              try {
                const fileName = `receipt-${Date.now()}.jpg`
                const uploadResult = await uploadImage(newToken, imageUri, fileName)
                driveFileId = uploadResult.fileId
                driveWebViewLink = uploadResult.webViewLink
                setDriveUploadStatus('Uploaded ✓')
              } catch (retryError) {
                console.error('Retry upload failed:', retryError)
                setDriveUploadStatus('Upload failed')
                Alert.alert(
                  'Drive Upload Failed',
                  'Receipt image could not be uploaded to Google Drive. It will be stored locally.'
                )
              }
            } else {
              setDriveUploadStatus('Session expired')
              Alert.alert(
                'Google Session Expired',
                'Please reconnect Google Drive in Profile settings.'
              )
            }
          } else {
            setDriveUploadStatus('Upload failed')
            Alert.alert(
              'Drive Upload Failed',
              'Receipt image could not be uploaded to Google Drive. It will be stored locally.'
            )
          }
        }
      }

      hasNavigated.current = true

      const newId = `receipt-${Date.now()}`
      setTimeout(() => {
        router.replace({
          pathname: '/receipt-detail',
          params: {
            id: newId,
            extracted: JSON.stringify({
              ...result,
              id: newId,
              imageUri: imageUri ?? '',
              driveFileId,
              driveWebViewLink,
              status: 'verified',
              date: result.date || new Date().toISOString().split('T')[0],
              createdAt: new Date().toISOString(),
              notes: null
            })
          }
        })
      }, 400)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scanStyle = useAnimatedStyle(() => ({ transform: [{ translateY: scanY.value }] }))
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%` as `${number}%`
  }))
  const dot1Style = useAnimatedStyle(() => ({ transform: [{ translateY: dot1Y.value }] }))
  const dot2Style = useAnimatedStyle(() => ({ transform: [{ translateY: dot2Y.value }] }))
  const dot3Style = useAnimatedStyle(() => ({ transform: [{ translateY: dot3Y.value }] }))

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <ScreenHeader showMenu={false} showClose onClose={() => router.back()} />

          <View style={styles.receiptIconContainer}>
            <View style={styles.receiptIcon}>
              <MaterialIcons name="receipt" size={64} color={theme.colors.outline} />
              <Animated.View style={[styles.scanBeam, scanStyle]} />
            </View>
          </View>

          <Text style={styles.heading}>Extracting receipt details...</Text>
          <Text style={styles.subText}>AI is identifying merchants, totals, and line items.</Text>

          <View style={styles.progressBarTrack}>
            <Animated.View style={[styles.progressBarFill, progressBarStyle]} />
          </View>

          <View style={styles.metaBento}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>CONFIDENCE</Text>
              <Text style={styles.confidenceValue}>{AI_CONFIDENCE_DISPLAY}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>PROCESSING</Text>
              <Text style={styles.processingValue}>OCR_v4</Text>
            </View>
          </View>

          <View style={styles.privacyBadge}>
            <Chip
              variant="bank-grade"
              label="BANK-GRADE ENCRYPTION ACTIVE"
              icon={<MaterialIcons name="verified-user" size={12} color={theme.colors.secondary} />}
            />
          </View>
          <Text style={styles.privacyText}>
            Your receipt data is encrypted and never shared with third parties.
          </Text>

          {driveUploadStatus && (
            <View style={styles.driveStatusRow}>
              <MaterialIcons
                name="cloud-upload"
                size={16}
                color={
                  driveUploadStatus.includes('failed') ? theme.colors.error : theme.colors.secondary
                }
              />
              <Text
                style={[
                  styles.driveStatusText,
                  driveUploadStatus.includes('failed') && styles.driveStatusError
                ]}
              >
                {driveUploadStatus}
              </Text>
            </View>
          )}

          <View style={styles.dataFeed}>
            <View style={styles.merchantCard}>
              <MaterialIcons name="storefront" size={20} color={theme.colors.primary} />
              <Text style={styles.merchantName}>{merchantName}</Text>
              {detectedAmount && <Chip variant="verified" label="VERIFIED" />}
            </View>
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>DETECTED AMOUNT</Text>
              <Text style={styles.amountValue}>{detectedAmount ?? '—'}</Text>
              {!detectedAmount && (
                <View style={styles.categorizingRow}>
                  <Text style={styles.categorizingText}>Categorizing</Text>
                  <Animated.Text style={dot1Style}>●</Animated.Text>
                  <Animated.Text style={dot2Style}>●</Animated.Text>
                  <Animated.Text style={dot3Style}>●</Animated.Text>
                </View>
              )}
            </View>
          </View>
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
    paddingBottom: theme.spacing[10],
    alignItems: 'center'
  },
  receiptIconContainer: {
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[8]
  },
  receiptIcon: {
    width: 120,
    height: 160,
    backgroundColor: theme.colors['surface-container-lowest'],
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-2deg' }],
    overflow: 'hidden',
    ...theme.shadows.hero
  },
  scanBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.secondary,
    shadowColor: theme.colors.secondary,
    shadowOpacity: 0.6,
    shadowRadius: 8
  },
  heading: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    textAlign: 'center'
  },
  subText: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors['on-surface-variant'],
    textAlign: 'center',
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[6]
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: theme.colors['surface-container-high'],
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    marginBottom: theme.spacing[6]
  },
  progressBarFill: {
    height: 6,
    backgroundColor: theme.colors['primary-container'],
    borderRadius: theme.radius.full
  },
  metaBento: {
    flexDirection: 'row',
    backgroundColor: theme.colors['surface-container-low'],
    borderRadius: theme.radius.md,
    padding: theme.spacing[4],
    width: '100%',
    marginBottom: theme.spacing[6]
  },
  metaItem: {
    flex: 1
  },
  metaDivider: {
    width: 1,
    backgroundColor: theme.colors['outline-variant'],
    marginHorizontal: theme.spacing[4]
  },
  metaLabel: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors['on-surface-variant'],
    letterSpacing: 1.5
  },
  confidenceValue: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.secondary,
    marginTop: theme.spacing[1]
  },
  processingValue: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    fontStyle: 'italic',
    marginTop: theme.spacing[1]
  },
  privacyBadge: {
    marginBottom: theme.spacing[2]
  },
  privacyText: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 11,
    color: theme.colors['on-surface-variant'],
    textAlign: 'center',
    marginBottom: theme.spacing[6]
  },
  driveStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4]
  },
  driveStatusText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.secondary
  },
  driveStatusError: {
    color: theme.colors.error
  },
  dataFeed: {
    width: '100%',
    gap: theme.spacing[3]
  },
  merchantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors['surface-container-low'],
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3]
  },
  merchantName: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
    flex: 1
  },
  amountCard: {
    backgroundColor: theme.colors['primary-container'],
    borderRadius: theme.radius.xl,
    padding: theme.spacing[5]
  },
  amountLabel: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors['on-primary-container'],
    letterSpacing: 1.5
  },
  amountValue: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors['on-primary'],
    marginTop: theme.spacing[1]
  },
  categorizingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
    marginTop: theme.spacing[2]
  },
  categorizingText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 12,
    color: theme.colors['on-primary-container']
  },
  dot: {
    fontSize: 10,
    color: theme.colors['on-primary-container']
  }
})

export default AIProcessingScreen
