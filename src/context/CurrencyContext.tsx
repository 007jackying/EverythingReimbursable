import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '@/constants/app'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const CURRENCY_KEY = STORAGE_KEYS.prefCurrency
const DEFAULT_CURRENCY = 'USD'

interface CurrencyContextValue {
  // Preferred display currency for aggregate amounts (totals, monthly stats).
  // Individual receipts always display in their own extracted currency.
  currency: string
  setCurrency: (code: string) => Promise<void>
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY)

  useEffect(() => {
    AsyncStorage.getItem(CURRENCY_KEY).then((stored) => {
      if (stored) setCurrencyState(stored)
    })
  }, [])

  const setCurrency = useCallback(async (code: string) => {
    setCurrencyState(code)
    await AsyncStorage.setItem(CURRENCY_KEY, code)
  }, [])

  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export const useCurrency = (): CurrencyContextValue => {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
