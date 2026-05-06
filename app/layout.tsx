import type { Metadata } from 'next'
import { Sarabun } from 'next/font/google'
import './globals.css'

const sarabun = Sarabun({ subsets: ['thai', 'latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'RichSave - Smart Savings & Deal Discovery',
  description: 'Discover amazing deals and track your savings with RichSave',
  icons: {
    icon: '/alpha/logo.svg',
    apple: '/alpha/logo.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={sarabun.className}>
        <div id="_top" style={{ position: 'absolute', top: 0, left: 0 }} />
        {children}
      </body>
    </html>
  )
}
