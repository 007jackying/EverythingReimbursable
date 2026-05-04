const colors = {
  primary: '#070235',
  'primary-container': '#1E1B4B',
  'on-primary': '#FFFFFF',
  'on-primary-container': '#8683BA',
  'primary-fixed': '#E3DFFF',
  'primary-fixed-dim': '#C4C1FB',

  secondary: '#006C49',
  'secondary-container': '#6CF8BB',
  'on-secondary': '#FFFFFF',
  'on-secondary-container': '#00714D',
  'secondary-fixed': '#6FFBBE',
  'secondary-fixed-dim': '#4EDEA3',

  background: '#FAF9F7',
  surface: '#FAF9F7',
  'surface-bright': '#FAF9F7',
  'surface-dim': '#DBDAD8',
  'surface-container-lowest': '#FFFFFF',
  'surface-container-low': '#F4F3F1',
  'surface-container': '#EFEEEC',
  'surface-container-high': '#E9E8E6',
  'surface-container-highest': '#E3E2E0',
  'on-surface': '#1A1C1B',
  'on-surface-variant': '#47464F',
  outline: '#787680',
  'outline-variant': '#C8C5D0',

  error: '#BA1A1A',
  'error-container': '#FFDAD6',
  'on-error': '#FFFFFF',

  'inverse-surface': '#2F3130',
  'inverse-on-surface': '#F1F1EF'
} as const

export type ColorToken = keyof typeof colors

const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64
} as const

export type SpacingToken = keyof typeof spacing

const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 24,
  hero: 32,
  full: 9999
} as const

export type RadiusToken = keyof typeof radius

const shadows = {
  none: {},
  sm: {
    shadowColor: '#1A1C1B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 32,
    elevation: 1
  },
  md: {
    shadowColor: '#1A1C1B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4
  },
  lg: {
    shadowColor: '#1A1C1B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8
  },
  hero: {
    shadowColor: '#070235',
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 8
  }
} as const

export type ShadowToken = keyof typeof shadows

const fontFamily = {
  headline: 'PlusJakartaSans',
  mono: 'SpaceGrotesk'
} as const

const typography = {
  display: {
    fontFamily: fontFamily.headline,
    fontSize: 36,
    fontWeight: '800' as const,
    lineHeight: 44
  },
  h1: {
    fontFamily: fontFamily.headline,
    fontSize: 30,
    fontWeight: '700' as const,
    lineHeight: 38
  },
  h2: {
    fontFamily: fontFamily.headline,
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32
  },
  h3: {
    fontFamily: fontFamily.headline,
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 28
  },
  body: {
    fontFamily: fontFamily.headline,
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22
  },
  bodyMd: {
    fontFamily: fontFamily.headline,
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22
  },
  caption: {
    fontFamily: fontFamily.headline,
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18
  },
  label: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    fontWeight: '700' as const,
    lineHeight: 14,
    letterSpacing: 1.8
  },
  mono: {
    fontFamily: fontFamily.mono,
    fontSize: 15,
    fontWeight: '700' as const,
    lineHeight: 20
  },
  monoLg: {
    fontFamily: fontFamily.mono,
    fontSize: 60,
    fontWeight: '700' as const,
    lineHeight: 68
  },
  monoXl: {
    fontFamily: fontFamily.mono,
    fontSize: 36,
    fontWeight: '800' as const,
    lineHeight: 44
  }
} as const

export type TypographyToken = keyof typeof typography

const theme = {
  colors,
  spacing,
  radius,
  shadows,
  fontFamily,
  typography
} as const

export default theme
