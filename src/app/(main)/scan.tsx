import theme from '@/constants/theme'
import { CameraView, FlashMode, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

type ScanMode = 'single' | 'multi' | 'import'

const MODE_LABELS: Record<ScanMode, string> = {
  single: 'SINGLE',
  multi: 'MULTI-PAGE',
  import: 'IMPORT'
}

const ScanScreen = () => {
  const [permission, requestPermission] = useCameraPermissions()
  const [activeMode, setActiveMode] = useState<ScanMode>('single')
  const [flash, setFlash] = useState<FlashMode>('off')
  const [isCapturing, setIsCapturing] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return
    setIsCapturing(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 })
      router.push({ pathname: '/ai-processing', params: { imageUri: photo?.uri ?? '' } })
    } finally {
      setIsCapturing(false)
    }
  }

  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85
    })
    if (!result.canceled && result.assets[0]) {
      router.push({ pathname: '/ai-processing', params: { imageUri: result.assets[0].uri } })
    }
  }

  const toggleFlash = () => setFlash((f) => (f === 'off' ? 'on' : 'off'))

  if (!permission) return <View style={styles.container} />

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer} edges={['top']}>
        <View style={styles.permissionIconBg}>
          <MaterialIcons name="camera-alt" size={48} color={theme.colors['on-primary']} />
        </View>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          EverythingReimbursable needs camera access to scan your receipts.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" flash={flash} />

      {/* Top bar */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <Pressable onPress={() => router.back()} style={styles.topButton} hitSlop={8}>
          <MaterialIcons name="close" size={28} color="#fff" />
        </Pressable>
        <Pressable onPress={toggleFlash} style={styles.topButton} hitSlop={8}>
          <MaterialIcons
            name={flash === 'on' ? 'flash-on' : 'flash-off'}
            size={24}
            color={flash === 'on' ? theme.colors['secondary-container'] : '#fff'}
          />
        </Pressable>
      </SafeAreaView>

      {/* Alignment guide */}
      <View style={styles.alignmentGuide} pointerEvents="none">
        <View style={styles.alignmentPill}>
          <Text style={styles.alignmentText}>ALIGN RECEIPT EDGES</Text>
        </View>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <View style={styles.modeTabs}>
          {(['single', 'multi', 'import'] as const).map((mode) => (
            <Pressable key={mode} onPress={() => setActiveMode(mode)} hitSlop={8}>
              <Text style={[styles.modeText, activeMode === mode && styles.modeTextActive]}>
                {MODE_LABELS[mode]}
              </Text>
              {activeMode === mode && <View style={styles.modeUnderline} />}
            </Pressable>
          ))}
        </View>

        <View style={styles.controlsRow}>
          <Pressable style={styles.controlButton} onPress={handleGallery} hitSlop={8}>
            <MaterialIcons name="photo-library" size={28} color="#fff" />
          </Pressable>

          <Pressable
            style={[styles.captureButton, isCapturing && styles.captureButtonActive]}
            onPress={handleCapture}
            disabled={isCapturing}
          >
            <View style={[styles.captureInner, isCapturing && styles.captureInnerActive]} />
          </Pressable>

          <Pressable style={styles.controlButton} hitSlop={8}>
            <MaterialIcons name="auto-fix-high" size={28} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  camera: {
    flex: 1
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: theme.colors['primary-container'],
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[8]
  },
  permissionIconBg: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[6]
  },
  permissionTitle: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors['on-primary'],
    textAlign: 'center',
    marginBottom: theme.spacing[3]
  },
  permissionText: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    color: theme.colors['on-primary-container'],
    textAlign: 'center',
    marginBottom: theme.spacing[8]
  },
  permissionButton: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing[8],
    paddingVertical: theme.spacing[4],
    borderRadius: theme.radius.full
  },
  permissionButtonText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors['on-secondary'],
    letterSpacing: 1
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[4]
  },
  topButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: theme.radius.full
  },
  alignmentGuide: {
    position: 'absolute',
    top: '42%',
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  alignmentPill: {
    backgroundColor: theme.colors['primary-container'],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.full
  },
  alignmentText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors['on-primary'],
    letterSpacing: 1.5
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 48,
    paddingTop: theme.spacing[6],
    backgroundColor: 'rgba(0,0,0,0.45)'
  },
  modeTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing[6],
    marginBottom: theme.spacing[6]
  },
  modeText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1
  },
  modeTextActive: {
    color: theme.colors.secondary
  },
  modeUnderline: {
    height: 2,
    backgroundColor: theme.colors.secondary,
    marginTop: 4,
    borderRadius: 1
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing[10]
  },
  controlButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center'
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  captureButtonActive: {
    borderColor: theme.colors.secondary
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff'
  },
  captureInnerActive: {
    backgroundColor: theme.colors.secondary
  }
})

export default ScanScreen
