import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '@/constants/app'
import theme from '@/constants/theme'
import { useAuth } from '@/context/AuthContext'
import { LinearGradient } from 'expo-linear-gradient'
import { Redirect, router } from 'expo-router'
import { useState } from 'react'
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AppButton from '@/components/AppButton'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

const { width } = Dimensions.get('window')

const SLIDES = [
  {
    icon: 'camera-alt' as const,
    title: 'Scan Any Receipt',
    subtitle: 'Point your camera at any receipt. Our AI extracts every detail instantly.'
  },
  {
    icon: 'auto-awesome' as const,
    title: 'AI-Powered Extraction',
    subtitle: 'Merchant, total, date, tax — all captured automatically in seconds.'
  },
  {
    icon: 'bar-chart' as const,
    title: 'Track & Export',
    subtitle: 'Filter by category, search history, and export CSV reports anytime.'
  }
]

const SplashScreen = () => {
  const { isAuthenticated } = useAuth()
  const [slide, setSlide] = useState(0)

  if (isAuthenticated) return <Redirect href="/(main)/home" />

  const isLast = slide === SLIDES.length - 1

  const finishOnboarding = () => {
    AsyncStorage.setItem(STORAGE_KEYS.hasOnboarded, 'true').catch(() => {
      // Non-fatal — onboarding will show again next launch
    })
    router.replace('/(auth)/login')
  }

  const handleNext = () => {
    if (isLast) {
      finishOnboarding()
    } else {
      setSlide((s) => s + 1)
    }
  }

  return (
    <LinearGradient
      colors={['#F0FBF4', '#FAF9F7', '#F0FBF4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Logo + App Name */}
          <Animated.View entering={FadeIn.duration(500)} style={styles.logoRow}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="receipt-long" size={32} color={theme.colors['on-primary']} />
            </View>
            <Text style={styles.appName}>EverythingReimbursable</Text>
          </Animated.View>

          {/* Slide content */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.slideContent}>
            <View style={styles.featureIconContainer}>
              <MaterialIcons name={SLIDES[slide].icon} size={48} color={theme.colors.secondary} />
            </View>
            <Text style={styles.slideTitle}>{SLIDES[slide].title}</Text>
            <Text style={styles.slideSubtitle}>{SLIDES[slide].subtitle}</Text>
          </Animated.View>

          {/* Card preview */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.cardPreview}>
            <View style={styles.previewCard}>
              {/* AUTO-EXTRACT pill */}
              <View style={styles.autoExtractPill}>
                <View style={styles.autoExtractDot} />
                <Text style={styles.autoExtractText}>AUTO-EXTRACT</Text>
              </View>

              <View style={styles.previewTopRow}>
                <View style={styles.previewIconBox}>
                  <MaterialIcons name="storefront" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.previewMerchantBlock}>
                  <Text style={styles.previewMerchant}>Blue Bottle Coffee</Text>
                  <Text style={styles.previewDate}>Oct 24, 2024</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <MaterialIcons name="verified" size={14} color={theme.colors.secondary} />
                  <Text style={styles.verifiedText}>VERIFIED</Text>
                </View>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewAmountRow}>
                <Text style={styles.previewAmountLabel}>TOTAL</Text>
                <Text style={styles.previewAmount}>$42.50</Text>
              </View>
            </View>
          </Animated.View>

          {/* Pagination dots */}
          <View style={styles.dotsRow}>
            {SLIDES.map((s, i) => (
              <Pressable key={s.title} onPress={() => setSlide(i)}>
                <View style={[styles.dot, i === slide && styles.dotActive]} />
              </Pressable>
            ))}
          </View>

          {/* Actions */}
          <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.footer}>
            <AppButton
              label={isLast ? 'Get Started' : 'Continue'}
              variant="primary"
              onPress={handleNext}
              trailingIcon={<Text style={styles.arrow}>→</Text>}
            />
            <View style={styles.signInRow}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <Text style={styles.signInLink} onPress={finishOnboarding}>
                Sign In
              </Text>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1
  },
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[6],
    paddingBottom: theme.spacing[8],
    justifyContent: 'space-between'
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3]
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  appName: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    flexShrink: 1
  },
  slideContent: {
    alignItems: 'center',
    gap: theme.spacing[3]
  },
  featureIconContainer: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.full,
    backgroundColor: `${theme.colors.secondary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2]
  },
  slideTitle: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.primary,
    textAlign: 'center'
  },
  slideSubtitle: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors['on-surface-variant'],
    textAlign: 'center',
    maxWidth: width * 0.75
  },
  cardPreview: {
    width: '100%'
  },
  previewCard: {
    backgroundColor: theme.colors['surface-container-lowest'],
    borderRadius: theme.radius.xl,
    padding: theme.spacing[5],
    ...theme.shadows.sm
  },
  autoExtractPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: `${theme.colors.secondary}1A`,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    gap: theme.spacing[1],
    marginBottom: theme.spacing[3]
  },
  autoExtractDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.secondary
  },
  autoExtractText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.secondary,
    letterSpacing: 1
  },
  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3]
  },
  previewIconBox: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors['surface-container-low'],
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewMerchantBlock: {
    flex: 1
  },
  previewMerchant: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary
  },
  previewDate: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 12,
    color: theme.colors['on-surface-variant'],
    marginTop: 2
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${theme.colors.secondary}1A`,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 3
  },
  verifiedText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.secondary,
    letterSpacing: 0.5
  },
  previewDivider: {
    height: 1,
    backgroundColor: theme.colors['outline-variant'],
    marginVertical: theme.spacing[3],
    opacity: 0.4
  },
  previewAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline'
  },
  previewAmountLabel: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors['on-surface-variant'],
    letterSpacing: 1.5
  },
  previewAmount: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.primary
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing[2]
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors['outline-variant']
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.colors['primary-container'],
    borderRadius: 4
  },
  footer: {
    width: '100%',
    gap: theme.spacing[4]
  },
  arrow: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors['on-primary']
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  signInText: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 14,
    color: theme.colors['on-surface-variant']
  },
  signInLink: {
    fontFamily: theme.fontFamily.headline,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.secondary
  }
})

export default SplashScreen
