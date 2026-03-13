// app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import Logo from '@/components/Logo';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ViralEye — AI-Powered Viral Video Maker',
  description:
    'Generate viral short-form videos for TikTok, Reels, and Shorts in 60 seconds. AI writes your script, generates voiceover, and assembles the video. No editing skills needed.',
  metadataBase: new URL('https://viraleye.ai'),
  openGraph: {
    title: 'ViralEye — AI-Powered Viral Video Maker',
    description:
      'Generate viral TikTok, Reels, and Shorts in 60 seconds with AI.',
    url: 'https://viraleye.ai',
    siteName: 'ViralEye',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ViralEye — AI-Powered Viral Video Maker',
    description:
      'Generate viral TikTok, Reels, and Shorts in 60 seconds with AI.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}