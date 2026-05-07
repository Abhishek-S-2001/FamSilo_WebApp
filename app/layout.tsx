import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

import Providers from '@/components/Providers';
import GlobalChatWrapper from '@/components/chat/GlobalChatWrapper';
import TermsGuard from '@/components/TermsGuard';

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'FamSilo — Your Private Family Network',
  description: 'A secure, invite-only social platform for families to share memories, proposals, and moments privately.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning is required by next-themes to prevent
    // the server/client mismatch on the `class` attribute of <html>
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <TermsGuard>
            {children}
          </TermsGuard>
          <GlobalChatWrapper />
        </Providers>
      </body>
    </html>
  );
}