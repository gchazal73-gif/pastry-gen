import TableauAnalytique from '@/components/TableauAnalytique.jsx';

export const metadata = {
  title: 'Tableau analytique — Glaces & Sorbets | pastry-gen',
  description: 'Calculez et équilibrez vos mix glaces, sorbets et gelatos : PAC, POD, ES, MG, MSNG en temps réel.',
};

export default function GlaceriePage() {
  return (
    <div className="page-content">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 22 }}>Tableau analytique — Glaces & Sorbets</h1>
        <p style={{ margin: 0, color: 'var(--muted, #7a7269)', fontSize: 14 }}>
          Composez votre mix, saisissez les quantités et vérifiez l&apos;équilibre en temps réel :
          PAC, POD, extrait sec, matières grasses, MSNG et lactose.
        </p>
      </div>
      <TableauAnalytique />
    </div>
  );
}
