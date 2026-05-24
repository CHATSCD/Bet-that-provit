import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'illProvIt — Stop Talking. #ProvIt.',
  description: 'Truth or Dare has been reborn in the meta. Challenge your circle. Put real money in the pot. #BetThat.',
  keywords: ['provit', 'bet', 'challenge', 'accountability', 'circle', 'wager'],
  openGraph: {
    title: 'illProvIt — Stop Talking. #ProvIt.',
    description: 'Put your money where your mouth is. #BetThat.',
    siteName: 'illProvIt',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'illProvIt',
    description: 'Stop Talking. #ProvIt.',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Oswald:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}
