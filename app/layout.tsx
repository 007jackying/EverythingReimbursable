import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google'
import Providers from '@/lib/providers'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta'
})

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-grotesk'
})

export const metadata: Metadata = {
  title: 'EverythingReimbursable',
  description: 'Scan. Extract. Organize. AI-powered receipt tracking.'
}

export const viewport: Viewport = {
  themeColor: '#FAF9F7'
}

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={`${jakarta.variable} ${grotesk.variable}`}>
    <head>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        rel="stylesheet"
      />
    </head>
    <body className="bg-surface-dim font-body text-on-surface antialiased">
      <Providers>
        {/* Mobile-first app frame — full-bleed on phones, centered 640px column on desktop */}
        <div className="relative mx-auto min-h-dvh w-full max-w-[640px] bg-background sm:shadow-2xl">
          {children}
        </div>
      </Providers>
    </body>
  </html>
)

export default RootLayout
