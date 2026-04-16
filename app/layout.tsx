import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/ui/Sidebar';

export const metadata: Metadata = {
  title: 'ProposalForge — Enterprise Proposal Generator',
  description: 'AI-generated, enterprise-grade project proposals in minutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Sidebar />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
