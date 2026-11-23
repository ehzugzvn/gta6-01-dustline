// Dustline — main loop, state, player movement, car entry, collisions.
import { W, H } from './config.js'; import { seed } from './random.js'; import { initInput, keys, mouse, wasPressed, clearPressed, down } from './input.js';
import { buildTown, drawTown, isRoad, isArroyo, collide, roadblocks, HWY_X } from './town.js';
import { spawnParked, drive, drawVehicle } from './vehicles.js'; import { spawnTraffic, updateTraffic } from './traffic.js';
import { spawnPeds, updatePeds, drawPed } from './pedestrians.js'; import { updateLaw, addHeat, drawHeli } from './law.js';
import { shoot, updateBullets, drawBullets } from './combat.js'; import { updateRuns, startRace, updateRace, drawRace, buyGarage } from './runs.js';
import { makeCrew, updateCrew, drawCrew, drawCones } from './crew.js'; import { drawHUD, drawMarker } from './hud.js';
import { drawPlayer } from './render.js'; import { drawStart, drawAtlas, drawPause, drawEnd, drawGarage } from './menus.js';
import { initAudio, updateAudio, sfxCrash } from './audio.js'; import { saveGame, loadGame } from './save.js'; import { stageShot } from './shots.js';
const canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search); seed(parseInt(params.get('seed') || '7'));
export const g = { mode: 'start', time: 0, cash: 250, heat: 0, runIdx: 0, doneRuns: 0, hasCargo: false, cargoValue: 0, cargoTimer: 0, weapon: 0, ammo: [Infinity, 32, 120, 180], cooldown: 0, shotsFired: 0, banner: '', bannerT: 0, bust: 0, flash: 0, offroad: false, garage: { armor: 0, engine: 0, tires: 0 }, stats: { stolen: 0, earned: 0, races: 0 }, player: { x: 1955, y: 2650, hp: 100, armor: 50, aim: 0, car: null }, crew: makeCrew(), bullets: [], law: [], spikes: [], heli: { x: 1955, y: 2400, t: 0 }, race: { active: false, count: 0, cp: 0, pos: 4, rivals: [] }, mouse, shotMode: false, parked: [], traffic: [], peds: [] };
buildTown(); g.parked = spawnParked(); g.traffic = spawnTraffic(); g.peds = spawnPeds(); initInput(canvas);
if (params.get('shot')) stageShot(g, params.get('shot'));
canvas.addEventListener('mousedown', () => { initAudio(); if (g.mode === 'start') startGame(false); });
function startGame(cont) { const s = cont ? loadGame() : null; if (s) { g.cash = s.cash; g.runIdx = s.runIdx; g.doneRuns = s.done; g.stats.stolen = s.stolen; g.stats.earned = s.earned; g.garage = s.garage; g.player.x = s.x; g.player.y = s.y; } g.mode = 'play'; g.banner = 'Welcome to San Ceniza — follow the gold marker'; g.bannerT = 5; }
function cam() { const p = g.player; return { x: Math.max(0, Math.min(W - 1280, p.x - 640)), y: Math.max(0, Math.min(H - 800, p.y - 400)) }; }
let last = performance.now();
function frame(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; g.time += dt; if (g.bannerT > 0) g.bannerT -= dt; g.flash = Math.max(0, g.flash - dt); update(dt); render(); clearPressed(); requestAnimationFrame(frame); }
function update(dt) {
  if (g.mode === 'start') { if (wasPressed('Enter')) startGame(false); if (wasPressed('KeyC')) startGame(true); return; }
  if (wasPressed('KeyM')) g.mode = g.mode === 'atlas' ? 'play' : 'atlas';
  if (wasPressed('KeyP') || wasPressed('Escape')) g.mode = g.mode === 'pause' ? 'play' : (g.mode === 'play' ? 'pause' : g.mode);
  if (g.mode === 'garage') { if (wasPressed('Digit1')) buyGarage(g, 0); if (wasPressed('Digit2')) buyGarage(g, 1); if (wasPressed('Digit3')) buyGarage(g, 2); if (wasPressed('KeyG')) g.mode = 'play'; return; }
  if (g.mode === 'busted' || g.mode === 'wasted') { if (wasPressed('Enter')) { g.cash = Math.floor(g.cash * .8); g.player.hp = 100; g.heat = 0; g.law = []; g.bust = 0; g.player.x = 1750; g.player.y = 2750; g.player.car = null; g.mode = 'play'; } return; }
  if (g.mode !== 'play') return;
  const p = g.player; p.aim = Math.atan2(mouse.y - 400, mouse.x - 640);
  g.offroad = isArroyo(p.x, p.y) || !isRoad(p.x, p.y);
  if (wasPressed('KeyQ')) { g.weapon = (g.weapon + 1) % 4; g.banner = 'Weapon: ' + ['REVOLVER','SHOTGUN','RIFLE','SMG'][g.weapon]; }
  if (wasPressed('KeyR')) startRace(g);
  if (wasPressed('KeyG') && Math.hypot(p.x - 1620, p.y - 2050) < 500) g.mode = 'garage';
  if (wasPressed('KeyE')) {
    if (p.car) { p.x = p.car.x + 30; p.y = p.car.y; p.car = null; }
    else { let best = null, bd = 70; for (const v of [...g.parked, ...g.traffic]) if (!v.dead && Math.hypot(v.x - p.x, v.y - p.y) < bd) { bd = Math.hypot(v.x - p.x, v.y - p.y); best = v; } if (best) { p.car = best; if (!best.stolen) { best.stolen = true; g.stats.stolen++; if (best.traffic) addHeat(g, .6, 'Vehicle stolen on the strip'); } g.banner = 'Driving ' + best.type.name + (best.kind === 'semi' ? ' — slow, heavy, huge cargo value' : ''); } }
  }
  if (p.car) {
    const v = p.car, boost = down('ShiftLeft') || down('ShiftRight');
    drive(v, { throttle: (down('KeyW') || down('ArrowUp') ? 1 : 0) - (down('KeyS') || down('ArrowDown') ? .7 : 0), steer: (down('KeyA') ? -1 : 0) + (down('KeyD') ? 1 : 0), offroad: g.offroad && g.garage.tires < 2 }, dt, boost && g.garage.engine >= 0);
    if (collide(v.x, v.y, 18) && Math.abs(v.speed) > 30) { v.speed *= -.3; v.hp -= 3; sfxCrash(); }
    for (const rb of roadblocks) if (rb.active && Math.abs(v.y - rb.y) < 22 && v.x > rb.x && v.x < rb.x + rb.w) { if (v.kind === 'semi' && Math.abs(v.speed) > 90) { rb.active = false; g.banner = 'ROADBLOCK SMASHED by the semi!'; addHeat(g, .7, 'Roadblock smashed'); } else { v.speed *= -.25; v.hp -= 8; } }
    p.x = v.x; p.y = v.y; if (v.hp <= 0) { v.dead = true; p.car = null; p.hp -= 15; g.banner = 'Vehicle wrecked!'; }
  } else {
    const sp = 175 * dt; let mx = (down('KeyD') ? 1 : 0) - (down('KeyA') ? 1 : 0), my = (down('KeyS') ? 1 : 0) - (down('KeyW') ? 1 : 0); const nx = p.x + mx * sp, ny = p.y + my * sp; if (!collide(nx, p.y, 10)) p.x = nx; if (!collide(p.x, ny, 10)) p.y = ny; p.x = Math.max(20, Math.min(W - 20, p.x)); p.y = Math.max(120, Math.min(H - 20, p.y));
    shoot(g, dt);
  }
  updateTraffic(g, dt); updatePeds(g, dt); updateLaw(g, dt); updateBullets(g, dt); updateRuns(g, dt); updateCrew(g, dt); updateRace(g, dt); updateAudio(g, dt);
  if (Math.floor(g.time) % 12 === 0 && dt > 0 && Math.random() < dt) saveGame(g);
}
function render() {
  const c = cam(); drawTown(ctx, c); drawMarker(ctx, g, c); drawCones(ctx, g, c);
  for (const v of [...g.parked, ...g.traffic, ...g.law, ...(g.race.rivals || [])]) drawVehicle(ctx, v, c);
  for (const s of g.spikes) { ctx.fillStyle = '#222'; ctx.fillRect(s.x - c.x - 16, s.y - c.y - 3, 32, 6); }
  for (const p of g.peds) drawPed(ctx, p, c);
  drawCrew(ctx, g, c); drawPlayer(ctx, g, c); drawBullets(ctx, g, c); drawHeli(ctx, g, c); drawRace(ctx, g, c);
  if (g.mode === 'play') drawHUD(ctx, g);
  if (g.mode === 'start') drawStart(ctx, g); if (g.mode === 'atlas') drawAtlas(ctx, g); if (g.mode === 'pause') drawPause(ctx, g); if (g.mode === 'garage') drawGarage(ctx, g);
  if (g.mode === 'busted') drawEnd(ctx, g, 'busted'); if (g.mode === 'wasted') drawEnd(ctx, g, 'wasted');
}
requestAnimationFrame(frame);
