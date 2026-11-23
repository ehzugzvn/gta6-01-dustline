// localStorage save / load.
const KEY = 'dustline-save-v1';
export function saveGame(g) {
  try { localStorage.setItem(KEY, JSON.stringify({ cash: g.cash, runIdx: g.runIdx, done: g.doneRuns, stolen: g.stats.stolen, earned: g.stats.earned, garage: g.garage, x: g.player.x, y: g.player.y })); } catch (e) {}
}
export function loadGame() { try { const d = JSON.parse(localStorage.getItem(KEY)); return d || null; } catch (e) { return null; } }
export function hasSave() { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } }
