export { format as timeAgo } from 'timeago.js';

export const initials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

export const fmtCount = (n = 0) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return String(n);
};

// Deterministic gradient from a string (for avatar fallback)
const GRADS = [
  'from-indigo-500 to-cyan-400',
  'from-pink-500 to-rose-400',
  'from-emerald-500 to-teal-400',
  'from-orange-500 to-amber-400',
  'from-violet-500 to-purple-400',
  'from-sky-500 to-blue-400',
];
export const avatarGrad = (str = '') => {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return GRADS[h % GRADS.length];
};
