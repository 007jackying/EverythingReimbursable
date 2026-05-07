import '@testing-library/jest-native/extend-expect'

// Mock React Native components for web
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native-web')

  return {
    ...RN,
    Platform: {
      OS: 'web',
      select: jest.fn((obj) => obj.web)
    },
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style)
    }
  }
})

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  MaterialCommunityIcons: 'MaterialCommunityIcons'
}))

jest.mock('react-native-reanimated', () => ({
  default: {
    call: () => {}
  },
  useSharedValue: jest.fn((value) => ({ value })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn((value) => value),
  withRepeat: jest.fn((value) => value),
  withDelay: jest.fn((_, value) => value),
  createAnimatedComponent: jest.fn((component) => component)
}))

jest.mock('expo-linear-gradient', () => 'LinearGradient')

jest.mock('expo-constants', () => ({
  default: {
    manifest: {}
  }
}))

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn()
}

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})
