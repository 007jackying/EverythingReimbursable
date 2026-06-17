import AsyncStorage from '@react-native-async-storage/async-storage'
import * as NetInfo from '@react-native-community/netinfo'
import type { Receipt } from '@/types/receipt'

const OFFLINE_QUEUE_KEY = 'offline_sync_queue'

export type QueuedOperationType = 'upsert' | 'delete'

export interface QueuedOperation {
  type: QueuedOperationType
  receipt: Receipt
  queuedAt: string
  retryCount: number
}

// Items persisted before delete support existed have no `type` field
const normalize = (item: QueuedOperation): QueuedOperation => ({
  ...item,
  type: item.type ?? 'upsert'
})

const readQueue = async (): Promise<QueuedOperation[]> => {
  const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY)
  const queue: QueuedOperation[] = stored ? JSON.parse(stored) : []
  return queue.map(normalize)
}

export const addToOfflineQueue = async (
  receipt: Receipt,
  type: QueuedOperationType = 'upsert'
): Promise<void> => {
  try {
    const queue = await readQueue()

    const existingIndex = queue.findIndex((q) => q.receipt.id === receipt.id)
    const queueItem: QueuedOperation = {
      type,
      receipt,
      queuedAt: new Date().toISOString(),
      retryCount: existingIndex >= 0 ? queue[existingIndex].retryCount : 0
    }

    if (existingIndex >= 0) {
      // A delete supersedes any pending upsert for the same receipt
      queue[existingIndex] = queueItem
    } else {
      queue.push(queueItem)
    }

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
  } catch (err) {
    console.error('Failed to add to offline queue:', err)
  }
}

export const getOfflineQueue = async (): Promise<QueuedOperation[]> => {
  try {
    return await readQueue()
  } catch {
    return []
  }
}

export const removeFromOfflineQueue = async (receiptId: string): Promise<void> => {
  try {
    const queue = await readQueue()
    const filtered = queue.filter((q) => q.receipt.id !== receiptId)
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered))
  } catch (err) {
    console.error('Failed to remove from offline queue:', err)
  }
}

export const clearOfflineQueue = async (): Promise<void> => {
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY)
}

// isInternetReachable is null while undetermined (and always on web) — treat as reachable
const stateIsOnline = (state: NetInfo.NetInfoState): boolean =>
  state.isConnected === true && state.isInternetReachable !== false

export const isOnline = async (): Promise<boolean> => {
  const state = await NetInfo.fetch()
  return stateIsOnline(state)
}

export const subscribeToNetworkChanges = (callback: (isConnected: boolean) => void): (() => void) =>
  NetInfo.addEventListener((state) => {
    callback(stateIsOnline(state))
  })
