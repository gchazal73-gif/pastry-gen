'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookmarkPlus, ListPlus, Printer, X } from 'lucide-react';
import { saveRecetteGeneree } from '@/lib/recettes-generees-store';
import { ajouterRecetteAuPlan } from '@/lib/plan-de-travail-utils';

function nomAuto(recette) {
  const base = [recette.texture, recette.parfum].filter(Boolean).join(' ');
  return base ? `${base} — ${recette.date}` : `Recette du ${recette.date}`;
}

// ── Modale de sauvegarde ──────────────────────────────────────────────────────

function ModalSauvegarder({ recette, onClose }) {
  const [nom,     setNom]     = useState(nomAuto(recette));
  const [saved,   setSaved]   = useState(false);

  function confirmer() {
    saveRecetteGeneree(recette, nom.trim() || nomAuto(recette));
    setSaved(true);
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--card)', borderRadius: 12,
        border: '1px solid var(--line)', padding: '24px 28px',
        width: '100%', maxWidth: 420, position: 'relative',
      }}>
        <button
          aria-label="Fermer"
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', padding: 4,
          }}
        >
          <X size={16} />
        </button>

        {saved ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <p style={{ fontWeight: 600, margin: '0 0 6px' }}>Recette sauvegardée</p>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 20px' }}>
              {nom.trim() || nomAuto(recette)}
            </p>
            <button className="secondary" onClick={onClose}>Fermer</button>
          </div>
        ) : (
          <>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>
              Sauvegarder la recette
            </h3>

            <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
              Nom de la recette
            </label>
            <input
              type="text"
              value={nom}
              onChange={e => setNom(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmer(); }}
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '8px 12px', border: '1px solid var(--line)',
                borderRadius: 8, fontSize: 14,
                background: 'var(--bg)', color: 'var(--ink)',
                marginBottom: 20,
              }}
            />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="secondary" onClick={onClose}>Annuler</button>
              <button className="primary" onClick={confirmer}>Sauvegarder</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Bloc CTA principal ────────────────────────────────────────────────────────

export default function RecipeActions({ recette }) {
  const router = useRouter();
  const [modalOpen,      setModalOpen]      = useState(false);
  const [planConfirm,    setPlanConfirm]    = useState(false);

  function handleAjouterAuPlan() {
    const saved = saveRecetteGeneree(recette, nomAuto(recette));
    ajouterRecetteAuPlan(saved);
    setPlanConfirm(true);
    setTimeout(() => {
      router.push('/plan-de-travail');
    }, 600);
  }

  return (
    <>
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap',
        marginTop: 12, paddingTop: 12,
        borderTop: '1px solid var(--line)',
      }}>
        <button
          className="secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          onClick={() => setModalOpen(true)}
        >
          <BookmarkPlus size={14} strokeWidth={2} />
          Sauvegarder
        </button>

        <button
          className={planConfirm ? 'primary' : 'secondary'}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          onClick={handleAjouterAuPlan}
          disabled={planConfirm}
        >
          <ListPlus size={14} strokeWidth={2} />
          {planConfirm ? 'Ajouté ✓' : 'Ajouter au Plan de travail'}
        </button>

        <button
          className="secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          onClick={() => window.print()}
        >
          <Printer size={14} strokeWidth={2} />
          Exporter PDF
        </button>
      </div>

      {modalOpen && (
        <ModalSauvegarder
          recette={recette}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
