export const isCurrentMonth = (isoDate: string): boolean => {
  const d = new Date(isoDate)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

export const getGreeting = (): string => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export const getMonthYear = (isoDate: string): string => {
  const d = new Date(isoDate)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
}

export const formatDate = (isoDate: string): string => {
  const d = new Date(isoDate)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
