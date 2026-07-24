const ParticleSystem = {
  particles: [],
  emitters: [],

  emit(x, y, color, count = 8, speed = 60, life = 600, size = 3) {
    for (let i = 0; i < count; i++) {
      const angle = randf(0, Math.PI * 2);
      const spd = randf(speed * 0.3, speed);
      this.particles.push({
        x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
        life: life + rand(0, 200), maxLife: life + rand(0, 200),
        color, size: randf(size * 0.5, size * 1.5),
        decay: randf(0.95, 0.995)
      });
    }
  },

  emitBurst(x, y, colors, count = 20, speed = 100) {
    for (const color of colors) {
      this.emit(x, y, color, Math.floor(count / colors.length), speed);
    }
  },

  emitText(x, y, text, color = '#ffffff', duration = 1000) {
    this.particles.push({
      x, y, vx: 0, vy: -30, life: duration, maxLife: duration,
      color, size: 12, text, decay: 1, isText: true
    });
  },

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 50 * dt;
      p.vx *= p.decay || 0.98;
      p.vy *= p.decay || 0.98;
      p.life -= dt * 1000;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  },

  render(ctx, camX, camY) {
    for (const p of this.particles) {
      const alpha = clamp(p.life / p.maxLife, 0, 1);
      const sx = p.x - camX;
      const sy = p.y - camY;
      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.isText) {
        ctx.fillStyle = p.color;
        ctx.font = `bold ${p.size}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, sx, sy);
      } else {
        ctx.fillStyle = typeof p.color === 'number' ? '#' + p.color.toString(16).padStart(6, '0') : p.color;
        ctx.fillRect(sx - p.size / 2, sy - p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }
  },

  clear() {
    this.particles.length = 0;
  }
};