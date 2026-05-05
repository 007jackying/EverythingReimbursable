// Minimal setup without Expo dependencies

// Mock localStorage for web tests with actual storage
const localStorageStore: Record<string, string> = {}
const localStorageMock = {
  getItem: jest.fn((key: string) => localStorageStore[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    localStorageStore[key] = value
  }),
  removeItem: jest.fn((key: string) => {
    delete localStorageStore[key]
  }),
  clear: jest.fn(() => {
    Object.keys(localStorageStore).forEach(key => delete localStorageStore[key])
  }),
  length: 0,
  key: jest.fn()
}
global.localStorage = localStorageMock as any

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn()
}

// Mock fetch for API calls
global.fetch = jest.fn()

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks()
  Object.keys(localStorageStore).forEach(key => delete localStorageStore[key])
})
