import { useState, useMemo } from 'react'
import type { Receipt, ReceiptCategory, ReceiptStatus } from '@/types/receipt'
import { isCurrentMonth, getMonthYear } from '@/utils/time'
import { CATEGORY_LABELS } from '@/constants/app'

type FilterMode = 'All' | 'This Month' | 'By Category' | 'Filters'

interface UseReceiptFilterReturn {
  filterMode: FilterMode
  setFilterMode: (mode: FilterMode) => void
  searchText: string
  setSearchText: (text: string) => void
  selectedCategory: ReceiptCategory | 'all'
  setSelectedCategory: (category: ReceiptCategory | 'all') => void
  selectedStatus: ReceiptStatus | 'all'
  setSelectedStatus: (status: ReceiptStatus | 'all') => void
  filteredReceipts: Receipt[]
  groupedReceipts: Record<string, Receipt[]>
  groupKeys: string[]
}

const matchesSearch = (receipt: Receipt, search: string): boolean => {
  if (!search.trim()) return true
  const query = search.toLowerCase()
  return (
    receipt.companyName.toLowerCase().includes(query) ||
    receipt.category.toLowerCase().includes(query) ||
    (receipt.notes?.toLowerCase().includes(query) ?? false)
  )
}

export const useReceiptFilter = (receipts: Receipt[]): UseReceiptFilterReturn => {
  const [filterMode, setFilterMode] = useState<FilterMode>('All')
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ReceiptCategory | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<ReceiptStatus | 'all'>('all')

  const filteredReceipts = useMemo(() => {
    let result = receipts

    // Apply search filter
    result = result.filter((r) => matchesSearch(r, searchText))

    // Apply mode-based filters
    if (filterMode === 'This Month') {
      result = result.filter((r) => isCurrentMonth(r.date))
    } else if (filterMode === 'By Category') {
      if (selectedCategory !== 'all') {
        result = result.filter((r) => r.category === selectedCategory)
      }
    } else if (filterMode === 'Filters') {
      if (selectedCategory !== 'all') {
        result = result.filter((r) => r.category === selectedCategory)
      }
      if (selectedStatus !== 'all') {
        result = result.filter((r) => r.status === selectedStatus)
      }
    }

    // Sort by date descending
    return [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [receipts, filterMode, searchText, selectedCategory, selectedStatus])

  const groupedReceipts = useMemo(() => {
    if (filterMode === 'By Category') {
      return filteredReceipts.reduce<Record<string, Receipt[]>>((acc, r) => {
        const key = CATEGORY_LABELS[r.category] ?? r.category
        ;(acc[key] ??= []).push(r)
        return acc
      }, {})
    }

    return filteredReceipts.reduce<Record<string, Receipt[]>>((acc, r) => {
      const key = getMonthYear(r.date)
      ;(acc[key] ??= []).push(r)
      return acc
    }, {})
  }, [filteredReceipts, filterMode])

  const groupKeys = useMemo(() => Object.keys(groupedReceipts), [groupedReceipts])

  return {
    filterMode,
    setFilterMode,
    searchText,
    setSearchText,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    filteredReceipts,
    groupedReceipts,
    groupKeys
  }
}
