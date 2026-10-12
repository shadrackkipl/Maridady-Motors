export const display = {
  fontFamily: "'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif",
};

export const kes = (n) => "KSh " + Math.round(n).toLocaleString("en-KE");

/* ---------- loan maths ---------- */
export function monthlyReducing(p, r, n) {
  if (r === 0) return p / n;
  return (p * r) / (1 - Math.pow(1 + r, -n));
}

export function monthlyFlat(p, r, n) {
  return (p + p * r * n) / n;
}