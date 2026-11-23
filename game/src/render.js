// Player rendering: June Calloway on foot with mouse aim, plus in-car marker.
export function drawPlayer(ctx, g, cam) {
  const p = g.player; if (p.car) return; const x = p.x - cam.x, y = p.y - cam.y;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(x + 4, y + 5, 10, 0, 7); ctx.fill();
  // aim line
  ctx.strokeStyle = 'rgba(255,210,63,.55)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(p.aim) * 46, y + Math.sin(p.aim) * 46); ctx.stroke();
  ctx.fillStyle = '#b3402a'; ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fill(); // rust jacket
  ctx.fillStyle = '#e8b88a'; ctx.beginPath(); ctx.arc(x, y - 2, 6, 0, 7); ctx.fill();
  ctx.fillStyle = '#2b1d12'; ctx.fillRect(x - 6, y - 10, 12, 4); // hat brim
  // gun
  ctx.save(); ctx.translate(x, y); ctx.rotate(p.aim); ctx.fillStyle = '#111'; ctx.fillRect(6, -2, 18, 4); ctx.restore();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'; ctx.fillText('JUNE CALLOWAY', x - 30, y - 20);
}
