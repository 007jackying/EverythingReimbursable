# Test Suite Documentation

## Overview

This test suite uses **Jest** and **React Native Testing Library** to provide comprehensive unit testing for the EverythingReimbursable app.

---

## Test Structure

```
test/
├── setup.ts                    # Global test setup and mocks
├── test-utils.tsx              # Custom render functions and helpers
├── utils/                      # Utility function tests
│   ├── categories.test.ts
│   ├── exportCsv.test.ts
│   └── secureStorage.test.ts
└── components/                 # Component tests
    ├── AppButton.test.tsx
    ├── AppInput.test.tsx
    └── Chip.test.tsx
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test test/utils/categories.test.ts
```

---

## Test Coverage

### Utility Functions (Priority 1) ✅

1. **`categories.test.ts`** - 10 test cases
   - `getCategoryIcon()` for all 8 categories
   - `categoryIconMap` validation

2. **`exportCsv.test.ts`** - 8 test cases
   - CSV generation with empty/single/multiple receipts
   - Null field handling
   - Special character escaping
   - Error handling
   - Filename generation

3. **`secureStorage.test.ts`** - 12 test cases
   - Web platform (localStorage)
   - Native platform (SecureStore)
   - Error handling for both platforms

### Components (Priority 2) ✅

1. **`AppButton.test.tsx`** - 15 test cases
   - All 5 variants
   - Icon rendering
   - Press interaction
   - Disabled state
   - Styling

2. **`AppInput.test.tsx`** - 12 test cases
   - Label rendering
   - Text input
   - Password visibility toggle
   - Error state
   - Focus/blur events

3. **`Chip.test.tsx`** - 12 test cases
   - All 6 variants
   - Icon rendering
   - Dot indicator
   - Styling

---

## Test Utilities

### `createMockReceipt(overrides)`

Creates a mock receipt object for testing.

```typescript
const receipt = createMockReceipt({
  companyName: 'Custom Merchant',
  totalAmount: 50.00
})
```

### `createMockUser(overrides)`

Creates a mock user object for testing.

```typescript
const user = createMockUser({
  name: 'John Doe',
  email: 'john@example.com'
})
```

### `waitFor()`

Waits for async updates to complete.

```typescript
await waitFor()
```

---

## Mocking Strategy

### Expo Modules

All Expo modules are mocked in `setup.ts`:

- `expo-secure-store`
- `expo-file-system`
- `expo-sharing`
- `expo-camera`
- `expo-image-picker`
- `expo-router`
- `@expo/vector-icons`

### React Native Reanimated

Mocked using the built-in mock from `react-native-reanimated/mock`.

### Platform-Specific Code

Tests handle both web and native platforms:

```typescript
;(Platform as any).OS = 'web' // or 'ios', 'android'
```

---

## Writing New Tests

### Test File Template

```typescript
import { render } from '../test-utils'
import Component from '@/components/Component'

describe('Component Name', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      const { getByText } = render(<Component />)
      expect(getByText('Text')).toBeTruthy()
    })
  })

  describe('interaction', () => {
    it('handles press', () => {
      const onPress = jest.fn()
      const { getByText } = render(<Component onPress={onPress} />)
      fireEvent.press(getByText('Button'))
      expect(onPress).toHaveBeenCalled()
    })
  })
})
```

### Best Practices

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Group related tests with `describe`**
4. **Use `beforeEach` for common setup**
5. **Clean up mocks in `afterEach`**
6. **Test edge cases and error states**

---

## Coverage Goals

| Category | Current | Target |
|----------|---------|--------|
| Utilities | 100% | 90% |
| Components | 80% | 70% |
| Contexts | 0% | 80% |
| Services | 0% | 60% |
| **Overall** | **40%** | **50%** |

---

## Troubleshooting

### "Cannot find module"

Make sure the module is mocked in `setup.ts` or added to `transformIgnorePatterns`.

### "Invalid regular expression"

Check `jest.config.js` for regex syntax errors.

### "You are trying to `import` a file outside of the scope"

Add the module to `transformIgnorePatterns` in `jest.config.js`.

### Tests timeout

Increase `testTimeout` in `jest.config.js` or use `jest.setTimeout()` in individual tests.

---

## Next Steps

1. ✅ Utility function tests (complete)
2. ✅ Basic component tests (complete)
3. ⏳ Context provider tests (pending)
4. ⏳ Service tests (pending)
5. ⏳ Integration tests (pending)

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)