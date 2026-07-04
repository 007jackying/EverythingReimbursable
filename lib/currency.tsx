'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from './types'

const CURRENCY_KEY = STORAGE_KEYS.prefCurrency
const DEFAULT_CURRENCY = 'USD'

export const CURRENCY_OPTIONS: Record<string, string> = {
  USD: 'US Dollar',
  MYR: 'Malaysian Ringgit',
  EUR: 'Euro',
  GBP: 'British Pound',
  SGD: 'Singapore Dollar'
}

interface CurrencyContextValue {
  // Preferred display currency for aggregate amounts (totals, monthly stats).
  // Individual receipts always display in their own extracted currency.
  currency: string
  setCurrency: (code: string) => void
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY)

  useEffect(() => {
    const stored = localStorage.getItem(CURRENCY_KEY)
    if (stored) setCurrencyState(stored)
  }, [])

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code)
    localStorage.setItem(CURRENCY_KEY, code)
  }, [])

  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export const useCurrency = (): CurrencyContextValue => {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
