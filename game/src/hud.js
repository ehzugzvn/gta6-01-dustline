// HUD: minimap, heat stars, bars, cash, cargo, weapon, objective, district plate, radio ticker.
import { W, H, WEAPONS, districtAt } from './config.js'; import { HWY_X, HWY_W } from './town.js'; import { currentRun, runTarget } from './runs.js'; import { radioLine } from './audio.js';
export function drawHUD(ctx, g) {
  const p = g.player;
  // district plate + objective banner
  ctx.fillStyle = 'rgba(20,12,6,.82)'; ctx.fillRect(430, 8, 420, 30); ctx.fillStyle = '#ffd23f'; ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center'; ctx.fillText(districtAt(p.x, p.y).name, 640, 29); ctx.textAlign = 'left';
  if (g.bannerT > 0 || g.shotMode) { ctx.fillStyle = 'rgba(179,64,42,.92)'; ctx.fillRect(240, 44, 800, 30); ctx.fillStyle = '#fff'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center'; ctx.fillText((g.banner || '').slice(0, 88), 640, 64); ctx.textAlign = 'left'; }
  const r = currentRun(g);
  if (r) { ctx.fillStyle = 'rgba(20,12,6,.78)'; ctx.fillRect(12, 8, 400, 52); ctx.fillStyle = '#1fa8a0'; ctx.font = 'bold 12px monospace'; ctx.fillText('RUN ' + (g.runIdx + 1) + ' · ' + r.title, 20, 27); ctx.fillStyle = '#fff8e7'; ctx.font = '11px monospace'; ctx.fillText(r.text.slice(0, 58), 20, 44); if (g.race.active) ctx.fillText('RACE pos ' + g.race.pos + '/4 · checkpoint ' + g.race.cp + '/6', 20, 57); }
  // heat stars
  ctx.font = 'bold 24px monospace'; for (let i = 0; i < 5; i++) { ctx.fillStyle = i < Math.floor(g.heat) ? '#ff3b2f' : 'rgba(255,255,255,.35)'; ctx.fillText('★', 1090 + i * 34, 34); }
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.fillText(g.heat >= 1 ? 'HEAT: ' + ['','PATROL','PURSUE + PIT','ROADBLOCKS','DUSTOFF-1 + SPIKES','TACTICAL TRUCKS'][Math.floor(g.heat)] : 'HEAT: COOL', 1090, 54);
  // bottom-left bars / cash / cargo
  ctx.fillStyle = 'rgba(20,12,6,.8)'; ctx.fillRect(12, 668, 300, 122);
  bar(ctx, 20, 680, 180, p.hp, 100, '#e33', 'HP'); bar(ctx, 20, 702, 180, p.armor, 100, '#1fa8a0', 'ARMOR');
  ctx.fillStyle = '#ffd23f'; ctx.font = 'bold 17px monospace'; ctx.fillText('$' + g.cash, 20, 742);
  ctx.fillStyle = '#fff'; ctx.font = '11px monospace'; ctx.fillText(g.hasCargo ? '◆ CARGO $' + g.cargoValue + ' (rising…)' : '◇ no cargo', 110, 742); ctx.fillText(WEAPONS[g.weapon].name + '  ammo ' + (g.ammo[g.weapon] === Infinity ? '∞' : g.ammo[g.weapon]) + '  [Q switch]', 20, 762); ctx.fillText(p.car ? 'IN: ' + p.car.type.name + '  HP ' + Math.ceil(p.car.hp) + '  [E exit · SHIFT boost]' : 'ON FOOT  [E enter car · WASD move]', 20, 780);
  // radio ticker
  ctx.fillStyle = 'rgba(20,12,6,.75)'; ctx.fillRect(430, 762, 420, 26); ctx.fillStyle = '#7ef0e6'; ctx.font = '11px monospace'; ctx.fillText('♪ ' + radioLine(g), 440, 779);
  drawMinimap(ctx, g);
  if (g.flash > 0) { ctx.fillStyle = 'rgba(255,0,0,.22)'; ctx.fillRect(0, 0, 1280, 800); }
  if (g.bust > .2 && !g.player.car) { ctx.fillStyle = '#ff3b2f'; ctx.font = 'bold 18px monospace'; ctx.fillText('BUST METER — move away!', 540, 720); }
}
function bar(ctx, x, y, w, v, mx, col, label) { ctx.fillStyle = '#333'; ctx.fillRect(x, y, w, 12); ctx.fillStyle = col; ctx.fillRect(x, y, w * Math.max(0, v / mx), 12); ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'; ctx.fillText(label, x + w + 6, y + 10); }
function drawMinimap(ctx, g) { const mx = 1096, my = 606, mw = 172, mh = 182, sx = mw / W, sy = mh / H; ctx.fillStyle = 'rgba(20,16,10,.88)'; ctx.fillRect(mx, my, mw, mh); ctx.fillStyle = '#6a625a'; ctx.fillRect(mx + HWY_X * sx, my, HWY_W * sx, mh); ctx.fillStyle = '#b89a5e'; ctx.fillRect(mx + 700 * sx, my, 350 * sx, mh); const t = runTarget(g); if (t) { ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(mx + t.x * sx, my + t.y * sy, 5, 0, 7); ctx.fill(); } for (const v of g.law) { ctx.fillStyle = '#ff3b2f'; ctx.fillRect(mx + v.x * sx - 2, my + v.y * sy - 2, 5, 5); } for (const v of g.traffic) { ctx.fillStyle = '#bbb'; ctx.fillRect(mx + v.x * sx - 1, my + v.y * sy - 1, 3, 3); } ctx.fillStyle = '#1fa8a0'; ctx.beginPath(); ctx.arc(mx + g.player.x * sx, my + g.player.y * sy, 4, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'; ctx.fillText('MAP · SAN CENIZA', mx + 8, my + 14); }
export function drawMarker(ctx, g, cam) { const t = runTarget(g); if (!t) return; const x = t.x - cam.x, y = t.y - cam.y; ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(x, y - 44 + Math.sin(g.time * 4) * 5); ctx.lineTo(x - 11, y - 64); ctx.lineTo(x + 11, y - 64); ctx.closePath(); ctx.fill(); ctx.font = 'bold 11px monospace'; ctx.fillText(g.hasCargo ? 'BUYER' : 'PICKUP', x - 20, y - 70); ctx.strokeStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(x, y, 34, 0, 7); ctx.stroke(); }
