// Wanted heat 1-5 and law response: patrols, PIT, roadblocks, DUSTOFF-1, tactical trucks, spikes.
import { makeVehicle } from './vehicles.js'; import { roadblocks } from './town.js'; import { rr } from './random.js';
export function addHeat(g, amt, why) { const before = Math.floor(g.heat); g.heat = Math.min(5.9, g.heat + amt); if (Math.floor(g.heat) > before) g.banner = 'HEAT ★'.repeat(Math.floor(g.heat)) + ' — ' + why; }
export function spawnLaw(g) { const want = [0, 1, 2, 3, 4, 5][Math.floor(g.heat)] || 0; while (g.law.length < want) { const a = rr(0, 6.28), kind = g.heat >= 5 && g.law.length >= 3 ? 'pickup' : 'sheriff'; const v = makeVehicle(kind, g.player.x + Math.cos(a) * 520, g.player.y + Math.sin(a) * 520, 0); v.law = true; g.law.push(v); } }
export function updateLaw(g, dt) {
  if (g.heat >= 3) roadblocks.forEach(r => r.active = true); else roadblocks.forEach(r => r.active = false);
  spawnLaw(g);
  for (const v of g.law) { if (v.dead) continue; const tx = g.player.car ? g.player.car.x : g.player.x, ty = g.player.car ? g.player.car.y : g.player.y; const d = Math.hypot(tx - v.x, ty - v.y); const wantA = Math.atan2(tx - v.x, -(ty - v.y)); let da = wantA - v.a; while (da > Math.PI) da -= 6.283; while (da < -Math.PI) da += 6.283; v.a += Math.max(-2.2 * dt, Math.min(2.2 * dt, da)); const pit = g.heat >= 2 && d < 60; v.speed += ((pit ? 245 : 225) - v.speed) * dt * .7; v.x += Math.sin(v.a) * v.speed * dt; v.y -= Math.cos(v.a) * v.speed * dt; if (d < 34 && g.player.car) { g.player.car.hp -= 14 * dt; if (g.heat >= 2) g.player.hp -= 2 * dt; } if (d < 30 && !g.player.car) { g.bust += dt; } }
  // helicopter DUSTOFF-1 at heat 4+
  if (g.heat >= 4) { g.heli.t += dt; g.heli.x += (g.player.x - g.heli.x) * dt * .8; g.heli.y += (g.player.y - 90 - g.heli.y) * dt * .8; }
  if (g.heat >= 4 && Math.random() < dt * .3 && !g.spikes.length) g.spikes.push({ x: g.player.x + rr(-40, 40), y: g.player.y - 180 });
  for (const s of g.spikes) if (g.player.car && Math.hypot(s.x - g.player.car.x, s.y - g.player.car.y) < 24) { g.player.car.speed *= .25; g.banner = 'SPIKE STRIP! Tires shredded — keep rolling'; }
  if (g.offroad) g.heat = Math.max(0, g.heat - dt * .09); else if (g.law.length === 0) g.heat = Math.max(0, g.heat - dt * .03);
  if (g.bust > 2.2) { g.mode = 'busted'; }
}
export function drawHeli(ctx, g, cam) { if (g.heat < 4) return; const x = g.heli.x - cam.x, y = g.heli.y - cam.y; const grd = ctx.createRadialGradient(g.player.x - cam.x, g.player.y - cam.y, 10, g.player.x - cam.x, g.player.y - cam.y, 120); grd.addColorStop(0, 'rgba(255,240,170,.5)'); grd.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(g.player.x - cam.x, g.player.y - cam.y, 120, 0, 7); ctx.fill(); ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#2b1d12'; ctx.fillRect(-26, -9, 52, 18); ctx.fillRect(20, -3, 30, 6); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; const r = Math.sin(g.time * 40) * 30; ctx.beginPath(); ctx.moveTo(-34, -14); ctx.lineTo(34, -14); ctx.stroke(); ctx.fillStyle = '#ffd23f'; ctx.font = 'bold 9px monospace'; ctx.fillText('DUSTOFF-1', -22, 22); ctx.restore(); }
