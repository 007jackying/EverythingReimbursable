import { useAuth } from '@/context/AuthContext'
import { Redirect } from 'expo-router'

const Index = () => {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Redirect href="/(main)/home" />
  return <Redirect href="/(auth)/splash" />
}

export default Index
