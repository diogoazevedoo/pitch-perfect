import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pitch Perfect',
  description: 'Speak like a PRO',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
