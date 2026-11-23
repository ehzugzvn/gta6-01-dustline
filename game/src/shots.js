// Deterministic screenshot staging from ?shot=...
import { makeVehicle } from './vehicles.js'; import { districtPos } from './runs.js'; import { roadblocks } from './town.js';
export function stageShot(g, name) {
  g.shotMode = true; g.mode = 'play';
  if (name === 'cover') {
    const semi = makeVehicle('semi', 1955, 3450, 0); semi.speed = 130; semi.cargo = 2400; g.parked.push(semi); g.player.car = semi; g.player.x = semi.x; g.player.y = semi.y; g.hasCargo = true; g.cargoValue = 3600; g.runIdx = 4; g.heat = 4.2; g.banner = 'RUN 5 · LONG HAUL — Break the checkpoint roadblock';
    roadblocks[1].y = 3220; roadblocks[1].active = true;
    for (let i = 0; i < 3; i++) { const v = makeVehicle('sheriff', 1895 + i * 75, 3620 + i * 60, 0); v.law = true; g.law.push(v); }
    g.heli.x = 2060; g.heli.y = 3330;
  } else if (name === 'onfoot') {
    g.player.x = 1630; g.player.y = 2720; g.player.aim = -.5; g.runIdx = 2; g.banner = 'RUN 3 · MOTEL MONEY — Pickup in Old Town · buyer marker ahead'; g.crew.forEach((c, i) => { c.x = g.player.x + (i ? 30 : -30); c.y = g.player.y + 24; }); g.peds.slice(0, 9).forEach((p, i) => { p.x = g.player.x + 50 + (i % 3) * 36; p.y = g.player.y - 60 + Math.floor(i / 3) * 42; p.panic = 2; });
  } else if (name === 'race') {
    const car = makeVehicle('car', 1955, 1500, 0); g.parked.push(car); g.player.car = car; g.player.x = car.x; g.player.y = car.y;
    g.race.active = true; g.race.count = 3.4; g.race.cp = 0; g.race.pos = 2; g.race.rivals = [makeVehicle('rival', 1895, 1560, 0), makeVehicle('rival', 2015, 1560, 0), makeVehicle('rival', 2075, 1505, 0)]; g.banner = 'STRIP RACE — beat 3 rivals to 6 checkpoints · P2/4';
  } else if (name === 'atlas') { g.mode = 'atlas'; g.doneRuns = 4; g.runIdx = 4; g.cash = 2750; g.stats.stolen = 9; g.stats.earned = 4100; }
}
