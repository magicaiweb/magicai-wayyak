import type { Metadata } from 'next'
import { Cairo, DM_Sans, Syne, Tajawal } from 'next/font/google'
import './globals.css'

const tajawal = Tajawal({ subsets: ['arabic'], weight: ['400', '500', '700'], variable: '--font-tajawal' })
const cairo = Cairo({ subsets: ['arabic'], weight: ['400', '600', '700'], variable: '--font-cairo' })
const syne = Syne({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-syne' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-dm-sans' })

export const metadata: Metadata = {
  title: 'WAYYAK وياك',
  description: 'Book any space by the hour in Saudi Arabia',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} ${cairo.variable} ${syne.variable} ${dmSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
