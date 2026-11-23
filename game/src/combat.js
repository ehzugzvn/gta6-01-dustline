// Mouse-aim shooting, bullets, damage, wasted/busted checks.
import { WEAPONS } from './config.js'; import { addHeat } from './law.js'; import { sfxShot } from './audio.js';
export function shoot(g, dt) {
  g.cooldown -= dt * 1000; const w = WEAPONS[g.weapon];
  if (!g.mouse.down || g.player.car || g.cooldown > 0 || g.mode !== 'play') return;
  if (w.ammo !== Infinity && g.ammo[g.weapon] <= 0) { g.banner = w.name + ' EMPTY — press Q to switch'; return; }
  g.cooldown = w.rate; if (w.ammo !== Infinity) g.ammo[g.weapon]--; g.shotsFired++;
  sfxShot(g.weapon);
  for (let i = 0; i < w.pellets; i++) { const a = g.player.aim + (Math.random() - .5) * 2 * w.spread; g.bullets.push({ x: g.player.x, y: g.player.y, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed, life: w.range / w.speed, dmg: w.dmg }); }
  addHeat(g, .18, 'Shots fired in San Ceniza');
}
export function updateBullets(g, dt) {
  for (const b of g.bullets) { b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; for (const v of [...g.law, ...g.traffic]) { if (!v.dead && Math.hypot(b.x - v.x, b.y - v.y) < 24) { v.hp -= b.dmg; b.life = 0; if (v.hp <= 0) { v.dead = true; v.speed = 0; if (v.law) { addHeat(g, .8, 'Sheriff vehicle disabled'); g.cash += 25; } } } } for (const p of g.peds) if (Math.hypot(b.x - p.x, b.y - p.y) < 9) { p.panic = 3; b.life = 0; addHeat(g, .5, 'Civilian endangered'); } }
  g.bullets = g.bullets.filter(b => b.life > 0);
  // law return fire at heat 3+
  if (g.heat >= 3 && Math.random() < dt * .8) { const v = g.law[0]; if (v && Math.hypot(v.x - g.player.x, v.y - g.player.y) < 340) { g.player.hp -= 3; g.flash = .15; } }
  if (g.player.hp <= 0) g.mode = 'wasted';
}
export function drawBullets(ctx, g, cam) { ctx.fillStyle = '#ffd23f'; for (const b of g.bullets) ctx.fillRect(b.x - cam.x - 2, b.y - cam.y - 2, 4, 4); }
