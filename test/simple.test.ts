// Simple test without Expo dependencies
describe('Simple utility tests', () => {
  test('basic math works', () => {
    expect(1 + 1).toBe(2)
  })

  test('string operations work', () => {
    const str = 'hello'
    expect(str.toUpperCase()).toBe('HELLO')
  })

  test('array operations work', () => {
    const arr = [1, 2, 3]
    expect(arr.length).toBe(3)
    expect(arr.includes(2)).toBe(true)
  })

  test('object operations work', () => {
    const obj = { name: 'test', value: 42 }
    expect(obj.name).toBe('test')
    expect(obj.value).toBe(42)
  })
})