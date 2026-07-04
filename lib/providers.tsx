'use client'

import { AuthProvider } from './auth'
import { CurrencyProvider } from './currency'
import { ReceiptsProvider } from './receipts'

const Providers = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <CurrencyProvider>
      <ReceiptsProvider>{children}</ReceiptsProvider>
    </CurrencyProvider>
  </AuthProvider>
)

export default Providers
