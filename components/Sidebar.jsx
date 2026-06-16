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
  Tag,
  Snowflake,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/',               label: 'Créer une recette',  icon: ChefHat,         active: true  },
  { href: '/ingredients',    label: 'Ingrédients',        icon: Library,         active: true  },
  { href: '/bibliotheque',   label: 'Recettes',           icon: BookOpen,        active: true  },
  { href: '/glacerie',       label: 'Glaces & sorbets',   icon: Snowflake,       active: true  },
  { href: '/moules',         label: 'Moules',             icon: Circle,          active: true  },
  { href: '/mercuriale',     label: 'Mercuriale',         icon: Tag,             active: true  },
  { href: '/plan-de-travail', label: 'Plan de travail',   icon: LayoutDashboard, active: true  },
  { href: '/compositions',   label: 'Mes compositions',   icon: Layers,          active: true  },
  { href: '/templates',      label: 'Templates & textures', icon: LayoutTemplate, active: false,
    tooltip: 'Templates & textures — bientôt disponible' },
  { href: '/recettes',       label: 'Mes recettes',       icon: Bookmark,        active: false,
    tooltip: 'Mes recettes personnelles — bientôt disponible' },
  { href: '/profils',        label: 'Profils & contraintes', icon: User,          active: false,
    tooltip: 'Profils & contraintes — bientôt disponible' },
  { href: '/parametres',     label: 'Paramètres',         icon: Settings,        active: false,
    tooltip: 'Paramètres — bientôt disponible' },
];

const PLAN_KEY = 'pastry-gen-plan';

const STORAGE_KEY      = 'pastry-gen-sidebar-collapsed';
const STORAGE_KEY_SOON = 'nav-coming-soon-open';

function readPlanCount() {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    if (!raw) return 0;
    return JSON.parse(raw).slots?.length ?? 0;
  } catch {
    return 0;
  }
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const pathname = usePathname();
  const [collapsed,  setCollapsed]  = useState(false);
  const [mounted,    setMounted]    = useState(false);
  const [planCount,  setPlanCount]  = useState(0);
  const [soonOpen,   setSoonOpen]   = useState(false);

  // Lire la préférence stockée côté client uniquement
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored !== null) setCollapsed(stored === 'true');
    const storedSoon = localStorage.getItem(STORAGE_KEY_SOON);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (storedSoon !== null) setSoonOpen(storedSoon === 'true');
  }, []);

  // Badge plan de travail — lecture initiale + écoute storage cross-tab
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlanCount(readPlanCount());
    function onStorage(e) {
      if (e.key === PLAN_KEY || e.key === null) setPlanCount(readPlanCount());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function toggle() {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  function toggleSoon() {
    setSoonOpen(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_SOON, String(next));
      return next;
    });
  }

  // Pendant le SSR, on rend en mode déployé pour éviter le flash
  const isCollapsed  = mounted ? collapsed : false;
  const isSoonOpen   = mounted ? soonOpen  : false;

  const activeItems   = NAV_ITEMS.filter(item =>  item.active);
  const disabledItems = NAV_ITEMS.filter(item => !item.active);

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
          {/* Items actifs */}
          {activeItems.map(({ href, label, icon: Icon }) => {
            const isCurrent = pathname === href;
            const isPlan    = href === '/plan-de-travail';
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
                {!isCollapsed && isPlan && planCount > 0 && (
                  <span className="nav-item__badge">{planCount}</span>
                )}
              </Link>
            );
          })}

          {/* Section "À venir" — repliable, cachée en mode icônes */}
          {!isCollapsed && (
            <>
              <button
                className="nav-soon-header"
                onClick={toggleSoon}
                aria-expanded={isSoonOpen}
              >
                <span>À venir</span>
                <span className={`nav-soon-header__arrow${isSoonOpen ? ' nav-soon-header__arrow--open' : ''}`}>▸</span>
              </button>
              {isSoonOpen && disabledItems.map(({ href, label, icon: Icon, tooltip }) => (
                <span
                  key={href}
                  className="nav-item nav-item--disabled"
                  title={tooltip ?? `${label} — bientôt disponible`}
                  aria-disabled="true"
                >
                  <span className="nav-item__icon"><Icon size={18} strokeWidth={1.8} /></span>
                  <span className="nav-item__label">{label}</span>
                  <span className="nav-item__soon">Bientôt</span>
                </span>
              ))}
            </>
          )}
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
