function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function randf(min, max) { return Math.random() * (max - min) + min; }

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function lerp(a, b, t) { return a + (b - a) * t; }

function distance(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

function rngSeed(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function showToast(msg, color = '#a0d0ff', duration = 2800) {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  el.style.borderColor = color;
  container.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.remove(); }, duration);
}

function createPixelTexture(scene, key, drawFn, w = 32, h = 32) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, w, h);
  scene.textures.get(key) || scene.textures.addCanvas(key, canvas);
}

function drawBox(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawRect(ctx, x, y, w, h, color) {
  ctx.strokeStyle = color;
  ctx.strokeRect(x, y, w, h);
}

function timeSince(t) { return Date.now() - t; }