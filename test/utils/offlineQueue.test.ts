import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Receipt } from '@/types/receipt'
import {
  addToOfflineQueue,
  getOfflineQueue,
  removeFromOfflineQueue,
  clearOfflineQueue
} from '@/utils/offlineQueue'

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line global-require
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn()
}))

const makeReceipt = (id: string): Receipt => ({
  id,
  eInvoiceId: null,
  companyName: 'Test Merchant',
  address: null,
  date: '2026-06-12',
  totalAmount: 10,
  taxAmount: null,
  currency: 'USD',
  paymentMethod: null,
  paymentLast4: null,
  category: 'other',
  imageUri: 'file:///tmp/receipt.jpg',
  confidence: 0.9,
  status: 'verified',
  createdAt: '2026-06-12T00:00:00.000Z',
  notes: null
})

describe('offlineQueue', () => {
  beforeEach(async () => {
    await AsyncStorage.clear()
  })

  it('queues an upsert by default', async () => {
    await addToOfflineQueue(makeReceipt('r1'))

    const queue = await getOfflineQueue()
    expect(queue).toHaveLength(1)
    expect(queue[0].type).toBe('upsert')
    expect(queue[0].receipt.id).toBe('r1')
  })

  it('queues a delete tombstone', async () => {
    await addToOfflineQueue(makeReceipt('r1'), 'delete')

    const queue = await getOfflineQueue()
    expect(queue).toHaveLength(1)
    expect(queue[0].type).toBe('delete')
  })

  it('replaces a pending upsert when a delete is queued for the same receipt', async () => {
    await addToOfflineQueue(makeReceipt('r1'))
    await addToOfflineQueue(makeReceipt('r1'), 'delete')

    const queue = await getOfflineQueue()
    expect(queue).toHaveLength(1)
    expect(queue[0].type).toBe('delete')
  })

  it('keeps operations for different receipts', async () => {
    await addToOfflineQueue(makeReceipt('r1'))
    await addToOfflineQueue(makeReceipt('r2'), 'delete')

    const queue = await getOfflineQueue()
    expect(queue).toHaveLength(2)
  })

  it('removes a queued operation by receipt id', async () => {
    await addToOfflineQueue(makeReceipt('r1'))
    await addToOfflineQueue(makeReceipt('r2'))

    await removeFromOfflineQueue('r1')

    const queue = await getOfflineQueue()
    expect(queue).toHaveLength(1)
    expect(queue[0].receipt.id).toBe('r2')
  })

  it('clears the queue', async () => {
    await addToOfflineQueue(makeReceipt('r1'))
    await clearOfflineQueue()

    expect(await getOfflineQueue()).toHaveLength(0)
  })

  it('treats legacy items without a type as upserts', async () => {
    const legacyItem = {
      receipt: makeReceipt('legacy'),
      queuedAt: '2026-01-01T00:00:00.000Z',
      retryCount: 0
    }
    await AsyncStorage.setItem('offline_sync_queue', JSON.stringify([legacyItem]))

    const queue = await getOfflineQueue()
    expect(queue).toHaveLength(1)
    expect(queue[0].type).toBe('upsert')
  })
})
