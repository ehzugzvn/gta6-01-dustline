// Story runs, contraband economy, races, garage.
// Stage 1: run definitions, pickup/delivery, cargo value growth.
import { DISTRICTS } from './config.js'; import { addHeat } from './law.js'; import { sfxCash } from './audio.js';
export const RUNS = [
  { title: 'FIRST LOAD', kind: 'deliver', from: 'TRUCK STOP', to: 'MOTEL ROW', cargo: 400, text: 'Pick up the crate at the Truck Stop. Drop it at Motel Row.' },
  { title: 'DECOY DUST', kind: 'decoy', from: 'MOTEL ROW', to: 'OLD TOWN', cargo: 0, text: 'Decoy run: draw the sheriff north, then lose them in the arroyo.' },
  { title: 'MOTEL MONEY', kind: 'deliver', from: 'OLD TOWN', to: 'TRUCK STOP', cargo: 650, text: 'Move the motel money back to the Truck Stop buyer.' },
  { title: 'TOWER COVER', kind: 'sniper', from: 'OLD TOWN', to: 'THE MESA', cargo: 500, text: 'Water-tower cover job: hold the tower, protect the Mesa handoff.' },
  { title: 'LONG HAUL', kind: 'semi', from: 'TRUCK STOP', to: 'CHECKPOINT SOUTH', cargo: 2400, text: 'Break the checkpoint roadblock with a loaded semi.' },
  { title: 'MESA GOLD', kind: 'deliver', from: 'THE MESA', to: 'MOTEL ROW', cargo: 1100, text: 'Mesa gold run — buyers pay 1.55x up there for a reason.' },
  { title: 'DAWN RUN — FINALE', kind: 'semi', from: 'OLD TOWN', to: 'CHECKPOINT SOUTH', cargo: 3200, text: 'Finale: run the checkpoint at dawn with a loaded semi. Everything on the line.' },
];
export function districtPos(name) { const d = DISTRICTS.find(d => d.name === name); return { x: d.x + d.w / 2, y: d.y + d.h / 2, d }; }
export function currentRun(g) { return RUNS[g.runIdx] || null; }
export function runTarget(g) { const r = currentRun(g); if (!r) return null; return districtPos(g.hasCargo ? r.to : r.from); }
export function updateRuns(g, dt) {
  const r = currentRun(g); if (!r) return;
  if (g.hasCargo) { g.cargoTimer += dt; g.cargoValue = Math.floor(r.cargo * (1 + Math.min(1.2, g.cargoTimer / 60)) * (g.player.car && g.player.car.kind === 'semi' ? 1.5 : 1)); if (Math.random() < dt * .2) addHeat(g, .02, 'Contraband spotted'); }
  const t = runTarget(g); const d = Math.hypot(g.player.x - t.x, g.player.y - t.y);
  if (d < 70 && !g.hasCargo && r.kind !== 'decoy') {
    if (r.kind === 'semi' && (!g.player.car || g.player.car.kind !== 'semi')) { g.banner = 'You need the SEMI TRUCK for this run — find one parked by the strip'; return; }
    g.hasCargo = true; g.cargoTimer = 0; g.cargoValue = r.cargo; if (g.player.car) g.player.car.cargo = r.cargo; g.banner = 'CARGO LOADED — $' + r.cargo + ' · value rises the longer you hold it · deliver to ' + r.to; addHeat(g, .5, 'Cargo picked up');
  } else if (d < 70 && g.hasCargo) {
    const pay = Math.floor(g.cargoValue * t.d.buyer); g.cash += pay; g.stats.earned += pay; g.doneRuns++; g.hasCargo = false; if (g.player.car) g.player.car.cargo = 0; sfxCash(); g.banner = 'DELIVERED +$' + pay + ' (' + t.d.name + ' buyer x' + t.d.buyer + ')'; g.runIdx++; if (g.runIdx >= RUNS.length) g.banner = 'ALL 7 RUNS DONE — San Ceniza is yours. Free roam!'; g.heat = Math.max(0, g.heat - 1);
  } else if (r.kind === 'decoy' && d < 80) { g.doneRuns++; g.runIdx++; g.cash += 300; g.banner = 'DECOY WORKED +$300 — sheriff chased dust'; }
}
// Stage 2: street races down the strip + garage upgrades.
import { makeVehicle } from './vehicles.js'; import { HWY_X } from './town.js';
export function startRace(g) {
  if (!g.player.car) { g.banner = 'Get in a car first, then press R to race the strip'; return; }
  g.race.active = true; g.race.count = 3; g.race.cp = 0; g.race.pos = 4; g.race.rivals = [];
  for (let i = 0; i < 3; i++) { const v = makeVehicle('rival', HWY_X + 40 + i * 55, g.player.y + 60 + i * 8, 0); v.speed = 0; g.race.rivals.push(v); }
  g.banner = 'STRIP RACE — 3…2…1… GO! Hit 6 checkpoints down the highway';
}
export const RACE_CPS = [900, 1600, 2300, 3000, 3700, 4400];
export function updateRace(g, dt) {
  if (!g.race.active) return;
  if (g.race.count > 0) { g.race.count -= dt; if (g.race.count <= 0) g.banner = 'GO! Race to checkpoint 1 — south down the strip'; return; }
  for (const v of g.race.rivals) { v.speed += (215 - v.speed) * dt * .5; v.y += v.speed * dt; if (v.y > 4700) v.y = 4700; }
  const targetY = RACE_CPS[g.race.cp];
  if (g.player.car && Math.abs(g.player.y - targetY) < 90 && g.player.x > HWY_X - 80 && g.player.x < HWY_X + 300) { g.race.cp++; g.banner = 'CHECKPOINT ' + g.race.cp + '/6'; if (g.race.cp >= 6) { const ahead = g.race.rivals.filter(v => v.y > g.player.y).length; g.race.pos = ahead + 1; g.race.active = false; if (g.race.pos === 1) { g.cash += 500; g.stats.races++; g.banner = 'RACE WON +$500 — queen of the strip!'; } else g.banner = 'Race finished P' + g.race.pos + ' — no prize, run it again (R)'; } }
  else g.race.pos = 1 + g.race.rivals.filter(v => (RACE_CPS[g.race.cp] - v.y) < (RACE_CPS[g.race.cp] - g.player.y)).length;
}
export function buyGarage(g, slot) {
  const costs = [300, 350, 250], names = ['armor', 'engine', 'tires'], key = names[slot];
  if (g.garage[key] >= 3) { g.banner = key.toUpperCase() + ' already maxed'; return; }
  if (g.cash < costs[slot]) { g.banner = 'Not enough cash for ' + key.toUpperCase() + ' ($' + costs[slot] + ')'; return; }
  g.cash -= costs[slot]; g.garage[key]++; if (key === 'armor') g.player.armor = 100; g.banner = 'GARAGE: ' + key.toUpperCase() + ' upgraded to Lv' + g.garage[key];
}
export function drawRace(ctx, g, cam) { for (const v of g.race.rivals || []) { /* drawn by main vehicle pass via g.allVehicles */ } if (g.race.active && g.race.count > 0) { ctx.fillStyle = '#ffd23f'; ctx.font = 'bold 90px monospace'; ctx.textAlign = 'center'; ctx.fillText(String(Math.ceil(g.race.count)), 640, 330); ctx.font = 'bold 20px monospace'; ctx.fillText('STRIP RACE — GET READY', 640, 370); ctx.textAlign = 'left'; } if (g.race.active) { const y = RACE_CPS[g.race.cp] - cam.y; ctx.fillStyle = '#1fa8a0'; ctx.fillRect(HWY_X - cam.x, y, 210, 10); ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.fillText('▼ CHECKPOINT ' + (g.race.cp + 1), HWY_X - cam.x + 40, y - 8); } }
