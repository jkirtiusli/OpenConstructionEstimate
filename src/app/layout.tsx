import type { Metadata } from 'next';
import './globals.css';
import { CommandMenu } from '@/components/domain/navigation/CommandMenu';
import { QueryProvider } from '@/lib/providers/QueryProvider';

/* ============================================
   FONT CONFIGURATION
   Using system fonts with Inter as preferred when available.
   Font stack defined in tailwind.config.ts and globals.css
   ============================================ */

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
    <html lang="en">
      <body className="font-sans antialiased bg-cloud text-soft-black">
        {/* React Query Provider for data fetching */}
        <QueryProvider>
          {/* Global Command Menu - accessible via Ctrl/Cmd+K */}
          <CommandMenu />

          {/* Main application content */}
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
