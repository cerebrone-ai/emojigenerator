import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/ui/headers'
import ClientLayout from './client-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Emoji Maker',
  description: 'Generate custom emojis with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="bg-gray-100 py-4">
              <div className="container mx-auto px-4 text-center text-gray-600">
                © 2023 Emoji Maker. All rights reserved.
              </div>
            </footer>
          </div>
        </ClientLayout>
      </body>
    </html>
  )
}

