/* =====================================================================
   COMPOSITIONS STORE — gestion des compositions planifiées (localStorage)
   ===================================================================== */

const KEY = 'pastry-gen-mes-compositions';

function read() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); }
  catch { return []; }
}

function write(ids) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(ids));
}

export function getPlannifiees() {
  return read();
}

export function togglePlannifiee(id) {
  const prev = read();
  const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
  write(next);
  return next;
}

export function isPlannifiee(id) {
  return read().includes(id);
}
