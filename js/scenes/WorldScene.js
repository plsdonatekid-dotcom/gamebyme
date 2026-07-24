class WorldScene extends Phaser.Scene {
  constructor() { super('WorldScene'); }

  create() {
    this.game.global = this.game.global || {};
    this.saveData = this.game.global.saveData || createNewSave();
    this.areaId = this.saveData.player.area || 'mosswood';
    this.mapDef = getMapData(this.areaId);
    if (!this.mapDef) { this.areaId = 'mosswood'; this.mapDef = getMapData('mosswood'); }
    this.tileMap = { width: this.mapDef.width, height: this.mapDef.tiles.length };
    this.tileSize = TILE_SIZE;
    this.playerX = this.saveData.player.x || 3;
    this.playerY = this.saveData.player.y || 13;
    this.pixelX = this.playerX * this.tileSize;
    this.pixelY = this.playerY * this.tileSize;
    this.moveSpeed = BASE_MOVE_SPEED;
    this.isMoving = false;
    this.moveTarget = null;
    this.interactCooldown = 0;
    this.areaMusic = null;
    this.weatherParticles = [];
    this.timeOfDay = 0.4;
    this.dayTime = true;

    CameraSystem.init(this.mapDef.width * this.tileSize, this.mapDef.height * this.tileSize);
    MinimapSystem.init();
    WorldSystem_init(this.areaId);
    WorldSystem_initChests(this.areaId, this.saveData);

    this.createTileMap();
    this.createDynamicObjects();
    this.setupInput();
    this.updateHUD();
    this.setupAutoSave();
    this.setupUIListeners();
    this.enterArea();
  }

  createTileMap() {
    if (this.tileGraphics) this.tileGraphics.destroy();
    if (this.waterGraphics) this.waterGraphics.destroy();
    this.tileGraphics = this.add.graphics();
    this.waterGraphics = this.add.graphics();
    this.waterGraphics.setDepth(5);
    this.renderTiles();
  }

  renderTiles() {
    const g = this.tileGraphics;
    g.clear();
    this.waterTiles = [];
    this.lavaTiles = [];
    const mapDef = this.mapDef;
    for (let y = 0; y < mapDef.tiles.length; y++) {
      const row = mapDef.tiles[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        const td = mapDef.tileset[ch];
        if (!td) continue;
        const px = x * this.tileSize;
        const py = y * this.tileSize;
        g.fillStyle(td.color, 1);
        g.fillRect(px, py, this.tileSize, this.tileSize);
        if (td.type === 'water') {
          this.waterTiles.push({ x, y });
          g.fillStyle(0x3a6aaa, 0.4);
          g.fillRect(px, py + 10, this.tileSize, 2);
        }
        if (td.type === 'lava') {
          this.lavaTiles.push({ x, y });
          g.fillStyle(0xff6622, 0.4);
          g.fillRect(px + 2, py + 12, this.tileSize - 4, 3);
        }
        if (td.type === 'grass' && (x + y) % 2 === 0) {
          g.fillStyle(0x44883a, 0.5);
          g.fillRect(px, py, this.tileSize, 2);
        }
        if (td.type === 'flower') {
          g.fillStyle(0xaa88ff, 0.8);
          g.fillRect(px + 12, py + 8, 8, 8);
        }
        if (td.type === 'shrine') {
          g.fillStyle(0x8866ff, 0.6);
          g.fillRect(px + 4, py, this.tileSize - 8, this.tileSize);
          g.fillStyle(0xaa88ff, 0.4);
          g.fillRect(px + 8, py + 4, this.tileSize - 16, this.tileSize - 8);
        }
        if (td.type === 'altar') {
          g.fillStyle(0x8866ff, 0.8);
          g.fillRect(px + 6, py + 6, 20, 20);
          g.fillStyle(0xffffff, 0.5);
          g.fillRect(px + 10, py + 10, 12, 12);
        }
        if (td.type === 'exit') {
          g.fillStyle(0x4466aa, 0.4);
          g.fillRect(px + 8, py + 8, this.tileSize - 16, this.tileSize - 16);
        }
      }
    }
  }

  createDynamicObjects() {
    if (this.playerSprite) this.playerSprite.destroy();
    this.playerSprite = this.add.sprite(this.pixelX + this.tileSize / 2, this.pixelY + this.tileSize / 2, 'player');
    this.playerSprite.setScale(1.2);
    this.playerSprite.setDepth(10);

    this.enemySprites = [];
    this.npcSprites = [];
    this.chestSprites = [];

    const mapDef = this.mapDef;
    const npcIds = mapDef.npcs || [];
    const placedPositions = [];
    for (const npcId of npcIds) {
      const npcDef = getNpc(npcId);
      if (!npcDef) continue;
      let nx, ny;
      let attempts = 0;
      do {
        nx = rand(1, mapDef.width - 2);
        ny = rand(1, mapDef.tiles.length - 2);
        attempts++;
      } while (isSolid(this.areaId, nx, ny) && attempts < 30);
      if (isSolid(this.areaId, nx, ny)) continue;
      const spr = this.add.sprite(nx * this.tileSize + this.tileSize / 2, ny * this.tileSize + this.tileSize / 2, 'npc');
      spr.setData('npcId', npcId);
      spr.setData('tx', nx);
      spr.setData('ty', ny);
      spr.setDepth(9);
      this.npcSprites.push(spr);
      placedPositions.push({ x: nx, y: ny });
    }
  }

  setupInput() {
    this.cursors = {
      W: this.input.keyboard.addKey(KEYS.W),
      A: this.input.keyboard.addKey(KEYS.A),
      S: this.input.keyboard.addKey(KEYS.S),
      D: this.input.keyboard.addKey(KEYS.D),
      SPACE: this.input.keyboard.addKey(KEYS.SPACE),
      E: this.input.keyboard.addKey(KEYS.E),
      I: this.input.keyboard.addKey(KEYS.I),
      M: this.input.keyboard.addKey(KEYS.M),
      Q: this.input.keyboard.addKey(KEYS.Q),
    };
    this.spellKeys = [
      this.input.keyboard.addKey(KEYS.ONE),
      this.input.keyboard.addKey(KEYS.TWO),
      this.input.keyboard.addKey(KEYS.THREE),
      this.input.keyboard.addKey(KEYS.FOUR),
      this.input.keyboard.addKey(KEYS.FIVE),
    ];
    this.keyCooldowns = {};
  }

  setupAutoSave() {
    this.autoSaveTimer = this.time.addEvent({
      delay: 30000, loop: true, callback: () => {
        this.syncSaveData();
        saveGame(this.saveData);
      }
    });
  }

  setupUIListeners() {
    document.getElementById('inv-close')?.addEventListener('click', () => {
      document.getElementById('inventory-screen').classList.add('hidden');
    });
    document.getElementById('map-close')?.addEventListener('click', () => {
      document.getElementById('world-map').classList.add('hidden');
    });
    const tabs = document.querySelectorAll('.inv-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderInventoryTab(tab.dataset.tab);
      });
    });
    const combatBtns = document.querySelectorAll('.combat-btn');
    combatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.handleCombatAction(action);
      });
    });
  }

  update(time, delta) {
    const dt = delta / 1000;
    if (!this.saveData) return;
    this.handleMovement(dt);
    CameraSystem.follow(this.pixelX + this.tileSize / 2, this.pixelY + this.tileSize / 2);
    CameraSystem.update(dt);
    this.cameras.main.setScroll(CameraSystem.x, CameraSystem.y);
    this.updateEnemySprites(dt);
    this.updateInteraction();
    this.minimapUpdate();
    this.updateWeather(dt);
    this.updateDayNight(dt);
    this.updateAnimatedTiles(time);
    this.updateHUD();
    this.handleKeyPresses(time);
    ParticleSystem.update(dt);
    this.syncSaveData();
  }

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
      this.playerSprite.setPosition(this.pixelX + this.tileSize / 2, this.pixelY + this.tileSize / 2);
      return;
    }
    let dx = 0, dy = 0;
    if (this.cursors.W.isDown) dy = -1;
    else if (this.cursors.S.isDown) dy = 1;
    if (this.cursors.A.isDown) dx = -1;
    else if (this.cursors.D.isDown) dx = 1;
    if (dx !== 0 || dy !== 0) {
      const tx = this.playerX + dx;
      const ty = this.playerY + dy;
      if (!isSolid(this.areaId, tx, ty) && !this.enemyAt(tx, ty)) {
        this.isMoving = true;
        this.moveTarget = { x: tx, y: ty };
        AudioSystem.playSfx('step');
      } else if (this.enemyAt(tx, ty)) {
        this.triggerCombat(tx, ty);
      }
    }
  }

  enemyAt(tx, ty) {
    return this.enemySprites.some(s => s.getData('tx') === tx && s.getData('ty') === ty);
  }

  updateEnemySprites(dt) {
    WorldSystem_updateEnemies(dt, this.saveData, this.areaId, this.playerX, this.playerY);
    const currentEnemyKeys = new Set();
    for (const e of worldEnemies) {
      if (e.isDead) continue;
      currentEnemyKeys.add(`${e.x},${e.y}`);
      let spr = this.enemySprites.find(s => s.getData('tx') === e.x && s.getData('ty') === e.y);
      if (!spr) {
        spr = this.add.sprite(e.x * this.tileSize + this.tileSize / 2, e.y * this.tileSize + this.tileSize / 2, 'enemy');
        spr.setData('tx', e.x);
        spr.setData('ty', e.y);
        spr.setData('enemyId', e.id);
        spr.setDepth(9);
        this.enemySprites.push(spr);
      }
      spr.setPosition(e.x * this.tileSize + this.tileSize / 2, e.y * this.tileSize + this.tileSize / 2);
      spr.setData('tx', e.x);
      spr.setData('ty', e.y);
      const isBoss = e.isBoss || false;
      spr.setTint(isBoss ? 0xff4444 : (e.aggro ? 0xff8888 : 0xffffff));
      spr.setScale(isBoss ? 1.5 : 1);
    }
    for (let i = this.enemySprites.length - 1; i >= 0; i--) {
      const spr = this.enemySprites[i];
      const key = `${spr.getData('tx')},${spr.getData('ty')}`;
      if (!currentEnemyKeys.has(key)) {
        spr.destroy();
        this.enemySprites.splice(i, 1);
      }
    }
  }

  updateInteraction() {
    this.interactCooldown = Math.max(0, this.interactCooldown - 16);
  }

  handleKeyPresses(time) {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.SPACE) || Phaser.Input.Keyboard.JustDown(this.cursors.E)) {
      this.interact();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.I)) {
      this.toggleInventory();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.M)) {
      this.toggleMap();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.Q)) {
      this.toggleQuestTracker();
    }
    for (let i = 0; i < 5; i++) {
      if (this.spellKeys[i] && Phaser.Input.Keyboard.JustDown(this.spellKeys[i])) {
        this.useSpellSlot(i);
      }
    }
  }

  interact() {
    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const tx = this.playerX + dx;
      const ty = this.playerY + dy;
      const npc = this.npcSprites.find(s => s.getData('tx') === tx && s.getData('ty') === ty);
      if (npc) {
        const npcId = npc.getData('npcId');
        this.openDialog(npcId);
        return;
      }
      const chest = WorldSystem_getChestAt(tx, ty);
      if (chest && !chest.opened) {
        const result = WorldSystem_openChest(this.saveData, tx, ty);
        if (result) {
          const lootText = result.loot.map(l => `${getItem(l.id)?.name || l.id} x${l.qty}`).join(', ');
          showToast(`Chest opened! ${lootText} +${result.gold} Gold`, '#ffd700');
          this.createChestSprite(tx, ty, true);
          return;
        }
      }
      const tile = getTileAt(this.areaId, tx, ty);
      if (tile && tile.exitTo) {
        this.changeArea(tile.exitTo);
        return;
      }
    }
  }

  createChestSprite(tx, ty, opened) {
    if (opened) {
      const existing = this.chestSprites.find(s => s.getData('tx') === tx && s.getData('ty') === ty);
      if (existing) existing.destroy();
    }
  }

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
    dialogText.textContent = dialog.text;
    dialogChoices.innerHTML = '';
    const self = this;
    for (const choice of (dialog.choices || [])) {
      const btn = document.createElement('button');
      btn.textContent = choice.text;
      btn.onclick = () => {
        if (choice.action === 'startQuest_awakening') {
          QuestSystem.startQuest(self.saveData, 'awakening');
          showToast('Quest started: The Awakening', '#80ff80');
        }
        if (choice.action === 'startQuest_forest_corruption') {
          QuestSystem.startQuest(self.saveData, 'forest_corruption');
          showToast('Quest started: Forest Corruption', '#80ff80');
        }
        if (choice.action === 'startQuest_volcano_trial') {
          QuestSystem.startQuest(self.saveData, 'volcano_trial');
          showToast('Quest started: Trial of Flame', '#80ff80');
        }
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
              b.onclick = () => {
                if (c.action === 'openShop') { self.openShop(); dialogBox.classList.add('hidden'); return; }
                if (c.action === 'openCrafting') { self.openCraftingUI(); dialogBox.classList.add('hidden'); return; }
                dialogBox.classList.add('hidden');
              };
              dialogChoices.appendChild(b);
            }
          }
        } else {
          dialogBox.classList.add('hidden');
        }
      };
      dialogChoices.appendChild(btn);
    }
    QuestSystem.onTalk(this.saveData, npcId);
  }

  openShop() {
    const inv = document.getElementById('inventory-screen');
    const content = document.getElementById('inv-content');
    document.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('[data-tab="items"]')?.classList.add('active');
    inv.classList.remove('hidden');
    content.innerHTML = '<h3 style="color:#ffd700;margin-bottom:10px;">Shop - Press E to buy</h3>';
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
        } else {
          showToast('Not enough gold!', '#ff4444');
        }
      };
      div.appendChild(buyBtn);
      content.appendChild(div);
    }
  }

  openCraftingUI() {
    const inv = document.getElementById('inventory-screen');
    const content = document.getElementById('inv-content');
    document.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('[data-tab="crafting"]')?.classList.add('active');
    inv.classList.remove('hidden');
    this.renderInventoryTab('crafting');
  }

  toggleInventory() {
    const inv = document.getElementById('inventory-screen');
    if (inv.classList.contains('hidden')) {
      inv.classList.remove('hidden');
      document.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('active'));
      document.querySelector('[data-tab="items"]')?.classList.add('active');
      this.renderInventoryTab('items');
    } else {
      inv.classList.add('hidden');
    }
  }

  renderInventoryTab(tab) {
    const content = document.getElementById('inv-content');
    content.innerHTML = '';
    switch (tab) {
      case 'items': this.renderItemsTab(content); break;
      case 'equipment': this.renderEquipmentTab(content); break;
      case 'crafting': this.renderCraftingTab(content); break;
      case 'spells': this.renderSpellsTab(content); break;
    }
  }

  renderItemsTab(content) {
    const items = InventorySystem.getAllItems(this.saveData).filter(i => i.type === 'consumable' || i.type === 'material' || i.type === 'key' || i.type === 'quest');
    if (items.length === 0) { content.innerHTML = '<p style="color:#888;">No items.</p>'; return; }
    for (const item of items) {
      const div = document.createElement('div');
      div.className = 'inv-item';
      div.innerHTML = `<h4>${item.icon} ${item.name} x${item.qty}</h4><p>${item.desc}</p><p style="color:#aa0;">Value: ${item.value}g</p>`;
      if (item.type === 'consumable') {
        const useBtn = document.createElement('button');
        useBtn.textContent = 'Use';
        useBtn.style.cssText = 'background:#448844;border:1px solid #66aa66;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;';
        useBtn.onclick = () => {
          if (item.healHp) PlayerSystem.heal(this.saveData, item.healHp);
          if (item.healMp) PlayerSystem.restoreMp(this.saveData, item.healMp);
          InventorySystem.removeItem(this.saveData, item.id, 1);
          AudioSystem.playSfx('heal');
          showToast(`Used ${item.name}`, '#44ff44');
          this.updateHUD();
          this.renderItemsTab(content);
        };
        div.appendChild(useBtn);
      }
      content.appendChild(div);
    }
  }

  renderEquipmentTab(content) {
    const eq = this.saveData.player.equipped;
    content.innerHTML = '<h3 style="color:#a0d0ff;margin-bottom:8px;">Equipped</h3>';
    const slots = ['weapon', 'armor', 'accessory'];
    for (const slot of slots) {
      const id = eq[slot];
      const item = id ? getItem(id) : null;
      const div = document.createElement('div');
      div.className = 'inv-item';
      if (item) {
        div.innerHTML = `<h4>${item.icon} ${item.name}</h4><p>${slot} - ${item.desc}</p>`;
        const uneqBtn = document.createElement('button');
        uneqBtn.textContent = 'Unequip';
        uneqBtn.style.cssText = 'background:#884444;border:1px solid #aa6666;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;';
        uneqBtn.onclick = () => {
          InventorySystem.unequip(this.saveData, slot);
          showToast(`Unequipped ${item.name}`, '#ffaa44');
          this.renderEquipmentTab(content);
          this.updateHUD();
        };
        div.appendChild(uneqBtn);
      } else {
        div.innerHTML = `<h4 style="color:#666;">Empty ${slot} slot</h4><p>No item equipped.</p>`;
      }
      content.appendChild(div);
    }
    content.innerHTML += '<h3 style="color:#a0d0ff;margin:8px 0;">Inventory Equipment</h3>';
    const equipItems = InventorySystem.getAllItems(this.saveData).filter(i => i.type === 'weapon' || i.type === 'armor' || i.type === 'accessory');
    if (equipItems.length === 0) { content.innerHTML += '<p style="color:#888;">No equipment in inventory.</p>'; return; }
    for (const item of equipItems) {
      const div = document.createElement('div');
      div.className = 'inv-item';
      div.innerHTML = `<h4>${item.icon} ${item.name} x${item.qty}</h4><p>${item.desc}</p>`;
      const eqBtn = document.createElement('button');
      eqBtn.textContent = 'Equip';
      eqBtn.style.cssText = 'background:#4466aa;border:1px solid #6688cc;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;';
      eqBtn.onclick = () => {
        InventorySystem.equip(this.saveData, item.id);
        AudioSystem.playSfx('coin');
        showToast(`Equipped ${item.name}`, '#80ff80');
        this.renderEquipmentTab(content);
        this.updateHUD();
      };
      div.appendChild(eqBtn);
      content.appendChild(div);
    }
  }

  renderCraftingTab(content) {
    content.innerHTML = '<h3 style="color:#a0d0ff;margin-bottom:8px;">Crafting Recipes</h3>';
    const recipes = CRAFTING_RECIPES;
    for (const recipe of recipes) {
      const result = getItem(recipe.result);
      if (!result) continue;
      const canMake = canCraft(recipe, this.saveData.player.inventory);
      const div = document.createElement('div');
      div.className = 'inv-item';
      div.style.opacity = canMake ? '1' : '0.5';
      const matText = Object.entries(recipe.materials).map(([mid, qty]) => {
        const mat = getItem(mid);
        const have = this.saveData.player.inventory[mid] || 0;
        return `${mat?.name || mid} ${have}/${qty}`;
      }).join(', ');
      div.innerHTML = `<h4>${recipe.icon} ${recipe.name}</h4><p>${result.desc}</p><p style="color:#aa0;">${matText}</p>`;
      if (canMake) {
        const craftBtn = document.createElement('button');
        craftBtn.textContent = 'Craft';
        craftBtn.style.cssText = 'background:#668844;border:1px solid #88aa66;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;';
        craftBtn.onclick = () => {
          if (CraftingSystem.craft(this.saveData, recipe.id)) {
            AudioSystem.playSfx('coin');
            showToast(`Crafted ${result.name}!`, '#80ff80');
            this.renderCraftingTab(content);
            this.updateHUD();
          }
        };
        div.appendChild(craftBtn);
      }
      content.appendChild(div);
    }
  }

  renderSpellsTab(content) {
    content.innerHTML = '<h3 style="color:#a0d0ff;margin-bottom:8px;">Spells</h3>';
    const unlocked = this.saveData.player.unlockedSpells || [];
    const slots = this.saveData.player.spellSlots || [];
    for (const spellId of unlocked) {
      const spell = getSpell(spellId);
      if (!spell) continue;
      const isSlotted = slots.includes(spellId);
      const div = document.createElement('div');
      div.className = 'inv-item';
      div.innerHTML = `<h4>${spell.icon} ${spell.name}</h4><p>${spell.desc}</p><p style="color:#88f;">MP: ${spell.cost} | DMG: ${spell.damage}</p>`;
      if (!isSlotted) {
        const slotBtn = document.createElement('button');
        slotBtn.textContent = 'Add to Bar';
        slotBtn.style.cssText = 'background:#4466aa;border:1px solid #6688cc;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;';
        slotBtn.onclick = () => {
          const emptySlot = slots.indexOf(null);
          if (emptySlot >= 0) {
            this.saveData.player.spellSlots[emptySlot] = spellId;
            this.game.global.spellSlots = this.saveData.player.spellSlots;
            showToast(`${spell.name} added to bar`, '#80ff80');
            this.renderSpellsTab(content);
            this.updateSpellBar();
          } else {
            showToast('No empty spell slots!', '#ff4444');
          }
        };
        div.appendChild(slotBtn);
      } else {
        const rmBtn = document.createElement('button');
        rmBtn.textContent = 'Remove from Bar';
        rmBtn.style.cssText = 'background:#884444;border:1px solid #aa6666;color:#fff;padding:2px 8px;margin-top:4px;cursor:pointer;border-radius:3px;';
        rmBtn.onclick = () => {
          const idx = slots.indexOf(spellId);
          if (idx >= 0) {
            this.saveData.player.spellSlots[idx] = null;
            this.game.global.spellSlots = this.saveData.player.spellSlots;
            this.renderSpellsTab(content);
            this.updateSpellBar();
          }
        };
        div.appendChild(rmBtn);
      }
      content.appendChild(div);
    }
  }

  useSpellSlot(slotIdx) {
    const slots = this.saveData.player.spellSlots || [];
    const spellId = slots[slotIdx];
    if (!spellId) return;
    const spell = getSpell(spellId);
    if (!spell) return;
    if (this.saveData.player.mp < spell.cost) {
      showToast('Not enough mana!', '#ff4444');
      return;
    }
    const result = PlayerSystem.castSpell(this.saveData, spellId);
    if (!result) return;
    const { spell: sp, damage } = result;
    AudioSystem.playSfx('spell');
    if (sp.effect === 'heal') {
      PlayerSystem.heal(this.saveData, Math.abs(sp.damage));
      showToast(`Cast ${sp.name}: +${Math.abs(sp.damage)} HP`, '#44ff44');
    } else if (sp.effect === 'shield') {
      this.saveData.player.shield = (this.saveData.player.shield || 0) + Math.floor(PlayerSystem.getTotalMatk(this.saveData) * 0.5) + 10;
      showToast(`Cast ${sp.name}: Shield up!`, '#88aaff');
    } else {
      const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (const [dx, dy] of dirs) {
        const tx = this.playerX + dx;
        const ty = this.playerY + dy;
        const enemy = WorldSystem_getEnemyAt(tx, ty);
        if (enemy) {
          const weakness = getWeakness(enemy.id, sp.type) || 1;
          const finalDmg = Math.floor(damage * weakness);
          enemy.currentHp -= finalDmg;
          showToast(`${sp.name} hits ${enemy.name} for ${finalDmg}!`, '#ff8844');
          if (enemy.currentHp <= 0) {
            enemy.isDead = true;
            const result2 = CombatSystem.getLoot(this.saveData, enemy);
            showToast(`Defeated ${enemy.name}! +${result2.xp} XP, +${result2.gold} Gold`, '#ffd700');
            QuestSystem.onKill(this.saveData, enemy.id);
          }
          break;
        }
      }
    }
    if (damage > 0) {
      ParticleSystem.emitBurst(this.pixelX + this.tileSize / 2, this.pixelY + this.tileSize / 2,
        ['#ff4444', '#ff8844', '#ffcc44'], 12, 80);
    }
    this.updateHUD();
  }

  triggerCombat(tx, ty) {
    const enemy = WorldSystem_getEnemyAt(tx, ty);
    if (!enemy) return;
    this.combatEnemy = enemy;
    const combatHud = document.getElementById('combat-hud');
    const enemyName = document.getElementById('enemy-name');
    const enemyHpBar = document.getElementById('enemy-hp-bar');
    const combatLog = document.getElementById('combat-log');
    combatHud.classList.remove('hidden');
    enemyName.textContent = `${enemy.icon} ${enemy.name} (Lv${enemy.level})`;
    enemyHpBar.innerHTML = `<div style="width:100%"></div>`;
    enemyName.style.color = enemy.isBoss ? '#ff4444' : '#ffaa44';
    combatLog.textContent = `${enemy.name} appears!`;
    if (enemy.isBoss) AudioSystem.playSfx('boss');
  }

  handleCombatAction(action) {
    if (!this.combatEnemy) return;
    const combatLog = document.getElementById('combat-log');
    const enemyHpBar = document.getElementById('enemy-hp-bar');
    const enemy = this.combatEnemy;

    switch (action) {
      case 'attack': {
        const result = CombatSystem.playerAttack(this.saveData, enemy);
        combatLog.textContent = `You attack for ${result.damage} damage!`;
        AudioSystem.playSfx('hit');
        break;
      }
      case 'spell': {
        const spellSelect = document.getElementById('spell-select');
        const spellList = document.getElementById('spell-list');
        if (spellSelect.classList.contains('hidden')) {
          spellList.innerHTML = '';
          const slots = this.saveData.player.spellSlots || [];
          for (const spellId of slots) {
            if (!spellId) continue;
            const spell = getSpell(spellId);
            if (!spell) continue;
            const btn = document.createElement('button');
            btn.className = 'spell-btn';
            btn.textContent = `${spell.icon} ${spell.name} (${spell.cost}MP)`;
            btn.onclick = () => {
              if (this.saveData.player.mp < spell.cost) {
                combatLog.textContent = 'Not enough MP!';
                return;
              }
              const result = CombatSystem.playerSpell(this.saveData, enemy, spellId);
              if (result && result.type !== 'heal') {
                combatLog.textContent = `${spell.name} deals ${result.damage} damage!`;
                AudioSystem.playSfx('spell');
              } else if (result && result.type === 'heal') {
                combatLog.textContent = `Healed for ${Math.abs(result.damage)} HP!`;
                AudioSystem.playSfx('heal');
              }
              spellSelect.classList.add('hidden');
              this.updateHUD();
              this.continueCombatAfterSpell(enemy);
            };
            spellList.appendChild(btn);
          }
          spellSelect.classList.remove('hidden');
          return;
        }
        spellSelect.classList.add('hidden');
        return;
      }
      case 'defend': {
        CombatSystem.playerDefend(this.saveData);
        combatLog.textContent = 'You brace for impact!';
        break;
      }
      case 'flee': {
        if (Math.random() < 0.6) {
          combatLog.textContent = 'You fled successfully!';
          document.getElementById('combat-hud').classList.add('hidden');
          document.getElementById('spell-select').classList.add('hidden');
          this.combatEnemy = null;
          return;
        }
        combatLog.textContent = 'Failed to flee!';
        break;
      }
    }

    if (enemy.currentHp <= 0) {
      const result = CombatSystem.getLoot(this.saveData, enemy);
      enemy.isDead = true;
      combatLog.textContent = `Victory! +${result.xp} XP, +${result.gold} Gold`;
      QuestSystem.onKill(this.saveData, enemy.id);
      AudioSystem.playSfx('coin');
      showToast(`Defeated ${enemy.name}! +${result.xp} XP`, '#ffd700');
      setTimeout(() => {
        document.getElementById('combat-hud').classList.add('hidden');
        document.getElementById('spell-select').classList.add('hidden');
        this.combatEnemy = null;
        this.updateHUD();
      }, 1500);
      return;
    }

    const enemyResult = CombatSystem.enemyTurn(this.saveData, enemy);
    if (enemyResult.damage > 0) {
      combatLog.textContent += `\n${enemy.name} hits for ${enemyResult.damage}!`;
      AudioSystem.playSfx('hit');
      if (enemyResult.isDead) {
        PlayerSystem.revive(this.saveData);
        showToast('You were defeated!', '#ff4444');
        this.saveData.player.area = 'mosswood';
        this.saveData.player.x = 3;
        this.saveData.player.y = 13;
        document.getElementById('combat-hud').classList.add('hidden');
        document.getElementById('spell-select').classList.add('hidden');
        this.combatEnemy = null;
        this.changeArea('mosswood');
        this.updateHUD();
        return;
      }
    }

    const hpPct = Math.max(0, enemy.currentHp / enemy.maxHp) * 100;
    enemyHpBar.innerHTML = `<div style="width:${hpPct}%"></div>`;
    this.updateHUD();
    this.flashDamage();
  }

  updateAnimatedTiles(time) {
    const g = this.waterGraphics;
    if (!g) return;
    g.clear();
    const w = this.tileSize;
    const t = time / 500;
    for (const wt of (this.waterTiles || [])) {
      const offset = Math.sin(t + wt.x * 0.5 + wt.y * 0.3) * 3;
      g.fillStyle(0x4a8aba, 0.3);
      g.fillRect(wt.x * w + offset, wt.y * w + 8, w, 4);
      g.fillStyle(0x5a9aca, 0.2);
      g.fillRect(wt.x * w - offset, wt.y * w + 18, w, 3);
    }
    for (const lt of (this.lavaTiles || [])) {
      const offset = Math.sin(t * 0.7 + lt.x * 0.7 + lt.y * 0.5) * 4;
      g.fillStyle(0xff6622, 0.5);
      g.fillRect(lt.x * w + offset, lt.y * w + 6, w, 5);
      g.fillStyle(0xffaa44, 0.3);
      g.fillRect(lt.x * w - offset, lt.y * w + 18, w, 3);
    }
  }

  continueCombatAfterSpell(enemy) {
    const combatLog = document.getElementById('combat-log');
    const enemyHpBar = document.getElementById('enemy-hp-bar');
    if (enemy.currentHp <= 0) {
      const result = CombatSystem.getLoot(this.saveData, enemy);
      enemy.isDead = true;
      combatLog.textContent = `Victory! +${result.xp} XP, +${result.gold} Gold`;
      QuestSystem.onKill(this.saveData, enemy.id);
      AudioSystem.playSfx('coin');
      showToast(`Defeated ${enemy.name}! +${result.xp} XP`, '#ffd700');
      setTimeout(() => {
        document.getElementById('combat-hud').classList.add('hidden');
        document.getElementById('spell-select').classList.add('hidden');
        this.combatEnemy = null;
        this.updateHUD();
      }, 1500);
      return;
    }
    const enemyResult = CombatSystem.enemyTurn(this.saveData, enemy);
    if (enemyResult.damage > 0) {
      combatLog.textContent += `\n${enemy.name} hits for ${enemyResult.damage}!`;
      AudioSystem.playSfx('hit');
      if (enemyResult.isDead) {
        PlayerSystem.revive(this.saveData);
        showToast('You were defeated!', '#ff4444');
        this.saveData.player.area = 'mosswood';
        this.saveData.player.x = 3;
        this.saveData.player.y = 13;
        document.getElementById('combat-hud').classList.add('hidden');
        document.getElementById('spell-select').classList.add('hidden');
        this.combatEnemy = null;
        this.changeArea('mosswood');
        this.updateHUD();
        return;
      }
    }
    const hpPct = Math.max(0, enemy.currentHp / enemy.maxHp) * 100;
    enemyHpBar.innerHTML = `<div style="width:${hpPct}%"></div>`;
    this.updateHUD();
    this.flashDamage();
  }

  flashDamage() {
    const flash = document.getElementById('damage-flash');
    if (flash) {
      flash.style.opacity = '1';
      setTimeout(() => { flash.style.opacity = '0'; }, 150);
    }
  }

  changeArea(newArea) {
    const oldArea = this.areaId;
    this.areaId = newArea;
    this.mapDef = getMapData(newArea);
    if (!this.mapDef) { this.areaId = 'mosswood'; this.mapDef = getMapData('mosswood'); }
    this.saveData.player.area = this.areaId;
    const entranceTiles = this.mapDef.tileset;
    for (const [ch, td] of Object.entries(entranceTiles)) {
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
    this.renderTiles();
    CameraSystem.init(this.mapDef.width * this.tileSize, this.mapDef.height * this.tileSize);
    WorldSystem_init(this.areaId);
    WorldSystem_initChests(this.areaId, this.saveData);
    this.enemySprites.forEach(s => s.destroy());
    this.enemySprites = [];
    this.npcSprites.forEach(s => s.destroy());
    this.npcSprites = [];
    this.createDynamicObjects();
    document.getElementById('area-name').textContent = this.mapDef.name;
    AudioSystem.playMusic(this.mapDef.music);
    showToast(`Entered ${this.mapDef.name}`, '#a0d0ff');
    this.updateHUD();
    saveGame(this.saveData);
  }

  checkExits() {
    const tile = getTileAt(this.areaId, this.playerX, this.playerY);
    if (tile && tile.exitTo) {
      this.changeArea(tile.exitTo);
    }
  }

  checkLavaDamage() {
    const tile = getTileAt(this.areaId, this.playerX, this.playerY);
    if (tile && tile.damage) {
      if (!this.lavaTimer || Date.now() - this.lavaTimer > 1000) {
        this.lavaTimer = Date.now();
        PlayerSystem.takeDamage(this.saveData, 5);
        this.flashDamage();
        showToast('Lava burns! -5 HP', '#ff4400');
        this.updateHUD();
      }
    }
  }

  enterArea() {
    document.getElementById('area-name').textContent = this.mapDef.name;
    AudioSystem.playMusic(this.mapDef.music);
    showToast(`Exploring ${this.mapDef.name}`, '#a0d0ff');
    this.updateSpellBar();
  }

  toggleMap() {
    const mapEl = document.getElementById('world-map');
    if (mapEl.classList.contains('hidden')) {
      mapEl.classList.remove('hidden');
      this.renderWorldMap();
    } else {
      mapEl.classList.add('hidden');
    }
  }

  toggleQuestTracker() {
    const qEl = document.getElementById('quest-tracker');
    if (qEl.classList.contains('hidden')) {
      qEl.classList.remove('hidden');
      this.renderQuestTracker();
    } else {
      qEl.classList.add('hidden');
    }
  }

  renderQuestTracker() {
    const list = document.getElementById('quest-list');
    list.innerHTML = '';
    const active = QuestSystem.getActive(this.saveData);
    if (active.length === 0) {
      list.innerHTML = '<p style="color:#888;">No active quests. Talk to NPCs to find tasks.</p>';
      return;
    }
    for (const quest of active) {
      const div = document.createElement('div');
      div.className = 'quest-item';
      const progressText = quest.objectives.map(o => {
        const done = o.done ? '✓' : `${o.doneCount || 0}/${o.count}`;
        return `${o.target} ${done}`;
      }).join(', ');
      div.innerHTML = `<div class="quest-name">${quest.name}</div>
        <div class="quest-desc">${quest.desc}</div>
        <div class="quest-progress">${progressText}</div>`;
      list.appendChild(div);
    }
  }

  renderWorldMap() {
    const canvas = document.getElementById('map-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);
    const visitedAreas = ['mosswood', 'enchanted_forest', 'wizard_tower', 'caves', 'mountains', 'snowy_peaks', 'volcano', 'ruins', 'temple'];
    const areaPositions = {
      mosswood: { x: 100, y: 450, color: '#3a7a2a' },
      enchanted_forest: { x: 250, y: 350, color: '#2a6a2a' },
      wizard_tower: { x: 300, y: 250, color: '#6a5a7a' },
      caves: { x: 400, y: 400, color: '#4a3a2a' },
      mountains: { x: 500, y: 300, color: '#6a6a5a' },
      snowy_peaks: { x: 600, y: 200, color: '#ccccee' },
      volcano: { x: 650, y: 350, color: '#ff6622' },
      ruins: { x: 450, y: 150, color: '#4a4a4a' },
      temple: { x: 350, y: 100, color: '#aa88ff' },
    };
    const connections = [
      ['mosswood', 'enchanted_forest'], ['enchanted_forest', 'caves'],
      ['enchanted_forest', 'wizard_tower'], ['caves', 'mountains'],
      ['mountains', 'snowy_peaks'], ['snowy_peaks', 'volcano'],
      ['volcano', 'ruins'], ['ruins', 'temple']
    ];
    ctx.lineWidth = 2;
    for (const [a, b] of connections) {
      const p1 = areaPositions[a];
      const p2 = areaPositions[b];
      if (p1 && p2) {
        ctx.strokeStyle = '#404060';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    for (const [area, pos] of Object.entries(areaPositions)) {
      const mapData = getMapData(area);
      const name = mapData ? mapData.name : area;
      const isCurrent = area === this.areaId;
      ctx.fillStyle = isCurrent ? '#ffd700' : pos.color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isCurrent ? 10 : 7, 0, Math.PI * 2);
      ctx.fill();
      if (isCurrent) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.fillStyle = '#e0d8c0';
      ctx.fillText(name, pos.x, pos.y + 20);
    }
  }

  minimapUpdate() {
    MinimapSystem.render(this.saveData, this.areaId, this.playerX, this.playerY);
  }

  updateWeather(dt) {
    if (Math.random() < 0.02) {
      this.weatherParticles.push({
        x: rand(0, GAME_WIDTH),
        y: -5,
        speed: randf(30, 60),
        size: randf(1, 3),
      });
    }
    for (let i = this.weatherParticles.length - 1; i >= 0; i--) {
      const p = this.weatherParticles[i];
      p.y += p.speed * dt;
      if (p.y > GAME_HEIGHT) { this.weatherParticles.splice(i, 1); }
    }
  }

  updateDayNight(dt) {
    this.timeOfDay += dt * 0.005;
    if (this.timeOfDay > 1) this.timeOfDay -= 1;
    this.dayTime = this.timeOfDay > 0.25 && this.timeOfDay < 0.75;
  }

  updateHUD() {
    const hp = this.saveData.player.hp;
    const maxHp = PlayerSystem.getMaxHp(this.saveData);
    const mp = this.saveData.player.mp;
    const maxMp = PlayerSystem.getMaxMp(this.saveData);
    const xp = this.saveData.player.xp;
    const xpToNext = this.saveData.player.xpToNext;
    const level = this.saveData.player.level;
    const gold = this.saveData.player.gold;

    document.getElementById('hp-bar').style.width = `${(hp / maxHp) * 100}%`;
    document.getElementById('hp-text').textContent = `${Math.floor(hp)}/${maxHp}`;
    document.getElementById('mp-bar').style.width = `${(mp / maxMp) * 100}%`;
    document.getElementById('mp-text').textContent = `${Math.floor(mp)}/${maxMp}`;
    document.getElementById('xp-bar').style.width = `${(xp / xpToNext) * 100}%`;
    document.getElementById('xp-text').textContent = `Lv ${level}`;
    document.getElementById('gold-display').innerHTML = `&#9733; ${gold}`;

    const eq = this.saveData.player.equipped;
    const eqText = [];
    if (eq.weapon) { const w = getItem(eq.weapon); if (w) eqText.push(w.name); }
    if (eq.armor) { const a = getItem(eq.armor); if (a) eqText.push(a.name); }
    document.getElementById('eq-display').textContent = eqText.join(' | ');
    this.updateSpellBar();
  }

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
  }

  syncSaveData() {
    this.game.global.saveData = this.saveData;
  }
}