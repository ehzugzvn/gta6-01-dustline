// San Ceniza layout: highway strip, buildings, props, arroyo, checkpoint.
import { rr, ri, pick } from './random.js';
export const HWY_X = 1850, HWY_W = 210;
export const buildings = [], props = [], roadblocks = [];
const NAMES = [['TRUCK STOP','DINER · DIESEL'],['CACTUS MOTEL','VACANCY'],['MOTEL SOL','POOL'],['CHAPEL OF DUST',''],['WATER TOWER',''],['GAS · EAT',''],['AUTO WRECK',''],['LAUNDRY',''],['GUN & BAIT',''],['CANTINA',''],['PAWN',''],['GARAGE','GARAGE · PRESS G'],['FEED STORE',''],['CLINIC',''],['SHERIFF','SHERIFF OFFICE'],['BORDER MART','']];
export function buildTown() {
  buildings.length = 0; props.length = 0; roadblocks.length = 0;
  const spots = [];
  for (let y = 500; y < 4300; y += 190) { spots.push([HWY_X - 330, y, -1]); spots.push([HWY_X + HWY_W + 90, y + 80, 1]); }
  spots.forEach((sp, i) => { const [label, sub] = NAMES[i % NAMES.length]; const w = rr(130, 200), h = rr(90, 140); buildings.push({ x: sp[0], y: sp[1], w, h, label: i === 4 ? 'WATER TOWER' : label, sub, hue: pick(['#c96f4a','#d9a066','#a8c8bc','#e0b48a','#b3402a','#e8d5a3']), roof: pick(['#7e2a1c','#5a4632','#0f6f6a','#8a5a2a']) }); });
  // Old Town grid west
  for (let i = 0; i < 8; i++) buildings.push({ x: 1160 + (i % 4) * 145, y: 2480 + Math.floor(i / 4) * 270, w: 118, h: 92, label: pick(['ADOBE','STORE','CASA','BAR','TALLER']), sub: '', hue: '#d9a066', roof: '#7e2a1c' });
  for (let i = 0; i < 90; i++) props.push({ x: rr(200, 3400), y: rr(250, 4900), kind: pick(['cactus','rock','pump','sign','wreck','barrel','billboard','cone']), a: rr(0, 6.28) });
  props.push({ kind: 'tower', x: 1580, y: 2280 }, { kind: 'billboard', x: 2150, y: 900, txt: 'SAN CENIZA' }, { kind: 'billboard', x: 1500, y: 3600, txt: 'MESA →' });
  roadblocks.push({ x: HWY_X, y: 4450, w: HWY_W, active: false }, { x: HWY_X, y: 1150, w: HWY_W, active: false });
}
export function isRoad(x, y) { if (x > HWY_X - 10 && x < HWY_X + HWY_W + 10) return true; if (y > 2680 && y < 2790 && x > 1200 && x < 2600) return true; if (y > 1750 && y < 1840 && x > 1200 && x < 2600) return true; return false; }
export function isArroyo(x, y) { return x > 700 && x < 1050 && y > 300 && y < 4800; }
export function collide(x, y, r) { for (const b of buildings) if (x + r > b.x && x - r < b.x + b.w && y + r > b.y && y - r < b.y + b.h) return b; return null; }
export function drawTown(ctx, cam) {
  ctx.fillStyle = '#e8d5a3'; ctx.fillRect(0, 0, 1280, 800);
  // mesa backdrop bands + arroyo
  ctx.fillStyle = '#d9c184'; for (let i = 0; i < 14; i++) ctx.fillRect(((i * 373 - cam.x * .3) % 1400), ((i * 211 - cam.y) % 900), 120, 26);
  ctx.fillStyle = '#cbb277'; ctx.fillRect(700 - cam.x, 0, 350, 800); ctx.fillStyle = '#b89a5e'; ctx.fillRect(860 - cam.x, 0, 30, 800);
  ctx.fillStyle = '#c47a4a'; ctx.fillRect(0, 0, Math.max(0, 500 - cam.x), 800);
  // roads
  ctx.fillStyle = '#4a4440'; ctx.fillRect(HWY_X - cam.x, 0, HWY_W, 800); ctx.fillRect(1200 - cam.x, 2680 - cam.y, 1400, 110); ctx.fillRect(1200 - cam.x, 1750 - cam.y, 1400, 90);
  ctx.strokeStyle = '#f7d774'; ctx.setLineDash([28, 22]); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(HWY_X + HWY_W / 2 - cam.x, 0); ctx.lineTo(HWY_X + HWY_W / 2 - cam.x, 800); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#fff8e7'; ctx.font = 'bold 13px monospace'; ctx.fillText('← ARROYO (heat decays)', 730 - cam.x, 120 - (cam.y % 400));
  // checkpoint
  ctx.fillStyle = '#2b1d12'; ctx.fillRect(HWY_X - 30 - cam.x, 4450 - cam.y, HWY_W + 60, 26); ctx.fillStyle = '#1fa8a0'; ctx.fillRect(HWY_X - 30 - cam.x, 4476 - cam.y, HWY_W + 60, 44); ctx.fillStyle = '#fff'; ctx.font = 'bold 16px monospace'; ctx.fillText('BORDER CHECKPOINT', HWY_X - 10 - cam.x, 4504 - cam.y);
  for (const rb of roadblocks) if (rb.active) { ctx.fillStyle = '#b3402a'; for (let i = 0; i < 5; i++) ctx.fillRect(rb.x + i * 42 - cam.x, rb.y - cam.y, 30, 14); ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.fillText('ROADBLOCK', rb.x + 60 - cam.x, rb.y - 8 - cam.y); }
  for (const p of props) { const x = p.x - cam.x, y = p.y - cam.y; if (x < -60 || x > 1340 || y < -60 || y > 860) continue; drawProp(ctx, p, x, y); }
  for (const b of buildings) { const x = b.x - cam.x, y = b.y - cam.y; if (x + b.w < 0 || x > 1280 || y + b.h < 0 || y > 800) continue; ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(x + 8, y + 10, b.w, b.h); ctx.fillStyle = b.hue; ctx.fillRect(x, y, b.w, b.h); ctx.fillStyle = b.roof; ctx.fillRect(x, y, b.w, 20); ctx.fillStyle = '#2b1d12'; ctx.font = 'bold 12px monospace'; ctx.fillText(b.label, x + 8, y + 38); ctx.font = '10px monospace'; ctx.fillText(b.sub || '', x + 8, y + 54); ctx.fillStyle = '#1fa8a0'; ctx.fillRect(x + b.w - 22, y + 26, 12, 18); }
}
function drawProp(ctx, p, x, y) { ctx.save(); ctx.translate(x, y); if (p.kind === 'cactus') { ctx.fillStyle = '#2e7d4f'; ctx.fillRect(-4, -18, 8, 30); ctx.fillRect(-13, -10, 7, 12); ctx.fillRect(6, -14, 7, 14); } else if (p.kind === 'tower') { ctx.strokeStyle = '#5a4632'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-24, 40); ctx.lineTo(0, -50); ctx.lineTo(24, 40); ctx.stroke(); ctx.fillStyle = '#1fa8a0'; ctx.beginPath(); ctx.arc(0, -58, 30, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.fillText('CENIZA', -22, -54); } else if (p.kind === 'billboard') { ctx.fillStyle = '#7e2a1c'; ctx.fillRect(-55, -42, 110, 42); ctx.fillStyle = '#fff'; ctx.font = 'bold 13px monospace'; ctx.fillText(p.txt || 'EAT · GAS', -48, -16); ctx.fillStyle = '#5a4632'; ctx.fillRect(-4, 0, 8, 26); } else if (p.kind === 'pump') { ctx.fillStyle = '#b3402a'; ctx.fillRect(-8, -14, 16, 24); ctx.fillStyle = '#fff'; ctx.fillRect(-5, -10, 10, 8); } else if (p.kind === 'wreck') { ctx.fillStyle = '#8a6a4a'; ctx.fillRect(-18, -8, 36, 16); ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(-10, 8, 5, 0, 7); ctx.arc(10, 8, 5, 0, 7); ctx.fill(); } else { ctx.fillStyle = '#a8845a'; ctx.fillRect(-7, -7, 14, 14); } ctx.restore(); }
