'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChefHat,
  Library,
  LayoutTemplate,
  Bookmark,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  CookingPot,
  BookOpen,
  LayoutDashboard,
  Circle,
  Layers,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/',              label: 'Créer une recette',       icon: ChefHat,         active: true  },
  { href: '/ingredients',   label: 'Bibliothèque',             icon: Library,         active: true  },
  { href: '/bibliotheque',  label: 'Bibliothèque de recettes', icon: BookOpen,        active: true  },
  { href: '/moules',        label: 'Moules',                   icon: Circle,          active: true  },
  { href: '/plan-de-travail', label: 'Plan de travail',        icon: LayoutDashboard, active: true  },
  { href: '/compositions',   label: 'Mes compositions',        icon: Layers,          active: true  },
  { href: '/templates',     label: 'Templates & textures',     icon: LayoutTemplate,  active: false },
  { href: '/recettes',      label: 'Mes recettes',             icon: Bookmark,        active: false },
  { href: '/profils',       label: 'Profils & contraintes',    icon: User,            active: false },
  { href: '/parametres',    label: 'Paramètres',               icon: Settings,        active: false },
];

const STORAGE_KEY = 'pastry-gen-sidebar-collapsed';

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Lire la préférence stockée côté client uniquement
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setCollapsed(stored === 'true');
  }, []);

  function toggle() {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  // Pendant le SSR, on rend en mode déployé pour éviter le flash
  const isCollapsed = mounted ? collapsed : false;

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileClose} aria-hidden="true" />
      )}

      <aside
        className={[
          'sidebar',
          isCollapsed ? 'sidebar--collapsed' : '',
          mobileOpen  ? 'sidebar--mobile-open' : '',
        ].filter(Boolean).join(' ')}
        aria-label="Navigation principale"
      >
        {/* En-tête */}
        <div className="sidebar-head">
          <div className="sidebar-brand">
            <CookingPot size={22} strokeWidth={1.8} className="sidebar-logo-icon" />
            {!isCollapsed && <span className="sidebar-name">pastry-gen</span>}
          </div>
          <button
            className="sidebar-toggle desktop-only"
            onClick={toggle}
            aria-label={isCollapsed ? 'Déployer la sidebar' : 'Réduire la sidebar'}
            title={isCollapsed ? 'Déployer' : 'Réduire'}
          >
            {isCollapsed
              ? <ChevronRight size={16} strokeWidth={2} />
              : <ChevronLeft  size={16} strokeWidth={2} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ href, label, icon: Icon, active }) => {
            const isCurrent = pathname === href;
            if (!active) {
              return (
                <span
                  key={href}
                  className={`nav-item nav-item--disabled${isCollapsed ? ' nav-item--icon-only' : ''}`}
                  title="Bientôt disponible"
                  aria-disabled="true"
                >
                  <span className="nav-item__icon"><Icon size={18} strokeWidth={1.8} /></span>
                  {!isCollapsed && <span className="nav-item__label">{label}</span>}
                  {!isCollapsed && <span className="nav-item__soon">Bientôt</span>}
                </span>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item${isCurrent ? ' nav-item--active' : ''}${isCollapsed ? ' nav-item--icon-only' : ''}`}
                title={isCollapsed ? label : undefined}
                onClick={onMobileClose}
              >
                <span className="nav-item__icon"><Icon size={18} strokeWidth={1.8} /></span>
                {!isCollapsed && <span className="nav-item__label">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Pied — profil utilisateur */}
        <div className="sidebar-foot">
          <div className={`sidebar-user${isCollapsed ? ' sidebar-user--icon-only' : ''}`}>
            <div className="sidebar-avatar" aria-hidden="true">G</div>
            {!isCollapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">Guillaume</div>
                <div className="sidebar-user-role">Admin</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
