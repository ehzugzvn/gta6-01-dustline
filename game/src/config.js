// Dustline configuration: world, palette, weapons, tuning.
export const W = 3600, H = 5200, VIEW_W = 1280, VIEW_H = 800;
export const PAL = { sand:'#e8d5a3', sand2:'#d9c184', road:'#4a4440', roadEdge:'#f2e6c9', rust:'#b3402a', rustD:'#7e2a1c', turq:'#1fa8a0', turqD:'#0f6f6a', mesa:'#c47a4a', sky:'#f7e8b0', ink:'#2b1d12', white:'#fff8e7' };
export const WEAPONS = [
  { name:'REVOLVER', dmg:34, rate:380, spread:.04, pellets:1, range:420, ammo:Infinity, speed:720 },
  { name:'SHOTGUN', dmg:13, rate:820, spread:.22, pellets:7, range:260, ammo:32, speed:620 },
  { name:'RIFLE', dmg:22, rate:150, spread:.02, pellets:1, range:560, ammo:120, speed:900 },
  { name:'SMG', dmg:11, rate:85, spread:.11, pellets:1, range:380, ammo:180, speed:800 },
];
export const DISTRICTS = [
  { name:'TRUCK STOP', x:1500, y:600, w:600, h:520, buyer:1.0 },
  { name:'MOTEL ROW', x:2150, y:1500, w:650, h:620, buyer:1.15 },
  { name:'OLD TOWN', x:1350, y:2350, w:900, h:800, buyer:1.3 },
  { name:'THE MESA', x:400, y:3300, w:800, h:700, buyer:1.55 },
  { name:'CHECKPOINT SOUTH', x:1500, y:4300, w:700, h:650, buyer:1.8 },
];
export const HEAT_NAMES = ['','PATROL','PURSUE','BLOCKADE','DUSTOFF','TACTICAL'];
export function districtAt(x, y) { for (const d of DISTRICTS) if (x>d.x&&x<d.x+d.w&&y>d.y&&y<d.y+d.h) return d; return { name:'SAN CENIZA — HIGHWAY STRIP', buyer:1 }; }
