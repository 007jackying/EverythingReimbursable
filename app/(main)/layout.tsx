'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TabBar from '@/components/TabBar'
import { useAuth } from '@/lib/auth'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-dvh bg-background" />
  }

  return (
    <>
      <div className="pb-32">{children}</div>
      <TabBar />
    </>
  )
}

export default MainLayout
