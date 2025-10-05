import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { Suspense } from 'react';
import { ExpenseProvider } from '@/contexts/expense-context';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Budget Buddy',
  description: 'Budget Buddy'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="antialiased">
        <body
          className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
          <Suspense fallback={<div>Loading...</div>}>
            <ExpenseProvider>{children}</ExpenseProvider>
          </Suspense>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
