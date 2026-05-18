'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="app-main">
        <div className="mobile-topbar">
          <button
            className="hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} strokeWidth={2} />
          </button>
          <span className="mobile-topbar-title">pastry-gen</span>
        </div>

        {children}
      </div>
    </div>
  );
}
