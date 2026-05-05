import '@testing-library/jest-native/extend-expect'

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  Reanimated.default.call = () => {}
  return Reanimated
})

// Mock react-native-worklets
jest.mock('react-native-worklets', () => ({
  Worklets: {
    defaultContext: {},
    createRunOnJS: jest.fn((fn) => fn),
    createRunOnUI: jest.fn((fn) => fn)
  },
  createSerializable: jest.fn((value) => value)
}))

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn()
}

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock localStorage for web
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock as any

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks()
  localStorageMock.getItem.mockReset()
  localStorageMock.setItem.mockReset()
  localStorageMock.removeItem.mockReset()
  localStorageMock.clear.mockReset()
})
