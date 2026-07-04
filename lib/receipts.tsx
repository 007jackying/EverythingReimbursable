'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { Receipt } from './types'
import { STORAGE_KEYS } from './types'
import { isSupabaseConfigured } from './supabase'
import {
  upsertCloudReceipt,
  deleteCloudReceipt,
  fetchCloudReceipts,
  uploadReceiptImage,
  deleteReceiptImage
} from './cloud'
import { blobToDataUrl, compressImage } from './image'
import { useAuth } from './auth'

const STORAGE_KEY = STORAGE_KEYS.receipts

interface ReceiptsContextValue {
  receipts: Receipt[]
  isLoading: boolean
  addReceipt: (receipt: Receipt) => Promise<void>
  updateReceipt: (id: string, updates: Partial<Receipt>) => Promise<void>
  deleteReceipt: (id: string) => Promise<void>
  syncWithCloud: () => Promise<void>
}

const ReceiptsContext = createContext<ReceiptsContextValue | null>(null)

// Online-first: Supabase is the source of truth when configured; localStorage
// is the cache (and the whole store in local-only mode). A failed cloud write
// logs a warning and keeps the local copy — no offline queue.
export const ReceiptsProvider = ({ children }: { children: React.ReactNode }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const receiptsRef = useRef<Receipt[]>([])

  useEffect(() => {
    receiptsRef.current = receipts
  }, [receipts])

  // On logout, clear local receipts so the next account on this browser doesn't
  // inherit the previous user's data. Only when cloud-backed — in local-only
  // mode this browser is the sole copy, so it is kept.
  const prevUserRef = useRef(user)
  useEffect(() => {
    if (prevUserRef.current && !user && isSupabaseConfigured()) {
      setReceipts([])
    }
    prevUserRef.current = user
  }, [user])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setReceipts(JSON.parse(stored) as Receipt[])
    } catch {
      setReceipts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Single persistence point — every state change after rehydration is written
  useEffect(() => {
    if (isLoading) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts))
    } catch (err) {
      console.warn('Failed to persist receipts locally:', err)
    }
  }, [receipts, isLoading])

  // Blob URLs die on page refresh. Cloud mode replaces them with a public URL;
  // local-only mode inlines a compressed data URL so images survive reloads.
  // ponytail: data URLs in localStorage cap out around a few dozen receipts —
  // move to IndexedDB if local-only mode needs more.
  const resolveImage = useCallback(
    async (receipt: Receipt): Promise<Receipt> => {
      if (!receipt.imageUri.startsWith('blob:')) return receipt
      if (user && isSupabaseConfigured() && !receipt.cloudPath) {
        const result = await uploadReceiptImage(receipt.imageUri, user.id, receipt.id)
        if (result.error) throw new Error(result.error)
        return { ...receipt, imageUri: result.url, cloudPath: result.path }
      }
      const blob = await (await fetch(receipt.imageUri)).blob()
      const compressed = await compressImage(blob, 1280, 0.7)
      return { ...receipt, imageUri: await blobToDataUrl(compressed) }
    },
    [user]
  )

  const trySync = useCallback(
    async (receipt: Receipt): Promise<Receipt> => {
      let resolved = receipt
      try {
        resolved = await resolveImage(receipt)
        if (user && isSupabaseConfigured()) {
          const synced = { ...resolved, syncedAt: new Date().toISOString() }
          const { error } = await upsertCloudReceipt(synced, user.id)
          if (error) throw new Error(error)
          return synced
        }
      } catch (err) {
        console.warn('Cloud sync failed, keeping local copy:', err)
      }
      return resolved
    },
    [user, resolveImage]
  )

  const addReceipt = useCallback(
    async (receipt: Receipt) => {
      const stamped: Receipt = { ...receipt, updatedAt: receipt.updatedAt ?? receipt.createdAt }
      const synced = await trySync(stamped)
      setReceipts((prev) => [synced, ...prev])
    },
    [trySync]
  )

  const updateReceipt = useCallback(
    async (id: string, updates: Partial<Receipt>) => {
      const existing = receiptsRef.current.find((r) => r.id === id)
      if (!existing) return
      const updated: Receipt = { ...existing, ...updates, updatedAt: new Date().toISOString() }
      const synced = await trySync(updated)
      setReceipts((prev) => prev.map((r) => (r.id === id ? synced : r)))
    },
    [trySync]
  )

  const deleteReceipt = useCallback(
    async (id: string) => {
      const receipt = receiptsRef.current.find((r) => r.id === id)
      setReceipts((prev) => prev.filter((r) => r.id !== id))
      if (!receipt || !user || !isSupabaseConfigured()) return
      if (!receipt.cloudPath && !receipt.syncedAt) return
      try {
        if (receipt.cloudPath) await deleteReceiptImage(receipt.cloudPath)
        const { error } = await deleteCloudReceipt(id, user.id)
        if (error) throw new Error(error)
      } catch (err) {
        console.warn('Cloud delete failed:', err)
      }
    },
    [user]
  )

  // Pull cloud receipts and merge, last-write-wins by updatedAt.
  // Runs on login and on pull-to-refresh.
  const syncWithCloud = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) return
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
        if (!remote) return local
        const localTime = local.updatedAt ?? local.createdAt
        const remoteTime = remote.updatedAt ?? remote.createdAt
        if (remoteTime > localTime) {
          changed = true
          return remote
        }
        return local
      })

      const localIds = new Set(prev.map((r) => r.id))
      const missing = cloud.filter((c) => !localIds.has(c.id))
      if (!changed && missing.length === 0) return prev

      return [...merged, ...missing].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    })
  }, [user])

  // On login: pull cloud receipts
  useEffect(() => {
    syncWithCloud()
  }, [syncWithCloud])

  const value = useMemo(
    () => ({ receipts, isLoading, addReceipt, updateReceipt, deleteReceipt, syncWithCloud }),
    [receipts, isLoading, addReceipt, updateReceipt, deleteReceipt, syncWithCloud]
  )

  return <ReceiptsContext.Provider value={value}>{children}</ReceiptsContext.Provider>
}

export const useReceipts = (): ReceiptsContextValue => {
  const ctx = useContext(ReceiptsContext)
  if (!ctx) throw new Error('useReceipts must be used within ReceiptsProvider')
  return ctx
}
