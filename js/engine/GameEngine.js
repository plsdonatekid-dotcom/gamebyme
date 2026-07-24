const GameEngine = {
  canvas: null,
  ctx: null,
  state: 'title',
  keys: {},
  keysJustDown: {},
  prevKeys: {},
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  lastTime: 0,
  saveData: null,
  areaId: 'mosswood',
  mapDef: null,
  playerX: 3, playerY: 13,
  pixelX: 0, pixelY: 0,
  tileSize: TILE_SIZE,
  isMoving: false,
  moveTarget: null,
  moveSpeed: BASE_MOVE_SPEED,
  playerSprite: null,
  enemies: [],
  npcs: [],
  chests: [],
  waterTiles: [],
  lavaTiles: [],
  combatEnemy: null,
  spellSlots: ['magic_bolt', null, null, null, null],
  lavaTimer: 0,
  interactCooldown: 0,

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.imageRendering = 'pixelated';
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  },

  onKeyDown(e) {
    const code = e.keyCode;
    if (!this.keys[code]) this.keysJustDown[code] = true;
    this.keys[code] = true;
    if ([KEYS.W, KEYS.A, KEYS.S, KEYS.D, KEYS.SPACE, KEYS.E, KEYS.I, KEYS.M, KEYS.Q, KEYS.ESC, KEYS.ONE, KEYS.TWO, KEYS.THREE, KEYS.FOUR, KEYS.FIVE].includes(code)) {
      e.preventDefault();
    }
  },

  onKeyUp(e) {
    this.keys[e.keyCode] = false;
  },

  isKeyDown(code) { return !!this.keys[code]; },
  justDown(code) {
    if (this.keysJustDown[code]) {
      this.keysJustDown[code] = false;
      return true;
    }
    return false;
  },

  onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width * this.width;
    const my = (e.clientY - rect.top) / rect.height * this.height;
    this.mouseX = mx;
    this.mouseY = my;
    this.mouseClicked = true;
  },

  loop(time) {
    try {
      const dt = Math.min((time - this.lastTime) / 1000, 0.05);
      this.lastTime = time;
      this.update(dt);
      this.render();
    } catch (e) {
      this.renderError(e);
    }
    for (const k in this.keysJustDown) this.keysJustDown[k] = false;
    this.mouseClicked = false;
    requestAnimationFrame((t) => this.loop(t));
  },

  update(dt) {
    switch (this.state) {
      case 'title': this.updateTitle(dt); break;
      case 'playing': this.updatePlaying(dt); break;
      case 'combat': this.updateCombat(dt); break;
      case 'dialog': this.updateDialog(dt); break;
    }
  },

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, this.width, this.height);
    switch (this.state) {
      case 'title': this.renderTitle(ctx); break;
      case 'playing': this.renderPlaying(ctx); break;
    }
  },

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
    showToast(`Exploring ${this.mapDef.name}`, '#a0d0ff');
    this.updateHUD();
    this.updateSpellBar();
    this.autoSaveTimer = setInterval(() => { saveGame(this.saveData); }, 30000);
  },

  initArea() {
    WorldSystem_init(this.areaId);
    WorldSystem_initChests(this.areaId, this.saveData);
    this.enemies = worldEnemies;
    this.chests = worldChests;
    this.waterTiles = [];
    this.lavaTiles = [];
    const mapDef = this.mapDef;
    if (mapDef) {
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
    }
  },

  // ---- Title State ----
  updateTitle(dt) {},

  renderError(e) {
    console.error('Game error:', e);
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.save();
    ctx.fillStyle = '#1a0a0a';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#ff4444';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    let y = 40;
    ctx.fillText('ERROR: ' + (e.message || e), 20, y);
    y += 25;
    ctx.fillText('Check console (F12) for full trace.', 20, y);
    y += 25;
    ctx.fillStyle = '#ffaa44';
    ctx.fillText('Stack:', 20, y);
    y += 20;
    const stack = (e.stack || '').split('\n').slice(0, 10);
    for (const line of stack) {
      ctx.fillStyle = '#cccc88';
      ctx.font = '11px monospace';
      ctx.fillText(line.trim(), 20, y);
      y += 16;
    }
    ctx.restore();
  },

  renderTitle(ctx) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    ctx.fillStyle = '#80d0ff';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#40a0ff';
    ctx.shadowBlur = 20;
    ctx.fillText('Mythos Isles', cx, cy - 80);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#a0a0c0';
    ctx.font = '16px monospace';
    ctx.fillText('A Fantasy Adventure', cx, cy - 40);
    ctx.fillStyle = '#e0e0ff';
    ctx.font = '18px monospace';
    ctx.fillText('[ Begin Journey ]', cx, cy + 20);
    if (hasSave()) {
      ctx.fillText('[ Continue ]', cx, cy + 60);
    }
    ctx.fillStyle = '#606080';
    ctx.font = '12px monospace';
    ctx.fillText('WASD: Move  |  E: Interact  |  I: Inventory  |  M: Map  |  Q: Quests  |  1-5: Spells', cx, this.height - 30);
  },

  handleTitleClick() {
    this.startGame(true);
  },

  // ---- Playing State ----
  updatePlaying(dt) {
    this.handleMovement(dt);
    this.updateEnemies(dt);
    this.handleInput();
    this.updateAutoTileAnim(dt);
    CameraSystem.follow(this.pixelX + this.tileSize / 2, this.pixelY + this.tileSize / 2);
    CameraSystem.update(dt);
    ParticleSystem.update(dt);
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
        this.pixelX = targetPx;
        this.pixelY = targetPy;
        this.playerX = this.moveTarget.x;
        this.playerY = this.moveTarget.y;
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
      const tx = this.playerX + dx;
      const ty = this.playerY + dy;
      if (!isSolid(this.areaId, tx, ty) && !this.enemyAt(tx, ty)) {
        this.isMoving = true;
        this.moveTarget = { x: tx, y: ty };
      } else if (this.enemyAt(tx, ty)) {
        this.startCombat(tx, ty);
      }
    }
  },

  enemyAt(tx, ty) {
    return this.enemies.some(e => e.x === tx && e.y === ty && !e.isDead);
  },

  updateEnemies(dt) {
    WorldSystem_updateEnemies(dt, this.saveData, this.areaId, this.playerX, this.playerY);
    this.enemies = worldEnemies;
  },

  handleInput() {
    if (this.justDown(KEYS.SPACE) || this.justDown(KEYS.E)) {
      this.interact();
    }
    if (this.justDown(KEYS.I)) {
      document.getElementById('inventory-screen').classList.toggle('hidden');
      this.renderInventoryTab('items');
    }
    if (this.justDown(KEYS.M)) {
      const mapEl = document.getElementById('world-map');
      mapEl.classList.toggle('hidden');
      if (!mapEl.classList.contains('hidden')) this.renderWorldMap();
    }
    if (this.justDown(KEYS.Q)) {
      const qEl = document.getElementById('quest-tracker');
      qEl.classList.toggle('hidden');
      if (!qEl.classList.contains('hidden')) this.renderQuestTracker();
    }
    for (let i = 0; i < 5; i++) {
      const keyCode = [KEYS.ONE, KEYS.TWO, KEYS.THREE, KEYS.FOUR, KEYS.FIVE][i];
      if (this.justDown(keyCode)) this.useSpellSlot(i);
    }
    if (this.mouseClicked) {
      this.handleCanvasClick();
    }
  },

  handleCanvasClick() {
    const worldMap = document.getElementById('world-map');
    const invScreen = document.getElementById('inventory-screen');
    const questTracker = document.getElementById('quest-tracker');
    if (!worldMap.classList.contains('hidden')) {
      worldMap.classList.add('hidden');
      return;
    }
    if (!invScreen.classList.contains('hidden')) {
      invScreen.classList.add('hidden');
      return;
    }
    if (!questTracker.classList.contains('hidden')) {
      questTracker.classList.add('hidden');
      return;
    }
  },

  updateAutoTileAnim(dt) {
    this.animTime = (this.animTime || 0) + dt;
  },

  interact() {
    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const tx = this.playerX + dx;
      const ty = this.playerY + dy;
      const mapDef = this.mapDef;
      const npcIds = mapDef ? mapDef.npcs || [] : [];
      for (const npcId of npcIds) {
        const npcDef = getNpc(npcId);
        if (!npcDef) continue;
        let foundNpc = false;
        for (let ny = 0; ny < (mapDef ? mapDef.tiles.length : 0) && !foundNpc; ny++) {
          for (let nx = 0; nx < (mapDef ? mapDef.tiles[ny] ? mapDef.tiles[ny].length : 0 : 0); nx++) {
            if (!isSolid(this.areaId, nx, ny) && this.isNpcSpot(npcId, nx, ny)) {
              if (nx === tx && ny === ty) {
                this.openDialog(npcId);
                return;
              }
            }
          }
        }
      }
      const chest = WorldSystem_getChestAt(tx, ty);
      if (chest && !chest.opened) {
        const result = WorldSystem_openChest(this.saveData, tx, ty);
        if (result) {
          const lootText = result.loot.map(l => `${getItem(l.id)?.name || l.id} x${l.qty}`).join(', ');
          showToast(`Chest opened! ${lootText} +${result.gold} Gold`, '#ffd700');
          return;
        }
      }
      const tile = getTileAt(this.areaId, tx, ty);
      if (tile && tile.exitTo) {
        this.changeArea(tile.exitTo);
        return;
      }
    }
  },

  isNpcSpot(npcId, nx, ny) {
    const mapDef = this.mapDef;
    if (!mapDef) return false;
    const npcIndex = (mapDef.npcs || []).indexOf(npcId);
    if (npcIndex < 0) return false;
    const seed = npcId.charCodeAt(0) || npcIndex;
    const rng = rngSeed(seed + 12345);
    let spotX = Math.floor(rng() * (mapDef.width - 2)) + 1;
    let spotY = Math.floor(rng() * (mapDef.tiles.length - 2)) + 1;
    let attempts = 0;
    while (isSolid(this.areaId, spotX, spotY) && attempts < 20) {
      spotX = Math.floor(rng() * (mapDef.width - 2)) + 1;
      spotY = Math.floor(rng() * (mapDef.tiles.length - 2)) + 1;
      attempts++;
    }
    return spotX === nx && spotY === ny;
  },

  openDialog(npcId) {
    const npcDef = getNpc(npcId);
    if (!npcDef) return;
    const dialogBox = document.getElementById('dialog-box');
    const dialogText = document.getElementById('dialog-text');
    const dialogChoices = document.getElementById('dialog-choices');
    dialogBox.classList.remove('hidden');
    const dialogues = npcDef.dialogues;
    const firstKey = this.saveData.player.completedQuests.includes('awakening') ? 'default' : 'first';
    const dialog = dialogues[firstKey] || dialogues.default || dialogues.first;
    if (!dialog) return;
    const self = this;
    dialogText.textContent = dialog.text;
    dialogChoices.innerHTML = '';
    for (const choice of (dialog.choices || [])) {
      const btn = document.createElement('button');
      btn.textContent = choice.text;
      btn.onclick = () => {
        if (choice.action === 'startQuest_awakening') { QuestSystem.startQuest(self.saveData, 'awakening'); showToast('Quest started: The Awakening', '#80ff80'); }
        if (choice.action === 'startQuest_forest_corruption') { QuestSystem.startQuest(self.saveData, 'forest_corruption'); showToast('Quest started: Forest Corruption', '#80ff80'); }
        if (choice.action === 'startQuest_volcano_trial') { QuestSystem.startQuest(self.saveData, 'volcano_trial'); showToast('Quest started: Trial of Flame', '#80ff80'); }
        if (choice.action === 'openShop') { self.openShop(); dialogBox.classList.add('hidden'); return; }
        if (choice.action === 'openCrafting') { self.openCraftingUI(); dialogBox.classList.add('hidden'); return; }
        if (choice.next) {
          const nextDialog = dialogues[choice.next];
          if (nextDialog) {
            dialogText.textContent = nextDialog.text;
            dialogChoices.innerHTML = '';
            for (const c of (nextDialog.choices || [])) {
              const b = document.createElement('button');
              b.textContent = c.text;
              b.onclick = () => { if (c.action === 'openShop' || c.action === 'openCrafting') { self.openShop(); if (c.action === 'openCrafting') self.openCraftingUI(); } dialogBox.classList.add('hidden'); };
              dialogChoices.appendChild(b);
            }
          }
        } else { dialogBox.classList.add('hidden'); }
      };
      dialogChoices.appendChild(btn);
    }
    QuestSystem.onTalk(this.saveData, npcId);
  },

  openShop() {
    const inv = document.getElementById('inventory-screen');
    const content = document.getElementById('inv-content');
    inv.classList.remove('hidden');
    content.innerHTML = '<h3 style="color:#ffd700;margin-bottom:10px;">Shop</h3>';
    const shopItems = ['health_potion', 'mana_potion', 'great_health_potion', 'great_mana_potion', 'wooden_staff', 'cloth_robe'];
    for (const itemId of shopItems) {
      const item = getItem(itemId);
      if (!item) continue;
      const div = document.createElement('div');
      div.className = 'inv-item';
      div.innerHTML = `<h4>${item.icon} ${item.name}</h4><p>${item.desc}</p><p>Value: ${item.value}g</p>`;
      const buyBtn = document.createElement('button');
      buyBtn.textContent = `Buy (${item.value}g)`;
      buyBtn.style.cssText = 'background:#4466aa;border:1px solid #6688cc;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;font-family:inherit;border-radius:3px;';
      buyBtn.onclick = () => {
        if (this.saveData.player.gold >= item.value) {
          this.saveData.player.gold -= item.value;
          InventorySystem.addItem(this.saveData, itemId, 1);
          AudioSystem.playSfx('coin');
          showToast(`Bought ${item.name}`, '#ffd700');
          this.updateHUD();
        } else { showToast('Not enough gold!', '#ff4444'); }
      };
      div.appendChild(buyBtn);
      content.appendChild(div);
    }
  },

  openCraftingUI() {
    const inv = document.getElementById('inventory-screen');
    const content = document.getElementById('inv-content');
    inv.classList.remove('hidden');
    this.renderCraftingTab(content);
  },

  startCombat(tx, ty) {
    const enemy = WorldSystem_getEnemyAt(tx, ty);
    if (!enemy) return;
    this.combatEnemy = enemy;
    document.getElementById('combat-hud').classList.remove('hidden');
    document.getElementById('enemy-name').textContent = `${enemy.icon} ${enemy.name} (Lv${enemy.level})`;
    document.getElementById('enemy-hp-bar').innerHTML = `<div style="width:100%"></div>`;
    document.getElementById('enemy-name').style.color = enemy.isBoss ? '#ff4444' : '#ffaa44';
    document.getElementById('combat-log').textContent = `${enemy.name} appears!`;
    if (enemy.isBoss) AudioSystem.playSfx('boss');
  },

  // ---- Render ----
  renderPlaying(ctx) {
    const cx = CameraSystem.x;
    const cy = CameraSystem.y;
    this.renderTiles(ctx, cx, cy);
    this.renderChests(ctx, cx, cy);
    this.renderEnemies(ctx, cx, cy);
    this.renderPlayer(ctx, cx, cy);
    ParticleSystem.render(ctx, cx, cy);
  },

  renderTiles(ctx, cx, cy) {
    const mapDef = this.mapDef;
    if (!mapDef) return;
    const ts = this.tileSize;
    for (let y = 0; y < mapDef.tiles.length; y++) {
      const row = mapDef.tiles[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        const td = mapDef.tileset[ch];
        if (!td) continue;
        const px = x * ts - cx;
        const py = y * ts - cy;
        if (px < -ts || px > this.width + ts || py < -ts || py > this.height + ts) continue;
        ctx.fillStyle = '#' + td.color.toString(16).padStart(6, '0');
        ctx.fillRect(px, py, ts, ts);
        if (td.type === 'grass' && (x + y) % 2 === 0) {
          ctx.fillStyle = 'rgba(68,136,58,0.5)';
          ctx.fillRect(px, py, ts, 2);
        }
        if (td.type === 'flower') {
          ctx.fillStyle = 'rgba(170,136,255,0.8)';
          ctx.fillRect(px + 12, py + 8, 8, 8);
        }
        if (td.type === 'shrine') {
          ctx.fillStyle = 'rgba(136,102,255,0.6)';
          ctx.fillRect(px + 4, py, ts - 8, ts);
          ctx.fillStyle = 'rgba(170,136,255,0.4)';
          ctx.fillRect(px + 8, py + 4, ts - 16, ts - 8);
        }
        if (td.type === 'altar') {
          ctx.fillStyle = 'rgba(136,102,255,0.8)';
          ctx.fillRect(px + 6, py + 6, 20, 20);
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fillRect(px + 10, py + 10, 12, 12);
        }
        if (td.type === 'exit') {
          ctx.fillStyle = 'rgba(68,102,170,0.4)';
          ctx.fillRect(px + 8, py + 8, ts - 16, ts - 16);
        }
      }
    }
    if (this.animTime !== undefined) {
      const t = this.animTime * 2;
      for (const wt of this.waterTiles) {
        const offset = Math.sin(t + wt.x * 0.5 + wt.y * 0.3) * 3;
        ctx.fillStyle = 'rgba(74,138,186,0.3)';
        ctx.fillRect(wt.x * ts + offset - cx, wt.y * ts + 8 - cy, ts, 4);
        ctx.fillStyle = 'rgba(90,154,202,0.2)';
        ctx.fillRect(wt.x * ts - offset - cx, wt.y * ts + 18 - cy, ts, 3);
      }
      for (const lt of this.lavaTiles) {
        const offset = Math.sin(t * 0.7 + lt.x * 0.7 + lt.y * 0.5) * 4;
        ctx.fillStyle = 'rgba(255,102,34,0.5)';
        ctx.fillRect(lt.x * ts + offset - cx, lt.y * ts + 6 - cy, ts, 5);
        ctx.fillStyle = 'rgba(255,170,68,0.3)';
        ctx.fillRect(lt.x * ts - offset - cx, lt.y * ts + 18 - cy, ts, 3);
      }
    }
  },

  renderPlayer(ctx, cx, cy) {
    const px = this.pixelX - cx;
    const py = this.pixelY - cy;
    const ts = this.tileSize;
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(px + 4, py + 2, ts - 8, 6);
    ctx.fillStyle = '#66aaff';
    ctx.fillRect(px + 6, py + 8, ts - 12, ts - 12);
    ctx.fillStyle = '#ffdd88';
    ctx.fillRect(px + 8, py + 4, 6, 6);
    ctx.fillRect(px + ts - 14, py + 4, 6, 6);
  },

  renderEnemies(ctx, cx, cy) {
    const ts = this.tileSize;
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;
      const px = enemy.x * ts - cx;
      const py = enemy.y * ts - cy;
      if (px < -ts || px > this.width + ts || py < -ts || py > this.height + ts) continue;
      const size = ts - 4;
      ctx.fillStyle = enemy.aggro ? '#ff4444' : '#ff8844';
      ctx.fillRect(px + 2, py + 2, size, size);
      ctx.fillStyle = enemy.isBoss ? '#cc2222' : '#cc6622';
      ctx.fillRect(px + 4, py + 4, size - 4, size - 4);
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(enemy.icon || '?', px + ts / 2, py + ts / 2 + 6);
    }
  },

  renderChests(ctx, cx, cy) {
    const ts = this.tileSize;
    for (const chest of this.chests) {
      const px = chest.x * ts - cx;
      const py = chest.y * ts - cy;
      if (px < -ts || px > this.width + ts || py < -ts || py > this.height + ts) continue;
      ctx.fillStyle = chest.opened ? '#6a4a2a' : '#cc9933';
      ctx.fillRect(px + 4, py + 2, ts - 8, ts - 4);
      ctx.fillStyle = chest.opened ? '#4a3a1a' : '#ffdd44';
      ctx.fillRect(px + 6, py, ts - 12, 6);
      if (!chest.opened) {
        ctx.fillStyle = '#ffd700';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('?', px + ts / 2, py + ts / 2 + 5);
      }
    }
  },

  // ---- Area Transitions ----
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
        showToast('Lava burns! -5 HP', '#ff4400');
        this.updateHUD();
      }
    }
  },

  changeArea(newArea) {
    const oldArea = this.areaId;
    this.areaId = newArea;
    this.mapDef = getMapData(newArea);
    if (!this.mapDef) { this.areaId = 'mosswood'; this.mapDef = getMapData('mosswood'); }
    this.saveData.player.area = this.areaId;
    for (const [ch, td] of Object.entries(this.mapDef.tileset)) {
      if (td.exitTo === oldArea) {
        this.playerX = td.exitX || 3;
        this.playerY = td.exitY || 3;
        this.pixelX = this.playerX * this.tileSize;
        this.pixelY = this.playerY * this.tileSize;
        break;
      }
    }
    this.saveData.player.x = this.playerX;
    this.saveData.player.y = this.playerY;
    CameraSystem.init(this.mapDef.width * this.tileSize, this.mapDef.height * this.tileSize);
    this.initArea();
    document.getElementById('area-name').textContent = this.mapDef.name;
    showToast(`Entered ${this.mapDef.name}`, '#a0d0ff');
    this.updateHUD();
    saveGame(this.saveData);
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
    const matk = PlayerSystem.getTotalMatk(this.saveData);
    const damage = Math.floor(spell.damage + matk * 0.5);
    if (spell.effect === 'heal') {
      PlayerSystem.heal(this.saveData, Math.abs(spell.damage));
      showToast(`Cast ${spell.name}: +${Math.abs(spell.damage)} HP`, '#44ff44');
      this.updateHUD();
      return;
    }
    if (spell.effect === 'shield') {
      this.saveData.player.shield = (this.saveData.player.shield || 0) + Math.floor(matk * 0.5) + 10;
      showToast(`Cast ${spell.name}: Shield up!`, '#88aaff');
      this.updateHUD();
      return;
    }
    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const tx = this.playerX + dx;
      const ty = this.playerY + dy;
      const enemy = WorldSystem_getEnemyAt(tx, ty);
      if (enemy) {
        const weakness = getWeakness(enemy.id, spell.type) || 1;
        const finalDmg = Math.floor(damage * weakness);
        enemy.currentHp -= finalDmg;
        showToast(`${spell.name} hits ${enemy.name} for ${finalDmg}!`, '#ff8844');
        if (enemy.currentHp <= 0) {
          enemy.isDead = true;
          const result = CombatSystem.getLoot(this.saveData, enemy);
          showToast(`Defeated ${enemy.name}! +${result.xp} XP, +${result.gold} Gold`, '#ffd700');
          QuestSystem.onKill(this.saveData, enemy.id);
        }
        break;
      }
    }
    ParticleSystem.emitBurst(this.pixelX + this.tileSize / 2, this.pixelY + this.tileSize / 2, ['#ff4444', '#ff8844', '#ffcc44'], 12, 80);
    this.updateHUD();
  },

  updateHUD() {
    const sd = this.saveData;
    if (!sd) return;
    const hp = sd.player.hp;
    const maxHp = PlayerSystem.getMaxHp(sd);
    const mp = sd.player.mp;
    const maxMp = PlayerSystem.getMaxMp(sd);
    const xp = sd.player.xp;
    const xpToNext = sd.player.xpToNext;
    const level = sd.player.level;
    const gold = sd.player.gold;
    document.getElementById('hp-bar').style.width = `${(hp / maxHp) * 100}%`;
    document.getElementById('hp-text').textContent = `${Math.floor(hp)}/${maxHp}`;
    document.getElementById('mp-bar').style.width = `${(mp / maxMp) * 100}%`;
    document.getElementById('mp-text').textContent = `${Math.floor(mp)}/${maxMp}`;
    document.getElementById('xp-bar').style.width = `${(xp / xpToNext) * 100}%`;
    document.getElementById('xp-text').textContent = `Lv ${level}`;
    document.getElementById('gold-display').innerHTML = `&#9733; ${gold}`;
    MinimapSystem.render(sd, this.areaId, this.playerX, this.playerY);
    this.updateSpellBar();
  },

  updateSpellBar() {
    const slots = this.saveData.player.spellSlots || [];
    const slotEls = document.querySelectorAll('.spell-slot');
    slotEls.forEach((el, i) => {
      const spellId = slots[i];
      if (spellId) {
        const spell = getSpell(spellId);
        if (spell) {
          el.textContent = spell.icon || '?';
          el.title = `${spell.name} (${spell.cost} MP, ${spell.damage} DMG)`;
          el.style.borderColor = this.saveData.player.mp >= spell.cost ? '#ffd700' : '#884444';
        }
      } else {
        el.textContent = '·';
        el.title = 'Empty slot';
        el.style.borderColor = '#555';
      }
    });
  },

  flashDamage() {
    const flash = document.getElementById('damage-flash');
    if (flash) { flash.style.opacity = '1'; setTimeout(() => { flash.style.opacity = '0'; }, 150); }
  },

  renderWorldMap() {
    const canvas = document.getElementById('map-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, w, h);
    const ap = {
      mosswood: { x: 100, y: 450, c: '#3a7a2a' }, enchanted_forest: { x: 250, y: 350, c: '#2a6a2a' },
      wizard_tower: { x: 300, y: 250, c: '#6a5a7a' }, caves: { x: 400, y: 400, c: '#4a3a2a' },
      mountains: { x: 500, y: 300, c: '#6a6a5a' }, snowy_peaks: { x: 600, y: 200, c: '#ccccee' },
      volcano: { x: 650, y: 350, c: '#ff6622' }, ruins: { x: 450, y: 150, c: '#4a4a4a' },
      temple: { x: 350, y: 100, c: '#aa88ff' },
    };
    const conns = [['mosswood','enchanted_forest'],['enchanted_forest','caves'],['enchanted_forest','wizard_tower'],['caves','mountains'],['mountains','snowy_peaks'],['snowy_peaks','volcano'],['volcano','ruins'],['ruins','temple']];
    ctx.strokeStyle = '#404060'; ctx.lineWidth = 2;
    for (const [a, b] of conns) { const p1 = ap[a], p2 = ap[b]; if (p1 && p2) { ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); } }
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
    for (const quest of active) {
      const div = document.createElement('div'); div.className = 'quest-item';
      const progressText = quest.objectives.map(o => `${o.target} ${o.done ? '✓' : `${o.doneCount || 0}/${o.count}`}`).join(', ');
      div.innerHTML = `<div class="quest-name">${quest.name}</div><div class="quest-desc">${quest.desc}</div><div class="quest-progress">${progressText}</div>`;
      list.appendChild(div);
    }
  },

  renderInventoryTab(tab) {
    const content = document.getElementById('inv-content');
    content.innerHTML = '';
    if (tab === 'items') this.renderItems(content);
    else if (tab === 'equipment') this.renderEquipment(content);
    else if (tab === 'crafting') this.renderCraftingTab(content);
    else if (tab === 'spells') this.renderSpells(content);
  },

  renderItems(content) {
    const items = InventorySystem.getAllItems(this.saveData).filter(i => i.type === 'consumable' || i.type === 'material' || i.type === 'key' || i.type === 'quest');
    if (items.length === 0) { content.innerHTML = '<p style="color:#888;">No items.</p>'; return; }
    for (const item of items) {
      const div = document.createElement('div'); div.className = 'inv-item';
      div.innerHTML = `<h4>${item.icon} ${item.name} x${item.qty}</h4><p>${item.desc}</p><p style="color:#aa0;">Value: ${item.value}g</p>`;
      if (item.type === 'consumable') {
        const btn = document.createElement('button');
        btn.textContent = 'Use'; btn.style.cssText = 'background:#448844;border:1px solid #66aa66;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;';
        btn.onclick = () => {
          if (item.healHp) PlayerSystem.heal(this.saveData, item.healHp);
          if (item.healMp) PlayerSystem.restoreMp(this.saveData, item.healMp);
          InventorySystem.removeItem(this.saveData, item.id, 1);
          AudioSystem.playSfx('heal');
          showToast(`Used ${item.name}`, '#44ff44');
          this.updateHUD(); this.renderItems(content);
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
        div.innerHTML = `<h4>${item.icon} ${item.name}</h4><p>${slot} - ${item.desc}</p>`;
        const btn = document.createElement('button'); btn.textContent = 'Unequip';
        btn.style.cssText = 'background:#884444;border:1px solid #aa6666;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;';
        btn.onclick = () => { InventorySystem.unequip(self.saveData, slot); showToast(`Unequipped ${item.name}`, '#ffaa44'); self.renderEquipment(content); self.updateHUD(); };
        div.appendChild(btn);
      } else { div.innerHTML = `<h4 style="color:#666;">Empty ${slot} slot</h4>`; }
      content.appendChild(div);
    }
    content.innerHTML += '<h3 style="color:#a0d0ff;margin:8px 0;">Inventory</h3>';
    const equipItems = InventorySystem.getAllItems(this.saveData).filter(i => i.type === 'weapon' || i.type === 'armor' || i.type === 'accessory');
    if (equipItems.length === 0) { content.innerHTML += '<p style="color:#888;">No equipment.</p>'; return; }
    for (const item of equipItems) {
      const div = document.createElement('div'); div.className = 'inv-item';
      div.innerHTML = `<h4>${item.icon} ${item.name} x${item.qty}</h4><p>${item.desc}</p>`;
      const btn = document.createElement('button'); btn.textContent = 'Equip';
      btn.style.cssText = 'background:#4466aa;border:1px solid #6688cc;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;';
      btn.onclick = () => { InventorySystem.equip(self.saveData, item.id); AudioSystem.playSfx('coin'); showToast(`Equipped ${item.name}`, '#80ff80'); self.renderEquipment(content); self.updateHUD(); };
      div.appendChild(btn);
      content.appendChild(div);
    }
  },

  renderCraftingTab(content) {
    content.innerHTML = '<h3 style="color:#a0d0ff;margin-bottom:8px;">Crafting</h3>';
    const self = this;
    for (const recipe of CRAFTING_RECIPES) {
      const result = getItem(recipe.result); if (!result) continue;
      const canMake = canCraft(recipe, this.saveData.player.inventory);
      const div = document.createElement('div'); div.className = 'inv-item';
      div.style.opacity = canMake ? '1' : '0.5';
      const matText = Object.entries(recipe.materials).map(([mid, qty]) => { const m = getItem(mid); const h = self.saveData.player.inventory[mid] || 0; return `${m?.name||mid} ${h}/${qty}`; }).join(', ');
      div.innerHTML = `<h4>${recipe.icon} ${recipe.name}</h4><p>${result.desc}</p><p style="color:#aa0;">${matText}</p>`;
      if (canMake) {
        const btn = document.createElement('button'); btn.textContent = 'Craft';
        btn.style.cssText = 'background:#668844;border:1px solid #88aa66;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;';
        btn.onclick = () => { if (CraftingSystem.craft(self.saveData, recipe.id)) { AudioSystem.playSfx('coin'); showToast(`Crafted ${result.name}!`, '#80ff80'); self.renderCraftingTab(content); self.updateHUD(); } };
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
    for (const spellId of unlocked) {
      const spell = getSpell(spellId); if (!spell) continue;
      const isSlotted = slots.includes(spellId);
      const div = document.createElement('div'); div.className = 'inv-item';
      div.innerHTML = `<h4>${spell.icon} ${spell.name}</h4><p>${spell.desc}</p><p style="color:#88f;">MP: ${spell.cost} | DMG: ${spell.damage}</p>`;
      if (!isSlotted) {
        const btn = document.createElement('button'); btn.textContent = 'Add to Bar';
        btn.style.cssText = 'background:#4466aa;border:1px solid #6688cc;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;';
        btn.onclick = () => { const es = slots.indexOf(null); if (es >= 0) { self.saveData.player.spellSlots[es] = spellId; showToast(`${spell.name} added to bar`, '#80ff80'); self.renderSpells(content); self.updateSpellBar(); } else { showToast('No empty slots!', '#ff4444'); } };
        div.appendChild(btn);
      } else {
        const btn = document.createElement('button'); btn.textContent = 'Remove';
        btn.style.cssText = 'background:#884444;border:1px solid #aa6666;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;';
        btn.onclick = () => { const idx = slots.indexOf(spellId); if (idx >= 0) { self.saveData.player.spellSlots[idx] = null; self.renderSpells(content); self.updateSpellBar(); } };
        div.appendChild(btn);
      }
      content.appendChild(div);
    }
  },

  handleCombatAction(action) {
    const enemy = this.combatEnemy;
    if (!enemy) return;
    const combatLog = document.getElementById('combat-log');
    const enemyHpBar = document.getElementById('enemy-hp-bar');

    switch (action) {
      case 'attack': {
        const r = CombatSystem.playerAttack(this.saveData, enemy);
        combatLog.textContent = `You attack for ${r.damage}!`; AudioSystem.playSfx('hit');
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
            btn.textContent = `${sp.icon} ${sp.name} (${sp.cost}MP)`;
            btn.onclick = () => {
              if (this.saveData.player.mp < sp.cost) { combatLog.textContent = 'Not enough MP!'; return; }
              const r2 = CombatSystem.playerSpell(this.saveData, enemy, sid);
              if (r2 && r2.type !== 'heal') { combatLog.textContent = `${sp.name} deals ${r2.damage}!`; AudioSystem.playSfx('spell'); }
              else if (r2 && r2.type === 'heal') { combatLog.textContent = `Healed ${Math.abs(r2.damage)}!`; AudioSystem.playSfx('heal'); }
              ss.classList.add('hidden');
              this.processCombatRound(enemy);
            };
            sl.appendChild(btn);
          }
          ss.classList.remove('hidden'); return;
        }
        ss.classList.add('hidden'); return;
      }
      case 'defend': { CombatSystem.playerDefend(this.saveData); combatLog.textContent = 'You brace!'; break; }
      case 'flee': {
        if (Math.random() < 0.6) { combatLog.textContent = 'Fled!'; document.getElementById('combat-hud').classList.add('hidden'); document.getElementById('spell-select').classList.add('hidden'); this.combatEnemy = null; return; }
        combatLog.textContent = 'Flee failed!'; break;
      }
    }
    this.processCombatRound(enemy);
  },

  processCombatRound(enemy) {
    const combatLog = document.getElementById('combat-log');
    const enemyHpBar = document.getElementById('enemy-hp-bar');
    if (enemy.currentHp <= 0) {
      const r = CombatSystem.getLoot(this.saveData, enemy);
      enemy.isDead = true;
      combatLog.textContent = `Victory! +${r.xp} XP, +${r.gold} Gold`;
      QuestSystem.onKill(this.saveData, enemy.id);
      AudioSystem.playSfx('coin');
      showToast(`Defeated ${enemy.name}!`, '#ffd700');
      setTimeout(() => { document.getElementById('combat-hud').classList.add('hidden'); document.getElementById('spell-select').classList.add('hidden'); this.combatEnemy = null; this.updateHUD(); }, 1500);
      return;
    }
    const er = CombatSystem.enemyTurn(this.saveData, enemy);
    if (er.damage > 0) {
      combatLog.textContent += `\n${enemy.name} hits for ${er.damage}!`;
      AudioSystem.playSfx('hit');
      if (er.isDead) {
        PlayerSystem.revive(this.saveData);
        showToast('Defeated! Revived at village.', '#ff4444');
        this.saveData.player.area = 'mosswood'; this.saveData.player.x = 3; this.saveData.player.y = 13;
        document.getElementById('combat-hud').classList.add('hidden');
        document.getElementById('spell-select').classList.add('hidden');
        this.combatEnemy = null;
        this.changeArea('mosswood');
        return;
      }
    }
    const pct = Math.max(0, enemy.currentHp / enemy.maxHp) * 100;
    enemyHpBar.innerHTML = `<div style="width:${pct}%"></div>`;
    this.updateHUD();
    this.flashDamage();
  }
};