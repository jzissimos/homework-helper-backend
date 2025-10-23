import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Homework Helper API',
  description: 'Voice tutor backend for Katie',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
