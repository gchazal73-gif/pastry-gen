'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/',            label: 'Créer une recette', icon: '✦' },
  { href: '/ingredients', label: 'Bibliothèque',       icon: '⊞' },
];

const SOON = [
  'Templates & textures',
  'Mes recettes',
  'Profils & contraintes',
  'Paramètres',
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">🥐</span>
        <span className="sidebar-name">pastry-gen</span>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item${pathname === href ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </Link>
        ))}

        <div className="nav-divider" />

        {SOON.map(label => (
          <span key={label} className="nav-item disabled" title="Bientôt disponible">
            <span className="nav-icon">○</span>
            {label}
          </span>
        ))}
      </nav>
    </aside>
  );
}
