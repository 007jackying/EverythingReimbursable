import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Receipt } from '@/types/receipt'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '@/constants/app'

const STORAGE_KEY = STORAGE_KEYS.receipts

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

  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as Receipt[]
          // Strip legacy seeded mock receipts (IDs were plain integers: '1'–'8')
          const real = parsed.filter((r) => !/^\d+$/.test(r.id))
          if (real.length !== parsed.length) {
            await save(real)
          }
          setReceipts(real)
        }
      } catch {
        setReceipts([])
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  const addReceipt = useCallback((receipt: Receipt) => {
    setReceipts((prev) => {
      const next = [receipt, ...prev]
      save(next)
      return next
    })
  }, [])

  const updateReceipt = useCallback((id: string, updates: Partial<Receipt>) => {
    setReceipts((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      save(next)
      return next
    })
  }, [])

  const deleteReceipt = useCallback((id: string) => {
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
