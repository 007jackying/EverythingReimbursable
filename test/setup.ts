import '@testing-library/jest-native/extend-expect'
import { setUpTests } from 'react-native-reanimated'

// Official Reanimated 4 Jest setup: mock the worklets runtime, then initialize.
// jest.mock is hoisted above the imports, so the mock applies to the import too.
// eslint-disable-next-line global-require
jest.mock('react-native-worklets', () => require('react-native-worklets/lib/module/mock'))

setUpTests()

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn()
}

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock localStorage for web with real in-memory storage
const localStorageStore: Record<string, string> = {}
const localStorageMock = {
  getItem: jest.fn((key: string) => (key in localStorageStore ? localStorageStore[key] : null)),
  setItem: jest.fn((key: string, value: string) => {
    localStorageStore[key] = value
  }),
  removeItem: jest.fn((key: string) => {
    delete localStorageStore[key]
  }),
  clear: jest.fn(() => {
    Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key])
  })
}
global.localStorage = localStorageMock as any

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks()
  localStorageMock.clear()
})
