// Seeded RNG so screenshot scenes are deterministic.
let s = 1234567;
export function seed(n) { s = (n >>> 0) || 1; }
export function rnd() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }
export function rr(a, b) { return a + rnd() * (b - a); }
export function ri(a, b) { return Math.floor(rr(a, b + 1)); }
export function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
export function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
export function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
export function angTo(a, b) { return Math.atan2(b.y - a.y, b.x - a.x); }
