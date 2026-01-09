import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CommandMenu } from '@/components/domain/navigation/CommandMenu';

/* ============================================
   FONT CONFIGURATION
   Inter Tight for premium UI typography
   ============================================ */

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

/* ============================================
   METADATA
   ============================================ */

export const metadata: Metadata = {
  title: 'OpenConstructionEstimate | Premium Construction Cost Estimation',
  description:
    'A premium, calm-tech construction cost estimation platform. Visualize projects, manage estimates, and analyze costs with a serene, professional interface.',
  keywords: [
    'construction',
    'estimation',
    'cost management',
    'BIM',
    'project management',
    'construction software',
  ],
  authors: [{ name: 'OpenConstructionEstimate Team' }],
  openGraph: {
    title: 'OpenConstructionEstimate',
    description: 'Premium construction cost estimation platform',
    type: 'website',
  },
};

/* ============================================
   ROOT LAYOUT
   ============================================ */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-cloud text-soft-black">
        {/* Global Command Menu - accessible via Ctrl/Cmd+K */}
        <CommandMenu />

        {/* Main application content */}
        {children}
      </body>
    </html>
  );
}
