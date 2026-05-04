import AsyncStorage from '@react-native-async-storage/async-storage'
import { mockReceipts } from '@/data/mockReceipts'
import type { Receipt } from '@/types/receipt'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'receipts_v1'

interface ReceiptsContextValue {
  receipts: Receipt[]
  isLoading: boolean
  addReceipt: (receipt: Receipt) => Promise<void>
  updateReceipt: (id: string, updates: Partial<Receipt>) => Promise<void>
  deleteReceipt: (id: string) => Promise<void>
  getReceipt: (id: string) => Receipt | undefined
}

const ReceiptsContext = createContext<ReceiptsContextValue | null>(null)

const save = async (receipts: Receipt[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(receipts))
}

export const ReceiptsProvider = ({ children }: { children: React.ReactNode }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Rehydrate on mount — seed with mock data only on first launch
  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY)
        if (stored) {
          setReceipts(JSON.parse(stored) as Receipt[])
        } else {
          // First launch — seed with mock data and persist it
          setReceipts(mockReceipts)
          await save(mockReceipts)
        }
      } catch {
        // Corrupt store — fall back to mock data
        setReceipts(mockReceipts)
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  const addReceipt = useCallback(async (receipt: Receipt) => {
    setReceipts((prev) => {
      const next = [receipt, ...prev]
      save(next)
      return next
    })
  }, [])

  const updateReceipt = useCallback(async (id: string, updates: Partial<Receipt>) => {
    setReceipts((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      save(next)
      return next
    })
  }, [])

  const deleteReceipt = useCallback(async (id: string) => {
    setReceipts((prev) => {
      const next = prev.filter((r) => r.id !== id)
      save(next)
      return next
    })
  }, [])

  const getReceipt = useCallback((id: string) => receipts.find((r) => r.id === id), [receipts])

  const value = useMemo(
    () => ({ receipts, isLoading, addReceipt, updateReceipt, deleteReceipt, getReceipt }),
    [receipts, isLoading, addReceipt, updateReceipt, deleteReceipt, getReceipt]
  )

  return <ReceiptsContext.Provider value={value}>{children}</ReceiptsContext.Provider>
}

export const useReceipts = (): ReceiptsContextValue => {
  const ctx = useContext(ReceiptsContext)
  if (!ctx) throw new Error('useReceipts must be used within ReceiptsProvider')
  return ctx
}
