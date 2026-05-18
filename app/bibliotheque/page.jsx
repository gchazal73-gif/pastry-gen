'use client';

import { RECETTES, CATEGORIES } from '../../lib/recettes/index.js';

export default function BibliothequeePage() {
  const total = RECETTES.length;
  const categories = Object.entries(CATEGORIES).sort((a, b) => a[1].ordre - b[1].ordre);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Bibliothèque de recettes</h1>
      <p style={{ color: 'var(--color-muted, #888)', marginBottom: '2rem' }}>
        {total} recette{total > 1 ? 's' : ''} — {categories.length} catégories
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {categories.map(([id, cat]) => {
          const count = RECETTES.filter(r => r.categorie === id).length;
          return (
            <div key={id} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              background: 'var(--color-surface, #1a1a1a)',
              borderRadius: '8px',
              opacity: count === 0 ? 0.45 : 1,
            }}>
              <span>{cat.label}</span>
              <span style={{ color: 'var(--color-muted, #888)', fontSize: '0.85rem' }}>
                {count > 0 ? `${count} recette${count > 1 ? 's' : ''}` : 'Bientôt'}
              </span>
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: '3rem', color: 'var(--color-muted, #888)', fontSize: '0.85rem' }}>
        Interface complète à venir — Étape B.
      </p>
    </main>
  );
}
