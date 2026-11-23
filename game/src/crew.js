// Crew of two: Wrench (engine boost) and Lookout (scanner patrol cones).
export function makeCrew() { return [{ name: 'WRENCH', role: 'Engine boost — hold SHIFT in a car', color: '#d97a4a', x: 0, y: 0 }, { name: 'LOOKOUT', role: 'Scanner — reveals patrol vision cones', color: '#1fa8a0', x: 0, y: 0 }]; }
export function updateCrew(g, dt) { g.crew.forEach((c, i) => { const tx = g.player.x + (i ? 26 : -26), ty = g.player.y + 22; c.x += (tx - c.x) * dt * 3; c.y += (ty - c.y) * dt * 3; }); }
export function drawCrew(ctx, g, cam) { if (g.player.car) return; for (const c of g.crew) { const x = c.x - cam.x, y = c.y - cam.y; ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill(); ctx.fillStyle = '#e8b88a'; ctx.beginPath(); ctx.arc(x, y - 2, 4.5, 0, 7); ctx.fill(); ctx.fillStyle = '#2b1d12'; ctx.font = 'bold 8px monospace'; ctx.fillText(c.name, x - 14, y - 14); } }
export function drawCones(ctx, g, cam) { // Lookout scanner
  for (const v of g.law) { const x = v.x - cam.x, y = v.y - cam.y; ctx.fillStyle = 'rgba(255,60,40,.13)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, 150, v.a - .5 - Math.PI / 2, v.a + .5 - Math.PI / 2); ctx.closePath(); ctx.fill(); } }
