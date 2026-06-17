import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Receipt } from '@/types/receipt'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { STORAGE_KEYS } from '@/constants/app'
import { uploadReceiptImage, deleteReceiptImage } from '@/services/cloudStorage'
import {
  upsertCloudReceipt,
  deleteCloudReceipt,
  fetchCloudReceipts
} from '@/services/cloudReceipts'
import { isSupabaseConfigured } from '@/config/supabase'
import {
  addToOfflineQueue,
  getOfflineQueue,
  removeFromOfflineQueue,
  isOnline,
  subscribeToNetworkChanges
} from '@/utils/offlineQueue'
import { useAuth } from './AuthContext'

const STORAGE_KEY = STORAGE_KEYS.receipts

interface ReceiptsContextValue {
  receipts: Receipt[]
  isLoading: boolean
  addReceipt: (receipt: Receipt) => Promise<void>
  updateReceipt: (id: string, updates: Partial<Receipt>) => Promise<void>
  deleteReceipt: (id: string) => Promise<void>
  syncReceiptToCloud: (receipt: Receipt) => Promise<Receipt>
  syncWithCloud: () => Promise<void>
}

const ReceiptsContext = createContext<ReceiptsContextValue | null>(null)

const save = async (receipts: Receipt[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(receipts))
}

export const ReceiptsProvider = ({ children }: { children: React.ReactNode }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  // Mirror of receipts for callbacks — keeps their identity stable across updates
  const receiptsRef = useRef<Receipt[]>([])
  const isFlushingRef = useRef(false)

  useEffect(() => {
    receiptsRef.current = receipts
  }, [receipts])

  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as Receipt[]
          // Strip legacy seeded mock receipts (IDs were plain integers: '1'–'8')
          setReceipts(parsed.filter((r) => !/^\d+$/.test(r.id)))
        }
      } catch {
        setReceipts([])
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  // Single persistence point — every state change after rehydration is written
  useEffect(() => {
    if (isLoading) return
    save(receipts)
  }, [receipts, isLoading])

  // Uploads the receipt image (if still local) and upserts the receipt row.
  // Throws when sync fails so callers can queue the receipt for retry.
  const syncReceiptToCloud = useCallback(
    async (receipt: Receipt): Promise<Receipt> => {
      if (!user || !isSupabaseConfigured()) return receipt

      let synced = receipt
      const isLocalImage =
        receipt.imageUri.startsWith('file://') || !receipt.imageUri.startsWith('http')

      if (isLocalImage && !receipt.cloudPath) {
        const result = await uploadReceiptImage(receipt.imageUri, user.id, receipt.id)
        if (result.error) {
          throw new Error(result.error)
        }
        synced = { ...receipt, imageUri: result.url, cloudPath: result.path }
      }

      synced = { ...synced, syncedAt: new Date().toISOString() }
      const { error } = await upsertCloudReceipt(synced, user.id)
      if (error) {
        throw new Error(error)
      }

      return synced
    },
    [user]
  )

  const trySyncOrQueue = useCallback(
    async (receipt: Receipt): Promise<Receipt> => {
      if (!user || !isSupabaseConfigured()) return receipt
      try {
        if (await isOnline()) {
          return await syncReceiptToCloud(receipt)
        }
      } catch (err) {
        console.warn('Cloud sync failed, queueing receipt:', err)
      }
      await addToOfflineQueue(receipt)
      return receipt
    },
    [user, syncReceiptToCloud]
  )

  const addReceipt = useCallback(
    async (receipt: Receipt) => {
      const stamped: Receipt = { ...receipt, updatedAt: receipt.updatedAt ?? receipt.createdAt }
      const synced = await trySyncOrQueue(stamped)
      setReceipts((prev) => [synced, ...prev])
    },
    [trySyncOrQueue]
  )

  const updateReceipt = useCallback(
    async (id: string, updates: Partial<Receipt>) => {
      const existing = receiptsRef.current.find((r) => r.id === id)
      if (!existing) return

      const updated: Receipt = { ...existing, ...updates, updatedAt: new Date().toISOString() }
      setReceipts((prev) => prev.map((r) => (r.id === id ? updated : r)))
      await trySyncOrQueue(updated)
    },
    [trySyncOrQueue]
  )

  const deleteReceipt = useCallback(
    async (id: string) => {
      const receipt = receiptsRef.current.find((r) => r.id === id)
      setReceipts((prev) => prev.filter((r) => r.id !== id))
      // Drop any pending upsert for this receipt; a tombstone replaces it if needed
      await removeFromOfflineQueue(id)
      if (!receipt || !user) return

      // Nothing to clean up in the cloud if the receipt never synced
      if (!receipt.cloudPath && !receipt.syncedAt) return

      try {
        if (!(await isOnline())) {
          throw new Error('Device is offline')
        }
        if (receipt.cloudPath) {
          const { success, error: imageError } = await deleteReceiptImage(receipt.cloudPath)
          if (!success) {
            throw new Error(imageError ?? 'Image delete failed')
          }
        }
        const { error } = await deleteCloudReceipt(id, user.id)
        if (error) {
          throw new Error(error)
        }
      } catch (err) {
        console.warn('Cloud delete failed, queueing tombstone:', err)
        await addToOfflineQueue(receipt, 'delete')
      }
    },
    [user]
  )

  // Retries queued operations — runs on login and whenever the network comes back.
  // Guarded so a reconnect event and the login sync can't replay the queue twice.
  const flushOfflineQueue = useCallback(async () => {
    if (isFlushingRef.current) return
    if (!user || !isSupabaseConfigured()) return
    isFlushingRef.current = true
    try {
      const queue = await getOfflineQueue()
      if (queue.length === 0) return

      // eslint-disable-next-line no-restricted-syntax
      for (const item of queue) {
        try {
          if (item.type === 'delete') {
            if (item.receipt.cloudPath) {
              // eslint-disable-next-line no-await-in-loop
              const { success, error } = await deleteReceiptImage(item.receipt.cloudPath)
              if (!success) {
                throw new Error(error ?? 'Image delete failed')
              }
            }
            // eslint-disable-next-line no-await-in-loop
            const { error } = await deleteCloudReceipt(item.receipt.id, user.id)
            if (error) {
              throw new Error(error)
            }
          } else {
            // eslint-disable-next-line no-await-in-loop
            const synced = await syncReceiptToCloud(item.receipt)
            setReceipts((prev) =>
              prev.map((r) =>
                r.id === synced.id
                  ? {
                      ...r,
                      imageUri: synced.imageUri,
                      cloudPath: synced.cloudPath,
                      syncedAt: synced.syncedAt
                    }
                  : r
              )
            )
          }
          // eslint-disable-next-line no-await-in-loop
          await removeFromOfflineQueue(item.receipt.id)
        } catch (err) {
          console.warn('Offline queue sync failed, will retry later:', err)
        }
      }
    } finally {
      isFlushingRef.current = false
    }
  }, [user, syncReceiptToCloud])

  // Flush pending syncs first, then pull cloud receipts and merge.
  // Order matters — pulling before the flush would resurrect receipts deleted offline.
  // Conflicts resolve last-write-wins by updatedAt; receipts with queued local
  // edits are never overwritten by the cloud copy.
  // Runs on login and on pull-to-refresh.
  const syncWithCloud = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) return
    await flushOfflineQueue()
    const pending = await getOfflineQueue()
    const pendingDeleteIds = new Set(
      pending.filter((q) => q.type === 'delete').map((q) => q.receipt.id)
    )
    const pendingUpsertIds = new Set(
      pending.filter((q) => q.type === 'upsert').map((q) => q.receipt.id)
    )
    const { receipts: cloud, error } = await fetchCloudReceipts(user.id)
    if (error) {
      console.warn('Cloud receipts fetch failed:', error)
      return
    }
    if (cloud.length === 0) return
    setReceipts((prev) => {
      const cloudById = new Map(cloud.map((c) => [c.id, c]))
      let changed = false

      const merged = prev.map((local) => {
        const remote = cloudById.get(local.id)
        if (!remote || pendingUpsertIds.has(local.id)) return local
        const localTime = local.updatedAt ?? local.createdAt
        const remoteTime = remote.updatedAt ?? remote.createdAt
        if (remoteTime > localTime) {
          changed = true
          return remote
        }
        return local
      })

      const localIds = new Set(prev.map((r) => r.id))
      const missing = cloud.filter((c) => !localIds.has(c.id) && !pendingDeleteIds.has(c.id))
      if (!changed && missing.length === 0) return prev

      return [...merged, ...missing].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    })
  }, [user, flushOfflineQueue])

  // On login: sync pending operations and pull cloud receipts
  useEffect(() => {
    syncWithCloud()
  }, [syncWithCloud])

  // Background sync worker: flush the queue whenever connectivity is restored
  useEffect(() => {
    const unsubscribe = subscribeToNetworkChanges((connected) => {
      if (connected) {
        flushOfflineQueue()
      }
    })
    return unsubscribe
  }, [flushOfflineQueue])

  const value = useMemo(
    () => ({
      receipts,
      isLoading,
      addReceipt,
      updateReceipt,
      deleteReceipt,
      syncReceiptToCloud,
      syncWithCloud
    }),
    [
      receipts,
      isLoading,
      addReceipt,
      updateReceipt,
      deleteReceipt,
      syncReceiptToCloud,
      syncWithCloud
    ]
  )

  return <ReceiptsContext.Provider value={value}>{children}</ReceiptsContext.Provider>
}

export const useReceipts = (): ReceiptsContextValue => {
  const ctx = useContext(ReceiptsContext)
  if (!ctx) throw new Error('useReceipts must be used within ReceiptsProvider')
  return ctx
}
