'use client';

import { useEffect } from 'react';
import RecipeFiche from './RecipeFiche';

export default function LightboxFiche({ recette, onClose }) {
  // Fermeture au clavier
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!recette) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 500,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '40px 16px',
        overflowY: 'auto',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: '100%', maxWidth: 720, position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: -16, right: -8, zIndex: 10,
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--ink)', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Fermer"
        >
          ×
        </button>
        <RecipeFiche recette={recette} />
      </div>
    </div>
  );
}
