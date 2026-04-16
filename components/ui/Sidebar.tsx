'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Dashboard', icon: '▦' },
  { href: '/create', label: 'New Proposal', icon: '✦' },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: '◈' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="mark">PF</span>
        <span>ProposalForge</span>
      </div>

      <nav className="sidebar-nav">
        {LINKS.map((link) => {
          const active = link.href === '/' ? pathname === '/' : pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${active ? 'active' : ''}`}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div>v0.1.0 · Built for enterprise</div>
      </div>
    </aside>
  );
}
