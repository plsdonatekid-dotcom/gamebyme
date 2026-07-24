const GameEngine = {
  canvas: null, ctx: null,
  offscreen: null, offCtx: null,
  state: 'title',
  keys: {}, keysJustDown: {},
  width: GAME_WIDTH, height: GAME_HEIGHT,
  lastTime: 0, frameTime: 0, fps: 60, frameInterval: 1000 / 60,
  saveData: null, areaId: 'mosswood', mapDef: null,
  playerX: 3, playerY: 13, pixelX: 0, pixelY: 0,
  tileSize: TILE_SIZE, isMoving: false, moveTarget: null,
  moveSpeed: BASE_MOVE_SPEED,
  enemies: [], chests: [], combatEnemy: null,
  waterTiles: [], lavaTiles: [], animTime: 0,
  npcPositions: {}, interactCooldown: 0, lavaTimer: 0,
  lastDt: 0, shakeTimer: 0, shakeIntensity: 0, ambientTimer: 0,

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.imageRendering = 'pixelated';
    this.offscreen = document.createElement('canvas');
    this.offscreen.width = this.width;
    this.offscreen.height = this.height;
    this.offCtx = this.offscreen.getContext('2d');
    document.addEventListener('keydown', (e) => {
      const code = e.keyCode;
      if (!this.keys[code]) this.keysJustDown[code] = true;
      this.keys[code] = true;
      if ([KEYS.W, KEYS.A, KEYS.S, KEYS.D, KEYS.SPACE, KEYS.E, KEYS.I, KEYS.M, KEYS.Q, KEYS.ONE, KEYS.TWO, KEYS.THREE, KEYS.FOUR, KEYS.FIVE].includes(code)) e.preventDefault();
    });
    document.addEventListener('keyup', (e) => { this.keys[e.keyCode] = false; });
    this.canvas.addEventListener('click', () => { this.mouseClicked = true; });
    this.lastTime = performance.now();
    this.frameTime = this.lastTime;
    requestAnimationFrame((t) => this.loop(t));
  },

  loop(time) {
    try {
      this.frameTime += this.frameInterval;
      if (time < this.frameTime) { requestAnimationFrame((t) => this.loop(t)); return; }
      const dt = Math.min((time - this.lastTime) / 1000, 0.05);
      this.lastTime = time;
      this.animTime += dt;
      this.lastDt = dt;
      this.update(dt);
      this.render();
    } catch (e) { this.renderError(e); }
    for (const k in this.keysJustDown) this.keysJustDown[k] = false;
    this.mouseClicked = false;
    requestAnimationFrame((t) => this.loop(t));
  },

  update(dt) {
    if (this.state === 'playing') this.updatePlaying(dt);
  },

  render() {
    const ctx = this.ctx;
    if (this.state === 'title') { this.renderTitleScreen(ctx); return; }
    if (this.state !== 'playing' && this.state !== 'combat') return;
    CameraSystem.update(this.lastDt);
    let cx = ~~CameraSystem.x, cy = ~~CameraSystem.y;
    if (this.shakeTimer > 0) {
      this.shakeTimer -= this.lastDt;
      const s = this.shakeIntensity * clamp(this.shakeTimer / 0.3, 0, 1);
      cx += (Math.random() - 0.5) * s * 2;
      cy += (Math.random() - 0.5) * s * 2;
    }
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width, this.height);
    const ts = this.tileSize;
    const mapDef = this.mapDef;
    if (mapDef) {
      const startX = Math.max(0, ~~(cx / ts));
      const startY = Math.max(0, ~~(cy / ts));
      const endX = Math.min(mapDef.tiles[0].length, Math.ceil((cx + this.width) / ts) + 1);
      const endY = Math.min(mapDef.tiles.length, Math.ceil((cy + this.height) / ts) + 1);
      for (let y = startY; y < endY; y++) {
        const row = mapDef.tiles[y];
        for (let x = startX; x < endX; x++) {
          const td = mapDef.tileset[row[x]];
          if (td) this.drawTile(ctx, x, y, td, ts, cx, cy);
        }
      }
    }
    this.renderAnimatedTiles(ctx, cx, cy);
    this.renderChests(ctx, cx, cy);
    this.renderEnemies(ctx, cx, cy);
    this.renderNpcs(ctx, cx, cy);
    this.renderPlayer(ctx, cx, cy);
    ParticleSystem.render(ctx, cx, cy);
  },

  drawTile(ctx, x, y, td, ts, cx, cy) {
    const px = x * ts - cx, py = y * ts - cy;
    const c = '#' + td.color.toString(16).padStart(6, '0');
    const type = td.type;

    if (type === 'grass') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      const n = (x * 7 + y * 13) % 4;
      const sway = Math.sin((this.animTime || 0) * 2.5 + x * 0.6 + y * 0.4) * 2;
      ctx.fillStyle = 'rgba(60,140,60,0.4)';
      ctx.fillRect(px + 2 + sway, py + 2, 4, 6);
      ctx.fillRect(px + 18 + sway * 0.7, py + 10, 3, 5);
      ctx.fillRect(px + 25 + sway, py + 4, 4, 4);
      ctx.fillStyle = 'rgba(80,160,80,0.3)';
      ctx.fillRect(px + 8 - sway * 0.3, py + 20, 5, 3);
      ctx.fillRect(px + 22 + sway * 0.5, py + 22, 4, 3);
      if (n === 0) {
        ctx.fillStyle = '#ff88cc';
        ctx.fillRect(px + 14 + sway * 0.3, py + 14, 3, 3);
        ctx.fillRect(px + 12 + sway * 0.3, py + 16, 7, 2);
      } else if (n === 2) {
        ctx.fillStyle = '#ffff66';
        ctx.fillRect(px + 6 + sway * 0.5, py + 8, 2, 2);
      }
      return;
    }

    if (type === 'dirt' || type === 'path' || type === 'mountain_path') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      const n = (x * 5 + y * 11) % 3;
      ctx.fillStyle = 'rgba(40,30,20,0.3)';
      ctx.fillRect(px + 3 + n, py + 4 + n, 3, 3);
      ctx.fillRect(px + 22 - n, py + 18 + n, 4, 2);
      ctx.fillRect(px + 12, py + 26, 2, 3);
      ctx.fillStyle = 'rgba(100,80,50,0.2)';
      ctx.fillRect(px + 8, py + 10, 6, 2);
      ctx.fillRect(px + 20, py + 6, 4, 2);
      return;
    }

    if (type === 'water') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = 'rgba(20,60,120,0.3)';
      ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
      ctx.fillStyle = 'rgba(60,120,200,0.2)';
      ctx.fillRect(px + 6, py + 6, ts - 12, ts - 12);
      return;
    }

    if (type === 'tree') {
      const sway = Math.sin((this.animTime || 0) * 1.2 + x * 0.7 + y * 0.5) * 1.5;
      ctx.fillStyle = '#3a2210';
      ctx.fillRect(px + 13, py + 18, 6, 14);
      ctx.fillStyle = '#1a5a1a';
      ctx.beginPath();
      ctx.arc(px + 16 + sway, py + 12, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2a7a2a';
      ctx.beginPath();
      ctx.arc(px + 12 + sway * 0.8, py + 9, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + 20 + sway * 0.8, py + 9, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a9a3a';
      ctx.beginPath();
      ctx.arc(px + 16 + sway * 0.5, py + 7, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(px + 8, py + 26, 16, 6);
      return;
    }

    if (type === 'pine') {
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(px + 13, py + 18, 6, 14);
      ctx.fillStyle = '#0a3a1a';
      ctx.beginPath();
      ctx.moveTo(px + 16, py + 2);
      ctx.lineTo(px + 4, py + 22);
      ctx.lineTo(px + 28, py + 22);
      ctx.fill();
      ctx.fillStyle = '#1a5a2a';
      ctx.beginPath();
      ctx.moveTo(px + 16, py + 6);
      ctx.lineTo(px + 6, py + 20);
      ctx.lineTo(px + 26, py + 20);
      ctx.fill();
      ctx.fillStyle = '#2a7a3a';
      ctx.beginPath();
      ctx.moveTo(px + 16, py + 10);
      ctx.lineTo(px + 8, py + 18);
      ctx.lineTo(px + 24, py + 18);
      ctx.fill();
      return;
    }

    if (type === 'house') {
      ctx.fillStyle = '#6a3a2a';
      ctx.fillRect(px + 2, py + 12, ts - 4, ts - 12);
      ctx.fillStyle = '#5a2a1a';
      ctx.fillRect(px + 4, py + 14, ts - 8, ts - 16);
      ctx.fillStyle = '#8a4a3a';
      ctx.beginPath();
      ctx.moveTo(px - 1, py + 12);
      ctx.lineTo(px + 16, py + 1);
      ctx.lineTo(px + 33, py + 12);
      ctx.fill();
      ctx.fillStyle = '#aa6a4a';
      ctx.beginPath();
      ctx.moveTo(px, py + 12);
      ctx.lineTo(px + 16, py + 2);
      ctx.lineTo(px + 32, py + 12);
      ctx.fill();
      ctx.fillStyle = '#c08040';
      ctx.fillRect(px + 8, py + 16, 16, 10);
      ctx.fillStyle = '#8a6040';
      ctx.fillRect(px + 12, py + 18, 8, 8);
      ctx.fillStyle = '#ffdd44';
      ctx.fillRect(px + 14, py + 18, 4, 4);
      ctx.fillRect(px + 14, py + 22, 4, 2);
      return;
    }

    if (type === 'wall') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = 'rgba(60,60,80,0.3)';
      ctx.fillRect(px, py, ts, 2);
      ctx.fillRect(px, py + 11, ts, 2);
      ctx.fillRect(px, py + 22, ts, 2);
      ctx.fillStyle = 'rgba(80,80,100,0.2)';
      ctx.fillRect(px + 2, py + 2, 14, 9);
      ctx.fillRect(px + 18, py + 13, 12, 9);
      ctx.fillRect(px + 4, py + 24, 16, 8);
      return;
    }

    if (type === 'ruin_wall') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = 'rgba(80,80,80,0.3)';
      ctx.fillRect(px + 2, py, 10, 14);
      ctx.fillRect(px + 18, py + 4, 12, 10);
      ctx.fillRect(px + 6, py + 18, 14, 12);
      ctx.fillStyle = 'rgba(40,30,20,0.2)';
      if ((x + y) % 3 === 0) {
        ctx.fillRect(px + 8, py + 2, 2, 6);
      }
      return;
    }

    if (type === 'temple_wall') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = 'rgba(180,160,120,0.2)';
      ctx.fillRect(px, py, ts, 3);
      ctx.fillRect(px, py + 14, ts, 3);
      ctx.fillRect(px, py + 29, ts, 3);
      ctx.fillStyle = 'rgba(220,200,160,0.15)';
      ctx.fillRect(px + 4, py + 4, 8, 10);
      ctx.fillRect(px + 18, py + 4, 10, 10);
      ctx.fillRect(px + 6, py + 18, 20, 11);
      return;
    }

    if (type === 'flower') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = '#3a7a2a';
      ctx.fillRect(px + 14, py + 18, 4, 12);
      ctx.fillRect(px + 12, py + 22, 8, 2);
      ctx.fillStyle = '#ff66aa';
      ctx.beginPath();
      ctx.arc(px + 16, py + 14, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff88cc';
      ctx.beginPath();
      ctx.arc(px + 16, py + 14, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffff66';
      ctx.fillRect(px + 15, py + 13, 2, 2);
      return;
    }

    if (type === 'shrine') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = '#4433aa';
      ctx.fillRect(px + 6, py + 6, ts - 12, ts - 6);
      ctx.fillStyle = '#6655cc';
      ctx.fillRect(px + 8, py + 8, ts - 16, ts - 10);
      ctx.fillStyle = '#8877ee';
      ctx.fillRect(px + 12, py + 12, ts - 24, ts - 14);
      ctx.fillStyle = 'rgba(136,119,238,0.4)';
      ctx.fillRect(px + 6, py + 2, ts - 12, 4);
      return;
    }

    if (type === 'exit') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = '#223366';
      ctx.beginPath();
      ctx.arc(px + 16, py + 16, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4466aa';
      ctx.beginPath();
      ctx.arc(px + 16, py + 16, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6688cc';
      ctx.beginPath();
      ctx.arc(px + 16, py + 16, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(100,140,220,0.3)';
      ctx.fillRect(px + 2, py, ts - 4, 2);
      ctx.fillRect(px + 2, py + 30, ts - 4, 2);
      return;
    }

    if (type === 'lava') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = '#cc2200';
      ctx.fillRect(px, py, ts, 3);
      ctx.fillRect(px, py + 28, ts, 4);
      ctx.fillStyle = '#ff6622';
      ctx.fillRect(px + 4, py + 6, ts - 8, 3);
      ctx.fillRect(px + 6, py + 18, ts - 12, 3);
      ctx.fillStyle = 'rgba(255,100,30,0.3)';
      ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
      return;
    }

    if (type === 'bridge') {
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(px, py + 12, ts, 10);
      ctx.fillStyle = '#7a5a3a';
      ctx.fillRect(px + 1, py + 13, ts - 2, 8);
      ctx.fillStyle = '#4a2a0a';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(px + 2 + i * 8, py + 12, 6, 2);
        ctx.fillRect(px + 2 + i * 8, py + 20, 6, 2);
      }
      ctx.fillStyle = '#6a4a2a';
      ctx.fillRect(px + 6, py, 4, 14);
      ctx.fillRect(px + 22, py, 4, 14);
      ctx.fillRect(px + 6, py + 20, 4, 12);
      ctx.fillRect(px + 22, py + 20, 4, 12);
      ctx.fillStyle = '#8a6a4a';
      ctx.fillRect(px + 4, py, 2, 14);
      ctx.fillRect(px + 26, py, 2, 14);
      ctx.fillRect(px + 4, py + 20, 2, 12);
      ctx.fillRect(px + 26, py + 20, 2, 12);
      return;
    }

    if (type === 'snow') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = 'rgba(200,200,240,0.4)';
      ctx.fillRect(px + 4, py + 4, 6, 6);
      ctx.fillRect(px + 20, py + 14, 8, 8);
      ctx.fillRect(px + 10, py + 24, 5, 5);
      ctx.fillStyle = 'rgba(220,220,255,0.3)';
      ctx.fillRect(px + 14, py + 6, 4, 4);
      ctx.fillRect(px + 6, py + 18, 3, 3);
      return;
    }

    if (type === 'cave_floor') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = 'rgba(60,40,20,0.4)';
      ctx.fillRect(px + (x * 3) % ts, py + (y * 5) % ts, 3, 3);
      ctx.fillRect(px + (x * 7 + 10) % ts, py + (y * 3 + 8) % ts, 4, 2);
      ctx.fillStyle = 'rgba(100,80,40,0.2)';
      ctx.fillRect(px + 5, py + 5, ts - 10, ts - 10);
      if ((x + y) % 5 === 0) {
        ctx.fillStyle = 'rgba(136,102,238,0.3)';
        ctx.fillRect(px + 10, py + 10, 4, 4);
        ctx.fillRect(px + 18, py + 18, 2, 2);
      }
      return;
    }

    if (type === 'volcanic_rock') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = 'rgba(60,20,10,0.4)';
      ctx.fillRect(px + 3, py + 8, 8, 3);
      ctx.fillRect(px + 18, py + 4, 6, 3);
      ctx.fillRect(px + 8, py + 22, 10, 3);
      ctx.fillStyle = 'rgba(200,60,20,0.15)';
      ctx.fillRect(px + 14, py + 10, 2, 2);
      ctx.fillRect(px + 6, py + 26, 2, 2);
      return;
    }

    if (type === 'altar') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = '#4433aa';
      ctx.fillRect(px + 6, py + 10, ts - 12, ts - 12);
      ctx.fillStyle = '#6655cc';
      ctx.fillRect(px + 8, py + 12, ts - 16, ts - 16);
      ctx.fillStyle = '#8877ee';
      ctx.fillRect(px + 12, py + 16, ts - 24, ts - 18);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 14, py + 18, 4, 4);
      ctx.fillRect(px + 14, py + 24, 4, 2);
      return;
    }

    if (type === 'rock') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = '#4a4a4a';
      ctx.beginPath();
      ctx.arc(px + 16, py + 18, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5a5a5a';
      ctx.beginPath();
      ctx.arc(px + 14, py + 16, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6a6a6a';
      ctx.beginPath();
      ctx.arc(px + 12, py + 14, 4, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (type === 'floor' || type === 'temple_floor' || type === 'ruin_floor') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(px + (x % 2) * 16, py + (y % 2) * 16, 16, 16);
      return;
    }

    if (type === 'bookshelf') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = '#4a2a1a';
      ctx.fillRect(px + 3, py + 2, ts - 6, ts - 6);
      const colors = ['#aa4444','#44aa44','#4444aa','#aaaa44','#aa44aa'];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          ctx.fillStyle = colors[(row + col + x + y) % colors.length];
          ctx.fillRect(px + 5 + col * 9, py + 4 + row * 9, 7, 7);
        }
      }
      return;
    }

    if (type === 'stairs') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = 'rgba(100,80,120,0.3)';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(px + 4 + i * 2, py + 4 + i * 7, ts - 8 - i * 4, 5);
      }
      return;
    }

    if (type === 'table') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = '#4a3a2a';
      ctx.fillRect(px + 4, py + 12, ts - 8, ts - 14);
      ctx.fillStyle = '#6a5a4a';
      ctx.fillRect(px + 4, py + 12, ts - 8, 4);
      return;
    }

    if (type === 'column') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(px + 8, py, ts - 16, ts);
      ctx.fillStyle = '#5a5a5a';
      ctx.fillRect(px + 10, py, ts - 20, ts);
      ctx.fillStyle = '#6a6a6a';
      ctx.fillRect(px + 12, py + 2, ts - 24, ts - 4);
      return;
    }

    if (type === 'statue') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = '#5a5a5a';
      ctx.fillRect(px + 12, py + 4, 8, 8);
      ctx.fillRect(px + 10, py + 12, 12, 12);
      ctx.fillRect(px + 12, py + 24, 8, 8);
      ctx.fillStyle = '#6a6a6a';
      ctx.fillRect(px + 14, py + 6, 4, 4);
      return;
    }

    if (type === 'gold') {
      ctx.fillStyle = c;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = '#bb9900';
      ctx.fillRect(px + 4, py + 4, ts - 8, ts - 8);
      ctx.fillStyle = '#ffdd44';
      ctx.fillRect(px + 6, py + 6, ts - 12, ts - 12);
      ctx.fillStyle = '#ffee88';
      ctx.fillRect(px + 10, py + 10, ts - 20, ts - 20);
      return;
    }

    ctx.fillStyle = c;
    ctx.fillRect(px, py, ts, ts);
  },

  renderAnimatedTiles(ctx, cx, cy) {
    const t = this.animTime || 0;
    const ts = this.tileSize;
    for (const wt of this.waterTiles) {
      const px = wt.x * ts - cx, py = wt.y * ts - cy;
      const off = Math.sin(t * 1.5 + wt.x * 0.7 + wt.y * 0.4) * 3;
      ctx.fillStyle = 'rgba(74,138,186,0.25)';
      ctx.fillRect(px + off, py + 4, ts, 3);
      ctx.fillStyle = 'rgba(90,170,220,0.15)';
      ctx.fillRect(px - off, py + 14, ts, 2);
      ctx.fillStyle = 'rgba(60,120,180,0.15)';
      ctx.fillRect(px + off * 0.5, py + 24, ts, 3);
    }
    for (const lt of this.lavaTiles) {
      const px = lt.x * ts - cx, py = lt.y * ts - cy;
      const off = Math.sin(t * 1.2 + lt.x * 0.9 + lt.y * 0.6) * 4;
      ctx.fillStyle = 'rgba(255,80,20,0.3)';
      ctx.fillRect(px + off, py + 4, ts, 3);
      ctx.fillStyle = 'rgba(255,160,40,0.2)';
      ctx.fillRect(px - off, py + 14, ts, 3);
      ctx.fillStyle = 'rgba(255,200,60,0.1)';
      ctx.fillRect(px + off * 0.7, py + 24, ts, 2);
    }
  },

  renderPlayer(ctx, cx, cy) {
    const px = this.pixelX - cx, py = this.pixelY - cy;
    const ts = this.tileSize;
    const walkCycle = (this.animTime || 0) * 10;
    const isWalking = this.isMoving;
    const legOffset = isWalking ? Math.sin(walkCycle) * 3 : 0;
    const armOffset = isWalking ? Math.sin(walkCycle + Math.PI) * 2 : 0;
    const bob = isWalking ? Math.abs(Math.sin(walkCycle)) * 1.5 : Math.sin((this.animTime || 0) * 8) * 0.5;
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(px + 16, py + 30, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3355aa';
    ctx.fillRect(px + 10, py + 16 + bob, 4, 14);
    ctx.fillRect(px + 18, py + 16 + bob, 4, 14);
    ctx.fillStyle = '#5588cc';
    ctx.fillRect(px + 8, py + 10 + bob, ts - 16, ts - 12);
    ctx.fillStyle = '#3366aa';
    ctx.fillRect(px + 8, py + 18 + bob, ts - 16, 4);
    ctx.fillStyle = '#ffdd88';
    ctx.beginPath();
    ctx.arc(px + 16, py + 6 + bob, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ccaa66';
    ctx.fillRect(px + 10, py + 2 + bob, 4, 2);
    ctx.fillRect(px + 18, py + 2 + bob, 4, 2);
    ctx.fillStyle = '#000';
    ctx.fillRect(px + 12, py + 5 + bob, 2, 2);
    ctx.fillRect(px + 18, py + 5 + bob, 2, 2);
    ctx.fillStyle = '#ff8844';
    ctx.fillRect(px + 16, py + 6 + bob, 2, 2);
    ctx.fillRect(px + 20, py + 6 + bob, 2, 2);
    ctx.fillStyle = '#3355aa';
    const lx = px + 10 + legOffset, rx = px + 18 - legOffset;
    const la = px + 10 + armOffset, ra = px + 18 - armOffset;
    ctx.fillRect(lx, py + 22 + bob, 4, 8);
    ctx.fillRect(rx, py + 22 + bob, 4, 8);
    ctx.fillStyle = '#663311';
    const bx = lx - 1, by = py + 28 + bob;
    ctx.fillRect(lx - 1, py + 28 + bob, 5, 3);
    ctx.fillRect(rx - 1, py + 28 + bob, 5, 3);
  },

  renderEnemies(ctx, cx, cy) {
    const ts = this.tileSize;
    for (const e of this.enemies) {
      if (e.isDead) continue;
      const px = e.x * ts - cx, py = e.y * ts - cy;
      if (px < -ts || px > this.width + ts || py < -ts || py > this.height + ts) continue;
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.ellipse(px + 16, py + 30, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      const bob = Math.sin((this.animTime || 0) * 4 + e.x + e.y) * 1.5;
      const bodyColor = e.isBoss ? '#cc2222' : (e.aggro ? '#cc4422' : '#aa6633');
      const eyeColor = e.aggro ? '#ff2222' : '#ffdd66';
      ctx.fillStyle = bodyColor;
      ctx.fillRect(px + 4, py + 6 + bob, ts - 8, ts - 10);
      ctx.fillStyle = e.aggro ? '#ee5533' : '#cc8844';
      ctx.fillRect(px + 6, py + 8 + bob, ts - 12, ts - 14);
      ctx.fillStyle = '#fff';
      ctx.fillRect(px + 8, py + 10 + bob, 6, 6);
      ctx.fillRect(px + 18, py + 10 + bob, 6, 6);
      ctx.fillStyle = '#000';
      ctx.fillRect(px + 10, py + 12 + bob, 3, 3);
      ctx.fillRect(px + 20, py + 12 + bob, 3, 3);
      if (e.isBoss) {
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(px + 4, py + 4 + bob, ts - 8, 3);
        ctx.fillRect(px + 4, py + ts - 7 + bob, ts - 8, 3);
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS', px + ts / 2, py - 2 + bob);
      }
    }
  },

  renderNpcs(ctx, cx, cy) {
    const ts = this.tileSize;
    for (const [npcId, pos] of Object.entries(this.npcPositions)) {
      const px = pos.x * ts - cx, py = pos.y * ts - cy;
      if (px < -ts || px > this.width + ts || py < -ts || py > this.height + ts) continue;
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath();
      ctx.ellipse(px + 16, py + 30, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      const bob = Math.sin((this.animTime || 0) * 3 + npcId.length) * 1;
      ctx.fillStyle = '#33aa66';
      ctx.fillRect(px + 10, py + 16 + bob, 4, 10);
      ctx.fillRect(px + 18, py + 16 + bob, 4, 10);
      ctx.fillStyle = '#44cc77';
      ctx.fillRect(px + 8, py + 10 + bob, ts - 16, ts - 14);
      ctx.fillStyle = '#2a8844';
      ctx.fillRect(px + 8, py + 18 + bob, ts - 16, 4);
      ctx.fillStyle = '#ffdd88';
      ctx.beginPath();
      ctx.arc(px + 16, py + 6 + bob, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.fillRect(px + 12, py + 5 + bob, 2, 2);
      ctx.fillRect(px + 18, py + 5 + bob, 2, 2);
      ctx.fillStyle = '#33aa66';
      ctx.fillRect(px + 10, py + 22 + bob, 4, 8);
      ctx.fillRect(px + 18, py + 22 + bob, 4, 8);
      ctx.fillStyle = '#553311';
      ctx.fillRect(px + 10, py + 28 + bob, 5, 3);
      ctx.fillRect(px + 17, py + 28 + bob, 5, 3);
      const dist = Math.abs(pos.x - this.playerX) + Math.abs(pos.y - this.playerY);
      if (dist === 1) {
        const glow = Math.sin((this.animTime || 0) * 5) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255,255,200,${glow * 0.6})`;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!', px + ts / 2, py - 4);
      }
    }
  },

  renderChests(ctx, cx, cy) {
    const ts = this.tileSize;
    const t = this.animTime || 0;
    for (const chest of this.chests) {
      const px = chest.x * ts - cx, py = chest.y * ts - cy;
      if (px < -ts || px > this.width + ts || py < -ts || py > this.height + ts) continue;
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(px + 4, py + 28, ts - 8, 4);
      ctx.fillStyle = chest.opened ? '#6a4a2a' : '#b8862d';
      ctx.fillRect(px + 3, py + 6, ts - 6, ts - 8);
      ctx.fillStyle = chest.opened ? '#8a6a4a' : '#daa520';
      ctx.fillRect(px + 5, py + 8, ts - 10, ts - 12);
      ctx.fillStyle = chest.opened ? '#4a3a1a' : '#ffd700';
      ctx.fillRect(px + 5, py + 4, ts - 10, 5);
      ctx.fillStyle = chest.opened ? '#3a2a0a' : '#b8860b';
      ctx.fillRect(px + 5, py + 4, ts - 10, 2);
      if (!chest.opened) {
        const glow = Math.sin(t * 3) * 0.08 + 0.15;
        ctx.fillStyle = `rgba(255,215,0,${glow})`;
        ctx.beginPath();
        ctx.arc(px + ts / 2, py + ts / 2, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('?', px + ts / 2, py + ts / 2 + 6);
      } else {
        ctx.fillStyle = '#3a2a0a';
        ctx.fillRect(px + 10, py + 8, 4, 4);
        ctx.fillRect(px + 18, py + 8, 4, 4);
      }
    }
  },

  renderTitleScreen(ctx) {
    const w = this.width, h = this.height;
    const ts = this.tileSize;
    const t = this.animTime || 0;
    ctx.fillStyle = '#05051a';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 80; i++) {
      const sx = (i * 137 + 50) % w;
      const sy = (i * 251 + 30) % h;
      const size = ((i * 73) % 3) + 1;
      const twinkle = Math.sin(t * 1.5 + i) * 0.4 + 0.6;
      ctx.globalAlpha = twinkle * 0.8;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx, sy, size, size);
    }
    ctx.globalAlpha = 1;
    const mx = w / 2, my = 150;
    ctx.fillStyle = '#ddaa44';
    ctx.beginPath();
    ctx.arc(mx, my, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cc9922';
    ctx.beginPath();
    ctx.arc(mx, my, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#bb8811';
    ctx.beginPath();
    ctx.arc(mx, my, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,170,70,0.15)';
    ctx.beginPath();
    ctx.arc(mx, my, 55, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      const angle = t * 0.3 + i * (Math.PI / 3);
      ctx.fillStyle = 'rgba(255,200,100,0.08)';
      ctx.beginPath();
      ctx.arc(mx + Math.cos(angle) * 60, my + Math.sin(angle) * 60, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    const heroX = 160, heroY = 420;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(heroX + 16, heroY + 32, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    const bob = Math.sin(t * 3) * 1;
    ctx.fillStyle = '#4466aa';
    ctx.fillRect(heroX + 10, heroY + 16 + bob, 4, 12);
    ctx.fillRect(heroX + 18, heroY + 16 + bob, 4, 12);
    ctx.fillStyle = '#5588cc';
    ctx.fillRect(heroX + 8, heroY + 10 + bob, ts - 16, ts - 12);
    ctx.fillStyle = '#ffdd88';
    ctx.beginPath();
    ctx.arc(heroX + 16, heroY + 6 + bob, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillRect(heroX + 12, heroY + 5 + bob, 2, 2);
    ctx.fillRect(heroX + 18, heroY + 5 + bob, 2, 2);
    ctx.fillStyle = '#3355aa';
    ctx.fillRect(heroX + 10, heroY + 22 + bob, 4, 8);
    ctx.fillRect(heroX + 18, heroY + 22 + bob, 4, 8);
    ctx.fillStyle = '#663311';
    ctx.fillRect(heroX + 10, heroY + 28 + bob, 5, 3);
    ctx.fillRect(heroX + 17, heroY + 28 + bob, 5, 3);
    ctx.fillStyle = '#cc2222';
    ctx.fillRect(heroX + 24, heroY + 10 + bob, 6, 14);
    ctx.fillRect(heroX + 22, heroY + 10 + bob, 4, 4);
    ctx.fillRect(heroX + 28, heroY + 12 + bob, 4, 4);
    ctx.fillRect(heroX + 4, heroY + 8 + bob, 6, 12);
    ctx.fillStyle = '#4488aa';
    ctx.fillRect(heroX + 4, heroY + 8 + bob, 8, 3);
    ctx.fillRect(heroX + 22, heroY + 10 + bob, 10, 3);
    ctx.font = 'bold 56px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#80d0ff';
    ctx.shadowColor = '#40a0ff';
    ctx.shadowBlur = 30;
    ctx.fillText('MYTHOS ISLES', w / 2, 280);
    ctx.shadowBlur = 0;
    ctx.font = '18px monospace';
    ctx.fillStyle = '#a0a0c0';
    ctx.fillText('A Fantasy Adventure', w / 2, 315);
  },

  renderError(e) {
    console.error('Game error:', e);
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.save();
    ctx.fillStyle = '#1a0000';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#ff4444';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    let y = 40;
    ctx.fillText('ERROR: ' + (e.message || e), 20, y); y += 25;
    ctx.fillStyle = '#ffaa44';
    ctx.fillText('Stack:', 20, y); y += 20;
    const stack = (e.stack || '').split('\n').slice(0, 10);
    for (const line of stack) {
      ctx.fillStyle = '#cccc88';
      ctx.font = '11px monospace';
      ctx.fillText(line.trim(), 20, y);
      y += 16;
    }
    ctx.restore();
  },

  // ---- Game State ----
  startGame(isNew) {
    if (isNew) {
      this.saveData = createNewSave();
      this.saveData.player.unlockedSpells = ['magic_bolt'];
      this.saveData.player.spellSlots = ['magic_bolt', null, null, null, null];
      saveGame(this.saveData);
    } else {
      const loaded = loadGame();
      if (loaded) this.saveData = loaded;
      else { this.saveData = createNewSave(); saveGame(this.saveData); }
    }
    this.areaId = this.saveData.player.area || 'mosswood';
    this.mapDef = getMapData(this.areaId);
    if (!this.mapDef) { this.areaId = 'mosswood'; this.mapDef = getMapData('mosswood'); }
    this.playerX = this.saveData.player.x || 3;
    this.playerY = this.saveData.player.y || 13;
    this.pixelX = this.playerX * this.tileSize;
    this.pixelY = this.playerY * this.tileSize;
    CameraSystem.init(this.mapDef.width * this.tileSize, this.mapDef.height * this.tileSize);
    MinimapSystem.init();
    this.initArea();
    this.state = 'playing';
    AudioSystem.init();
    AudioSystem.resume();
    showToast('Exploring ' + this.mapDef.name, '#a0d0ff');
    this.updateHUD();
    this.updateSpellBar();
    if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
    this.autoSaveTimer = setInterval(() => saveGame(this.saveData), 30000);
  },

  initArea() {
    WorldSystem_init(this.areaId);
    WorldSystem_initChests(this.areaId, this.saveData);
    this.enemies = worldEnemies;
    this.chests = worldChests;
    this.waterTiles = [];
    this.lavaTiles = [];
    this.npcPositions = {};
    const mapDef = this.mapDef;
    if (!mapDef) return;
    for (let y = 0; y < mapDef.tiles.length; y++) {
      const row = mapDef.tiles[y];
      for (let x = 0; x < row.length; x++) {
        const td = mapDef.tileset[row[x]];
        if (td) {
          if (td.type === 'water') this.waterTiles.push({ x, y });
          if (td.type === 'lava') this.lavaTiles.push({ x, y });
        }
      }
    }
    const npcIds = mapDef.npcs || [];
    const taken = new Set();
    for (const npcId of npcIds) {
      let nx, ny, attempts = 0;
      do {
        nx = rand(1, mapDef.width - 2);
        ny = rand(1, mapDef.tiles.length - 2);
        attempts++;
      } while ((isSolid(this.areaId, nx, ny) || taken.has(nx + ',' + ny)) && attempts < 50);
      this.npcPositions[npcId] = { x: nx, y: ny };
      taken.add(nx + ',' + ny);
    }
  },

  // ---- Movement ----
  updatePlaying(dt) {
    this.handleMovement(dt);
    this.updateEnemies(dt);
    this.handleInput();
    CameraSystem.follow(this.pixelX + this.tileSize / 2, this.pixelY + this.tileSize / 2);
    ParticleSystem.update(dt);
    this.ambientTimer += dt;
    if (this.ambientTimer > 0.1) {
      this.ambientTimer = 0;
      this.spawnAmbientParticles();
    }
    this.updateHUD();
  },

  handleMovement(dt) {
    if (this.isMoving) {
      const targetPx = this.moveTarget.x * this.tileSize;
      const targetPy = this.moveTarget.y * this.tileSize;
      const dx = targetPx - this.pixelX;
      const dy = targetPy - this.pixelY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = this.moveSpeed * dt;
      if (dist < speed) {
        this.pixelX = targetPx; this.pixelY = targetPy;
        this.playerX = this.moveTarget.x; this.playerY = this.moveTarget.y;
        this.isMoving = false;
        this.saveData.player.x = this.playerX;
        this.saveData.player.y = this.playerY;
        this.checkLavaDamage();
        this.checkExits();
      } else {
        this.pixelX += (dx / dist) * speed;
        this.pixelY += (dy / dist) * speed;
      }
      return;
    }
    let dx = 0, dy = 0;
    if (this.isKeyDown(KEYS.W)) dy = -1;
    else if (this.isKeyDown(KEYS.S)) dy = 1;
    if (this.isKeyDown(KEYS.A)) dx = -1;
    else if (this.isKeyDown(KEYS.D)) dx = 1;
    if (dx !== 0 || dy !== 0) {
      const tx = this.playerX + dx, ty = this.playerY + dy;
      if (!isSolid(this.areaId, tx, ty) && !this.enemyAt(tx, ty)) {
        this.isMoving = true; this.moveTarget = { x: tx, y: ty };
      } else if (this.enemyAt(tx, ty)) {
        this.startCombat(tx, ty);
      }
    }
  },

  enemyAt(tx, ty) { return this.enemies.some(e => e.x === tx && e.y === ty && !e.isDead); },

  updateEnemies(dt) {
    WorldSystem_updateEnemies(dt, this.saveData, this.areaId, this.playerX, this.playerY);
    this.enemies = worldEnemies;
  },

  handleInput() {
    if (this.justDown(KEYS.SPACE) || this.justDown(KEYS.E)) this.interact();
    if (this.justDown(KEYS.I)) {
      document.getElementById('inventory-screen').classList.toggle('hidden');
      this.renderInventoryTab('items');
    }
    if (this.justDown(KEYS.M)) {
      const el = document.getElementById('world-map');
      el.classList.toggle('hidden');
      if (!el.classList.contains('hidden')) this.renderWorldMap();
    }
    if (this.justDown(KEYS.Q)) {
      const el = document.getElementById('quest-tracker');
      el.classList.toggle('hidden');
      if (!el.classList.contains('hidden')) this.renderQuestTracker();
    }
    for (let i = 0; i < 5; i++) {
      if (this.justDown([KEYS.ONE, KEYS.TWO, KEYS.THREE, KEYS.FOUR, KEYS.FIVE][i])) this.useSpellSlot(i);
    }
    if (this.mouseClicked) this.handleCanvasClick();
  },

  handleCanvasClick() {
    const ids = ['world-map', 'inventory-screen', 'quest-tracker'];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && !el.classList.contains('hidden')) { el.classList.add('hidden'); return; }
    }
  },

  isKeyDown(code) { return !!this.keys[code]; },
  justDown(code) {
    if (this.keysJustDown[code]) { this.keysJustDown[code] = false; return true; }
    return false;
  },

  interact() {
    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const tx = this.playerX + dx, ty = this.playerY + dy;
      for (const [npcId, pos] of Object.entries(this.npcPositions)) {
        if (pos.x === tx && pos.y === ty) { this.openDialog(npcId); return; }
      }
      const chest = WorldSystem_getChestAt(tx, ty);
      if (chest && !chest.opened) {
        const result = WorldSystem_openChest(this.saveData, tx, ty);
        if (result) {
          showToast('Chest! ' + result.loot.map(l => (getItem(l.id)?.name||l.id)+' x'+l.qty).join(', ') + ' +' + result.gold + 'g', '#ffd700');
          return;
        }
      }
      const tile = getTileAt(this.areaId, tx, ty);
      if (tile && tile.exitTo) { this.changeArea(tile.exitTo); return; }
    }
  },

  openDialog(npcId) {
    const npcDef = getNpc(npcId);
    if (!npcDef) return;
    const box = document.getElementById('dialog-box');
    const text = document.getElementById('dialog-text');
    const choices = document.getElementById('dialog-choices');
    box.classList.remove('hidden');
    const dialogs = npcDef.dialogues;
    const key = this.saveData.player.completedQuests.includes('awakening') ? 'default' : 'first';
    const dialog = dialogs[key] || dialogs.default || dialogs.first;
    if (!dialog) return;
    const self = this;
    text.textContent = dialog.text;
    choices.innerHTML = '';
    for (const c of (dialog.choices || [])) {
      const btn = document.createElement('button');
      btn.textContent = c.text;
      btn.onclick = () => {
        if (c.action === 'startQuest_awakening') { QuestSystem.startQuest(self.saveData, 'awakening'); showToast('Quest: The Awakening', '#80ff80'); }
        if (c.action === 'startQuest_forest_corruption') { QuestSystem.startQuest(self.saveData, 'forest_corruption'); showToast('Quest: Forest Corruption', '#80ff80'); }
        if (c.action === 'startQuest_volcano_trial') { QuestSystem.startQuest(self.saveData, 'volcano_trial'); showToast('Quest: Trial of Flame', '#80ff80'); }
        if (c.action === 'openShop' || c.action === 'openCrafting') { self.openShop(); box.classList.add('hidden'); return; }
        if (c.next) {
          const next = dialogs[c.next];
          if (next) {
            text.textContent = next.text;
            choices.innerHTML = '';
            for (const c2 of (next.choices || [])) {
              const b = document.createElement('button');
              b.textContent = c2.text;
              b.onclick = () => { if (c2.action === 'openShop') self.openShop(); box.classList.add('hidden'); };
              choices.appendChild(b);
            }
          }
        } else { box.classList.add('hidden'); }
      };
      choices.appendChild(btn);
    }
    QuestSystem.onTalk(this.saveData, npcId);
  },

  openShop() {
    document.getElementById('inventory-screen').classList.remove('hidden');
    const content = document.getElementById('inv-content');
    content.innerHTML = '<h3 style="color:#ffd700;margin-bottom:10px;">Shop</h3>';
    for (const id of ['health_potion', 'mana_potion', 'great_health_potion', 'great_mana_potion', 'wooden_staff', 'cloth_robe']) {
      const item = getItem(id); if (!item) continue;
      const div = document.createElement('div'); div.className = 'inv-item';
      div.innerHTML = `<h4>${item.icon} ${item.name}</h4><p>${item.desc}</p><p>${item.value}g</p>`;
      const btn = document.createElement('button');
      btn.textContent = 'Buy (' + item.value + 'g)';
      btn.style.cssText = 'background:#4466aa;border:1px solid #6688cc;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;font-family:inherit;';
      btn.onclick = () => {
        if (this.saveData.player.gold >= item.value) {
          this.saveData.player.gold -= item.value;
          InventorySystem.addItem(this.saveData, id, 1);
          AudioSystem.playSfx('coin');
          showToast('Bought ' + item.name, '#ffd700');
          this.updateHUD();
        } else showToast('Not enough gold!', '#ff4444');
      };
      div.appendChild(btn);
      content.appendChild(div);
    }
  },

  startCombat(tx, ty) {
    const enemy = WorldSystem_getEnemyAt(tx, ty);
    if (!enemy) return;
    this.combatEnemy = enemy;
    const midX = (this.pixelX + 16 + enemy.x * this.tileSize + 16) / 2;
    const midY = (this.pixelY + 16 + enemy.y * this.tileSize + 16) / 2;
    ParticleSystem.emitBurst(midX, midY, ['#ffffff', '#ffdd88', '#ff8844', '#ff6644'], 15, 100);
    const hud = document.getElementById('combat-hud');
    hud.classList.remove('hidden');
    document.getElementById('enemy-name').textContent = enemy.icon + ' ' + enemy.name + ' (Lv' + enemy.level + ')';
    document.getElementById('enemy-hp-bar').innerHTML = '<div style="width:100%"></div>';
    document.getElementById('enemy-name').style.color = enemy.isBoss ? '#ff4444' : '#ffaa44';
    document.getElementById('combat-log').textContent = enemy.name + ' appears!';
    if (enemy.isBoss) {
      AudioSystem.playSfx('boss');
      ParticleSystem.emitBurst(midX, midY, ['#ff4444', '#ffaa00', '#ffffff'], 20, 130);
    }
    this.shakeTimer = 0.15;
    this.shakeIntensity = 4;
  },

  changeArea(newArea) {
    const oldArea = this.areaId;
    this.areaId = newArea;
    this.mapDef = getMapData(newArea);
    if (!this.mapDef) { this.areaId = 'mosswood'; this.mapDef = getMapData('mosswood'); }
    this.saveData.player.area = this.areaId;
    for (const [ch, td] of Object.entries(this.mapDef.tileset)) {
      if (td.exitTo === oldArea) {
        this.playerX = td.exitX || 3; this.playerY = td.exitY || 3;
        this.pixelX = this.playerX * this.tileSize;
        this.pixelY = this.playerY * this.tileSize;
        break;
      }
    }
    this.saveData.player.x = this.playerX; this.saveData.player.y = this.playerY;
    CameraSystem.init(this.mapDef.width * this.tileSize, this.mapDef.height * this.tileSize);
    this.initArea();
    document.getElementById('area-name').textContent = this.mapDef.name;
    showToast('Entered ' + this.mapDef.name, '#a0d0ff');
    this.updateHUD();
    saveGame(this.saveData);
  },

  checkExits() {
    const tile = getTileAt(this.areaId, this.playerX, this.playerY);
    if (tile && tile.exitTo) this.changeArea(tile.exitTo);
  },

  checkLavaDamage() {
    const tile = getTileAt(this.areaId, this.playerX, this.playerY);
    if (tile && tile.damage) {
      if (!this.lavaTimer || performance.now() - this.lavaTimer > 1000) {
        this.lavaTimer = performance.now();
        PlayerSystem.takeDamage(this.saveData, 5);
        this.flashDamage();
        showToast('Lava! -5 HP', '#ff4400');
        this.updateHUD();
      }
    }
  },

  useSpellSlot(slotIdx) {
    const slots = this.saveData.player.spellSlots || [];
    const spellId = slots[slotIdx];
    if (!spellId) return;
    const spell = getSpell(spellId);
    if (!spell) return;
    if (this.saveData.player.mp < spell.cost) { showToast('Not enough mana!', '#ff4444'); return; }
    this.saveData.player.mp -= spell.cost;
    AudioSystem.playSfx('spell');
    ParticleSystem.emitBurst(this.pixelX + 16, this.pixelY + 16, ['#6688ff', '#88aaff', '#ffffff'], 12, 70);
    const matk = PlayerSystem.getTotalMatk(this.saveData);
    const damage = Math.floor(spell.damage + matk * 0.5);
    if (spell.effect === 'heal') {
      PlayerSystem.heal(this.saveData, Math.abs(spell.damage));
      showToast('Cast ' + spell.name + ': +' + Math.abs(spell.damage) + ' HP', '#44ff44');
      this.updateHUD(); return;
    }
    if (spell.effect === 'shield') {
      this.saveData.player.shield = (this.saveData.player.shield || 0) + Math.floor(matk * 0.5) + 10;
      showToast('Cast ' + spell.name + ': Shield!', '#88aaff');
      this.updateHUD(); return;
    }
    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const tx = this.playerX + dx, ty = this.playerY + dy;
      const enemy = WorldSystem_getEnemyAt(tx, ty);
      if (enemy) {
        const w = getWeakness(enemy.id, spell.type) || 1;
        const d = Math.floor(damage * w);
        enemy.currentHp -= d;
        showToast(spell.name + ' hits ' + enemy.name + ' for ' + d + '!', '#ff8844');
        if (enemy.currentHp <= 0) {
          enemy.isDead = true;
          const ex = enemy.x * this.tileSize + 16;
          const ey = enemy.y * this.tileSize + 16;
          ParticleSystem.emitBurst(ex, ey, ['#ff8844', '#ffcc44', '#ffffff', '#ff6644'], 20, 90);
          const r = CombatSystem.getLoot(this.saveData, enemy);
          showToast('Defeated ' + enemy.name + '! +' + r.xp + ' XP, +' + r.gold + 'g', '#ffd700');
          QuestSystem.onKill(this.saveData, enemy.id);
        }
        break;
      }
    }
    this.updateHUD();
  },

  updateHUD() {
    const sd = this.saveData;
    if (!sd) return;
    const hp = sd.player.hp, mhp = PlayerSystem.getMaxHp(sd);
    const mp = sd.player.mp, mmp = PlayerSystem.getMaxMp(sd);
    const xp = sd.player.xp, xtn = sd.player.xpToNext;
    const lv = sd.player.level, gold = sd.player.gold;
    document.getElementById('hp-bar').style.width = (hp / mhp * 100) + '%';
    document.getElementById('hp-text').textContent = Math.floor(hp) + '/' + mhp;
    document.getElementById('mp-bar').style.width = (mp / mmp * 100) + '%';
    document.getElementById('mp-text').textContent = Math.floor(mp) + '/' + mmp;
    document.getElementById('xp-bar').style.width = (xp / xtn * 100) + '%';
    document.getElementById('xp-text').textContent = 'Lv ' + lv;
    document.getElementById('gold-display').innerHTML = '&#9733; ' + gold;
    MinimapSystem.render(sd, this.areaId, this.playerX, this.playerY);
    this.updateSpellBar();
  },

  updateSpellBar() {
    const slots = this.saveData.player.spellSlots || [];
    document.querySelectorAll('.spell-slot').forEach((el, i) => {
      const sid = slots[i];
      if (sid) {
        const sp = getSpell(sid);
        if (sp) { el.textContent = sp.icon; el.title = sp.name + ' (' + sp.cost + 'MP)'; el.style.borderColor = this.saveData.player.mp >= sp.cost ? '#ffd700' : '#884444'; }
      } else { el.textContent = '·'; el.title = 'Empty'; el.style.borderColor = '#555'; }
    });
  },

  flashDamage() {
    const f = document.getElementById('damage-flash');
    if (f) { f.style.opacity = '1'; setTimeout(() => { f.style.opacity = '0'; }, 150); }
    this.shakeTimer = 0.25;
    this.shakeIntensity = 5;
  },

  spawnAmbientParticles() {
    const area = this.areaId;
    if (!area) return;
    const cx = CameraSystem.x || 0, cy = CameraSystem.y || 0;
    const vw = this.width, vh = this.height;
    if (area === 'mosswood' || area === 'enchanted_forest') {
      const sx = cx + Math.random() * vw;
      ParticleSystem.particles.push({
        x: sx, y: cy - 10, vx: -15 - Math.random() * 20, vy: 15 + Math.random() * 15,
        life: 2500 + Math.random() * 2000, maxLife: 4500,
        color: ['#3a7a2a','#4a8a3a','#6aaa4a','#ffffff'][rand(0,3)], size: 2 + Math.random() * 2, decay: 1, gravity: 8
      });
    } else if (area === 'snowy_peaks' || area === 'mountains') {
      const sx = cx + Math.random() * vw;
      ParticleSystem.particles.push({
        x: sx, y: cy - 5, vx: (Math.random() - 0.5) * 8, vy: 10 + Math.random() * 10,
        life: 3000 + Math.random() * 2000, maxLife: 5000,
        color: '#ffffff', size: 1.5 + Math.random() * 1.5, decay: 1, gravity: 4
      });
    } else if (area === 'volcano') {
      const sx = cx + Math.random() * vw;
      ParticleSystem.particles.push({
        x: sx, y: cy + vh + 10, vx: (Math.random() - 0.5) * 25, vy: -(50 + Math.random() * 40),
        life: 1500 + Math.random() * 1500, maxLife: 3000,
        color: Math.random() > 0.5 ? '#ff6622' : '#ffaa44', size: 2 + Math.random() * 2, decay: 0.98, gravity: -15
      });
    } else if (area === 'caves') {
      const sx = cx + Math.random() * vw;
      const sy = cy + Math.random() * vh;
      ParticleSystem.particles.push({
        x: sx, y: sy, vx: (Math.random() - 0.5) * 4, vy: -(2 + Math.random() * 4),
        life: 2000 + Math.random() * 2000, maxLife: 4000,
        color: '#8866ff', size: 1 + Math.random(), decay: 0.99, gravity: 0
      });
    }
  },

  renderWorldMap() {
    const canvas = document.getElementById('map-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, 800, 600);
    const ap = {
      mosswood: { x: 100, y: 450, c: '#3a7a2a' }, enchanted_forest: { x: 250, y: 350, c: '#2a6a2a' },
      wizard_tower: { x: 300, y: 250, c: '#6a5a7a' }, caves: { x: 400, y: 400, c: '#4a3a2a' },
      mountains: { x: 500, y: 300, c: '#6a6a5a' }, snowy_peaks: { x: 600, y: 200, c: '#ccccee' },
      volcano: { x: 650, y: 350, c: '#ff6622' }, ruins: { x: 450, y: 150, c: '#4a4a4a' },
      temple: { x: 350, y: 100, c: '#aa88ff' }
    };
    const conns = [['mosswood','enchanted_forest'],['enchanted_forest','caves'],['enchanted_forest','wizard_tower'],['caves','mountains'],['mountains','snowy_peaks'],['snowy_peaks','volcano'],['volcano','ruins'],['ruins','temple']];
    ctx.strokeStyle = '#404060'; ctx.lineWidth = 2;
    for (const [a,b] of conns) { const p1=ap[a],p2=ap[b]; if(p1&&p2){ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();} }
    ctx.font = '12px monospace'; ctx.textAlign = 'center';
    for (const [area, pos] of Object.entries(ap)) {
      const md = getMapData(area); const name = md ? md.name : area;
      const isCur = area === this.areaId;
      ctx.fillStyle = isCur ? '#ffd700' : pos.c;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, isCur ? 10 : 7, 0, Math.PI * 2); ctx.fill();
      if (isCur) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
      ctx.fillStyle = '#e0d8c0'; ctx.fillText(name, pos.x, pos.y + 20);
    }
  },

  renderQuestTracker() {
    const list = document.getElementById('quest-list');
    list.innerHTML = '';
    const active = QuestSystem.getActive(this.saveData);
    if (active.length === 0) { list.innerHTML = '<p style="color:#888;">No active quests.</p>'; return; }
    for (const q of active) {
      const div = document.createElement('div'); div.className = 'quest-item';
      div.innerHTML = '<div class="quest-name">' + q.name + '</div><div class="quest-desc">' + q.desc + '</div><div class="quest-progress">' + q.objectives.map(o => o.target + ' ' + (o.done ? '✓' : (o.doneCount||0)+'/'+o.count)).join(', ') + '</div>';
      list.appendChild(div);
    }
  },

  renderInventoryTab(tab) {
    const content = document.getElementById('inv-content');
    content.innerHTML = '';
    if (tab === 'items') this.renderItems(content);
    else if (tab === 'equipment') this.renderEquipment(content);
    else if (tab === 'crafting') this.renderCrafting(content);
    else if (tab === 'spells') this.renderSpells(content);
  },

  renderItems(content) {
    const items = InventorySystem.getAllItems(this.saveData).filter(i => i.type === 'consumable' || i.type === 'material' || i.type === 'key' || i.type === 'quest');
    if (items.length === 0) { content.innerHTML = '<p style="color:#888;">No items.</p>'; return; }
    const self = this;
    for (const item of items) {
      const div = document.createElement('div'); div.className = 'inv-item';
      div.innerHTML = '<h4>' + item.icon + ' ' + item.name + ' x' + item.qty + '</h4><p>' + item.desc + '</p><p style="color:#aa0;">Value: ' + item.value + 'g</p>';
      if (item.type === 'consumable') {
        const btn = document.createElement('button');
        btn.textContent = 'Use'; btn.style.cssText = 'background:#448844;border:1px solid #66aa66;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;font-family:inherit;';
        btn.onclick = () => {
          if (item.healHp) PlayerSystem.heal(self.saveData, item.healHp);
          if (item.healMp) PlayerSystem.restoreMp(self.saveData, item.healMp);
          InventorySystem.removeItem(self.saveData, item.id, 1);
          AudioSystem.playSfx('heal');
          showToast('Used ' + item.name, '#44ff44');
          self.updateHUD(); self.renderItems(content);
        };
        div.appendChild(btn);
      }
      content.appendChild(div);
    }
  },

  renderEquipment(content) {
    const eq = this.saveData.player.equipped;
    content.innerHTML = '<h3 style="color:#a0d0ff;margin-bottom:8px;">Equipped</h3>';
    const self = this;
    for (const slot of ['weapon', 'armor', 'accessory']) {
      const id = eq[slot]; const item = id ? getItem(id) : null;
      const div = document.createElement('div'); div.className = 'inv-item';
      if (item) {
        div.innerHTML = '<h4>' + item.icon + ' ' + item.name + '</h4><p>' + slot + ' - ' + item.desc + '</p>';
        const btn = document.createElement('button'); btn.textContent = 'Unequip';
        btn.style.cssText = 'background:#884444;border:1px solid #aa6666;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;font-family:inherit;';
        btn.onclick = () => { InventorySystem.unequip(self.saveData, slot); showToast('Unequipped ' + item.name, '#ffaa44'); self.renderEquipment(content); self.updateHUD(); };
        div.appendChild(btn);
      } else div.innerHTML = '<h4 style="color:#666;">Empty ' + slot + '</h4>';
      content.appendChild(div);
    }
    content.innerHTML += '<h3 style="color:#a0d0ff;margin:8px 0;">Inventory</h3>';
    const equipItems = InventorySystem.getAllItems(this.saveData).filter(i => i.type === 'weapon' || i.type === 'armor' || i.type === 'accessory');
    if (equipItems.length === 0) { content.innerHTML += '<p style="color:#888;">No equipment.</p>'; return; }
    for (const item of equipItems) {
      const div = document.createElement('div'); div.className = 'inv-item';
      div.innerHTML = '<h4>' + item.icon + ' ' + item.name + ' x' + item.qty + '</h4><p>' + item.desc + '</p>';
      const btn = document.createElement('button'); btn.textContent = 'Equip';
      btn.style.cssText = 'background:#4466aa;border:1px solid #6688cc;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;font-family:inherit;';
      btn.onclick = () => { InventorySystem.equip(self.saveData, item.id); AudioSystem.playSfx('coin'); showToast('Equipped ' + item.name, '#80ff80'); self.renderEquipment(content); self.updateHUD(); };
      div.appendChild(btn);
      content.appendChild(div);
    }
  },

  renderCrafting(content) {
    content.innerHTML = '<h3 style="color:#a0d0ff;margin-bottom:8px;">Crafting</h3>';
    const self = this;
    for (const recipe of CRAFTING_RECIPES) {
      const result = getItem(recipe.result); if (!result) continue;
      const can = canCraft(recipe, this.saveData.player.inventory);
      const div = document.createElement('div'); div.className = 'inv-item';
      div.style.opacity = can ? '1' : '0.5';
      div.innerHTML = '<h4>' + recipe.icon + ' ' + recipe.name + '</h4><p>' + result.desc + '</p><p style="color:#aa0;">' +
        Object.entries(recipe.materials).map(([mid, qty]) => { const m = getItem(mid); const h = self.saveData.player.inventory[mid] || 0; return (m?m.name:mid) + ' ' + h + '/' + qty; }).join(', ') + '</p>';
      if (can) {
        const btn = document.createElement('button'); btn.textContent = 'Craft';
        btn.style.cssText = 'background:#668844;border:1px solid #88aa66;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;font-family:inherit;';
        btn.onclick = () => { if (CraftingSystem.craft(self.saveData, recipe.id)) { AudioSystem.playSfx('coin'); showToast('Crafted ' + result.name + '!', '#80ff80'); self.renderCrafting(content); self.updateHUD(); } };
        div.appendChild(btn);
      }
      content.appendChild(div);
    }
  },

  renderSpells(content) {
    content.innerHTML = '<h3 style="color:#a0d0ff;margin-bottom:8px;">Spells</h3>';
    const unlocked = this.saveData.player.unlockedSpells || [];
    const slots = this.saveData.player.spellSlots || [];
    const self = this;
    for (const sid of unlocked) {
      const sp = getSpell(sid); if (!sp) continue;
      const slotted = slots.includes(sid);
      const div = document.createElement('div'); div.className = 'inv-item';
      div.innerHTML = '<h4>' + sp.icon + ' ' + sp.name + '</h4><p>' + sp.desc + '</p><p style="color:#88f;">MP: ' + sp.cost + ' | DMG: ' + sp.damage + '</p>';
      if (!slotted) {
        const btn = document.createElement('button'); btn.textContent = 'Add to Bar';
        btn.style.cssText = 'background:#4466aa;border:1px solid #6688cc;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;font-family:inherit;';
        btn.onclick = () => { const es = slots.indexOf(null); if (es >= 0) { self.saveData.player.spellSlots[es] = sid; showToast(sp.name + ' added', '#80ff80'); self.renderSpells(content); self.updateSpellBar(); } else showToast('No empty slots!', '#ff4444'); };
        div.appendChild(btn);
      } else {
        const btn = document.createElement('button'); btn.textContent = 'Remove';
        btn.style.cssText = 'background:#884444;border:1px solid #aa6666;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;font-family:inherit;';
        btn.onclick = () => { const idx = slots.indexOf(sid); if (idx >= 0) { self.saveData.player.spellSlots[idx] = null; self.renderSpells(content); self.updateSpellBar(); } };
        div.appendChild(btn);
      }
      content.appendChild(div);
    }
  },

  handleCombatAction(action) {
    const enemy = this.combatEnemy;
    if (!enemy) return;
    const log = document.getElementById('combat-log');
    const hpBar = document.getElementById('enemy-hp-bar');
    switch (action) {
      case 'attack': {
        const r = CombatSystem.playerAttack(this.saveData, enemy);
        log.textContent = 'You attack for ' + r.damage + '!'; AudioSystem.playSfx('hit');
        break;
      }
      case 'spell': {
        const ss = document.getElementById('spell-select');
        const sl = document.getElementById('spell-list');
        if (ss.classList.contains('hidden')) {
          sl.innerHTML = '';
          const slots = this.saveData.player.spellSlots || [];
          for (const sid of slots) {
            if (!sid) continue;
            const sp = getSpell(sid); if (!sp) continue;
            const btn = document.createElement('button'); btn.className = 'spell-btn';
            btn.textContent = sp.icon + ' ' + sp.name + ' (' + sp.cost + 'MP)';
            btn.onclick = () => {
              if (this.saveData.player.mp < sp.cost) { log.textContent = 'Not enough MP!'; return; }
              const r2 = CombatSystem.playerSpell(this.saveData, enemy, sid);
              if (r2 && r2.type !== 'heal') { log.textContent = sp.name + ' deals ' + r2.damage + '!'; AudioSystem.playSfx('spell'); }
              else if (r2 && r2.type === 'heal') { log.textContent = 'Healed ' + Math.abs(r2.damage) + '!'; AudioSystem.playSfx('heal'); }
              ss.classList.add('hidden');
              this.processCombatRound(enemy);
            };
            sl.appendChild(btn);
          }
          ss.classList.remove('hidden'); return;
        }
        ss.classList.add('hidden'); return;
      }
      case 'defend': { CombatSystem.playerDefend(this.saveData); log.textContent = 'You brace!'; break; }
      case 'flee': {
        if (Math.random() < 0.6) { log.textContent = 'Fled!'; document.getElementById('combat-hud').classList.add('hidden'); document.getElementById('spell-select').classList.add('hidden'); this.combatEnemy = null; return; }
        log.textContent = 'Flee failed!'; break;
      }
    }
    this.processCombatRound(enemy);
  },

  processCombatRound(enemy) {
    const log = document.getElementById('combat-log');
    const hpBar = document.getElementById('enemy-hp-bar');
    if (enemy.currentHp <= 0) {
      const r = CombatSystem.getLoot(this.saveData, enemy);
      enemy.isDead = true;
      const ex = (this.combatEnemy ? this.combatEnemy.x : this.playerX) * this.tileSize + 16;
      const ey = (this.combatEnemy ? this.combatEnemy.y : this.playerY) * this.tileSize + 16;
      ParticleSystem.emitBurst(ex, ey, ['#ff8844', '#ffcc44', '#ffffff', '#ff6644'], 25, 100);
      log.textContent = 'Victory! +' + r.xp + ' XP, +' + r.gold + ' Gold';
      QuestSystem.onKill(this.saveData, enemy.id);
      AudioSystem.playSfx('coin');
      showToast('Defeated ' + enemy.name + '!', '#ffd700');
      setTimeout(() => { document.getElementById('combat-hud').classList.add('hidden'); document.getElementById('spell-select').classList.add('hidden'); this.combatEnemy = null; this.updateHUD(); }, 1500);
      return;
    }
    const er = CombatSystem.enemyTurn(this.saveData, enemy);
    if (er.damage > 0) {
      log.textContent += '\n' + enemy.name + ' hits for ' + er.damage + '!';
      AudioSystem.playSfx('hit');
      if (er.isDead) {
        PlayerSystem.revive(this.saveData);
        showToast('Defeated! Back to village.', '#ff4444');
        this.saveData.player.area = 'mosswood'; this.saveData.player.x = 3; this.saveData.player.y = 13;
        document.getElementById('combat-hud').classList.add('hidden'); document.getElementById('spell-select').classList.add('hidden');
        this.combatEnemy = null;
        this.changeArea('mosswood');
        return;
      }
    }
    hpBar.innerHTML = '<div style="width:' + Math.max(0, enemy.currentHp / enemy.maxHp * 100) + '%"></div>';
    this.updateHUD();
    this.flashDamage();
  }
};