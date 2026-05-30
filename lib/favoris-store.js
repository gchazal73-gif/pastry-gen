const KEY = 'pastry-gen-favoris';

function read() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); }
  catch { return []; }
}
function write(ids) {
  localStorage.setItem(KEY, JSON.stringify(ids));
}

export function getFavoris()     { return read(); }
export function isFavori(id)     { return read().includes(id); }
export function toggleFavori(id) {
  const prev = read();
  const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
  write(next);
  return next;
}
