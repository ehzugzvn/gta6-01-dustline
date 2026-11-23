// Keyboard + mouse input state.
export const keys = {}, mouse = { x: 640, y: 400, down: false };
let pressed = {};
export function initInput(canvas) {
  addEventListener('keydown', e => { if (!keys[e.code]) pressed[e.code] = true; keys[e.code] = true; if (['ArrowUp','ArrowDown','Space'].includes(e.code)) e.preventDefault(); });
  addEventListener('keyup', e => { keys[e.code] = false; });
  canvas.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); mouse.x = (e.clientX - r.left) * 1280 / r.width; mouse.y = (e.clientY - r.top) * 800 / r.height; });
  canvas.addEventListener('mousedown', () => mouse.down = true);
  addEventListener('mouseup', () => mouse.down = false);
}
export function wasPressed(code) { const v = !!pressed[code]; return v; }
export function clearPressed() { pressed = {}; }
export const down = c => !!keys[c];
