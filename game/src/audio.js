// WebAudio synth: engine, siren, shots, wind, radio blips. No samples.
let ctx = null, engOsc = null, engGain = null, sirenT = 0;
export function initAudio() { if (ctx) return; try { ctx = new (window.AudioContext || window.webkitAudioContext)(); engOsc = ctx.createOscillator(); engGain = ctx.createGain(); engOsc.type = 'sawtooth'; engOsc.frequency.value = 55; engGain.gain.value = 0; engOsc.connect(engGain).connect(ctx.destination); engOsc.start(); } catch (e) {} }
function blip(freq, dur, type, vol, slide) { if (!ctx) return; const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = freq; if (slide) o.frequency.exponentialRampToValueAtTime(slide, ctx.currentTime + dur); g.gain.setValueAtTime(vol, ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + dur); o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur); }
export function sfxShot(kind) { blip(kind === 1 ? 160 : 300, .12, 'square', .12, 60); }
export function sfxCash() { blip(880, .12, 'sine', .15); setTimeout(() => blip(1320, .16, 'sine', .15), 70); }
export function sfxHorn() { blip(220, .25, 'square', .08); }
export function sfxCrash() { blip(90, .3, 'sawtooth', .2, 40); }
export function updateAudio(g, dt) { if (!ctx || !engOsc) return; const spd = g.player.car ? Math.abs(g.player.car.speed) : 0; engGain.gain.value = g.mode === 'play' ? .015 + spd * .00008 : 0; engOsc.frequency.value = 50 + spd * .5; sirenT += dt; if (g.heat >= 1 && g.mode === 'play' && Math.floor(sirenT * 1.4) !== Math.floor((sirenT - dt) * 1.4)) blip(700 + (Math.floor(sirenT * 1.4) % 2) * 250, .18, 'triangle', .025); }
export function radioLine(g) { const a = ['KDUST 98.1 · desert rock & dust reports', 'RADIO ARROYO · synth twang all noon', 'KDUST: sheriff warns of checkpoint delays south', 'RADIO ARROYO: heat shimmer on the strip, drive cool']; return a[Math.floor(g.time / 9) % a.length]; }
