import type { Metadata } from "next";
import "./globals.css";
import "@/styles/webengine.css";
import SecurityGuard from "@/components/SecurityGuard";
import Header from "@/components/Header";
import AmbientGlow from "@/components/AmbientGlow";
import { fontBody, fontDisplay } from "./fonts";

import { getSiteConfig } from '@/lib/config';

const config = getSiteConfig();

export const metadata: Metadata = {
  title: `${config.nameGame} - ${config.gameTitle} | Server Game MU Online Việt Nam`,
  description: config.metaDescription,
  keywords: config.metaKeywords,
  authors: [{ name: `${config.nameGame} Team` }],
  creator: config.nameGame,
  publisher: config.nameGame,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(config.websiteUrl),
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: `${config.nameGame} - ${config.gameTitle} | Server Game MU Online Việt Nam`,
    description: config.metaDescription,
    url: config.websiteUrl,
    siteName: config.websiteName,
    images: [
      {
        url: '/panel/muss2.png',
        width: 1200,
        height: 630,
        alt: `${config.nameGame} - ${config.gameTitle} - Hệ thống PvP và chiến đấu`,
      },
      {
        url: '/NAME.PNG',
        width: 1200,
        height: 630,
        alt: `${config.nameGame} - ${config.gameTitle} - Logo chính thức`,
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${config.nameGame} - ${config.gameTitle} | Server Game MU Online`,
    description: config.metaDescription,
    images: ['/panel/muss2.png', '/NAME.PNG'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/favicon.ico'
  },
  appleWebApp: {
    title: 'MU',
    statusBarStyle: 'default',
    capable: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#7c3aed',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/web-app-manifest-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/web-app-manifest-512x512.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="msapplication-TileColor" content="#7c3aed" />
        <meta name="msapplication-TileImage" content="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={config.nameGame} />

        {/* Không dùng Service Worker — gỡ hết SW cũ để tránh cache gây giao diện cũ */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(s){s.unregister();});});}`,
          }}
        />
      </head>
      <body
        className={`${fontBody.variable} ${fontDisplay.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <SecurityGuard />
        <AmbientGlow />
        <Header />
        <main className="we-site-canvas">{children}</main>
      </body>
    </html>
  );
}
