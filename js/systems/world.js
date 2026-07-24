const ENEMY_SPAWN_INTERVAL = 2000;
const ENEMY_VISIBLE_RANGE = 200;
const ENEMY_CHASE_RANGE = 150;

let worldEnemies = [];
let worldNpcs = [];
let worldChests = [];
let worldSpawnTimers = {};

function WorldSystem_init(areaId) {
  worldEnemies = [];
  worldNpcs = [];
  worldChests = [];
  worldSpawnTimers[areaId] = Date.now();
}

function WorldSystem_spawnEnemies(saveData, areaId, playerX, playerY) {
  const mapDef = getMapData(areaId);
  if (!mapDef) return;
  if (mapDef.enemySpawnRate <= 0) return;
  const now = Date.now();
  if (!worldSpawnTimers[areaId]) worldSpawnTimers[areaId] = now;
  if (now - worldSpawnTimers[areaId] < ENEMY_SPAWN_INTERVAL) return;
  worldSpawnTimers[areaId] = now;
  if (Math.random() > mapDef.enemySpawnRate) return;
  const areaEnemies = getEnemiesForArea(areaId);
  if (areaEnemies.length === 0) return;
  const bossEnemies = getBossesForArea(areaId);
  const allPossible = [...areaEnemies];
  if (Math.random() < 0.05) allPossible.push(...bossEnemies);
  const enemyDef = allPossible[rand(0, allPossible.length - 1)];
  if (!enemyDef) return;
  let ex, ey;
  let attempts = 0;
  do {
    ex = rand(1, mapDef.width - 2);
    ey = rand(1, mapDef.tiles.length - 2);
    attempts++;
  } while (isSolid(areaId, ex, ey) && attempts < 20);
  if (distance(ex, ey, playerX, playerY) < 4) return;
  const enemy = {
    ...enemyDef,
    x: ex, y: ey,
    displayX: ex * TILE_SIZE,
    displayY: ey * TILE_SIZE,
    currentHp: enemyDef.hp,
    maxHp: enemyDef.hp,
    isDead: false,
    aggro: false,
    aggroRange: ENEMY_CHASE_RANGE,
    lastMove: Date.now(),
    moveCooldown: 1500 + rand(0, 2000),
  };
  worldEnemies.push(enemy);
}

function WorldSystem_updateEnemies(dt, saveData, areaId, playerX, playerY) {
  const now = Date.now();
  for (const enemy of worldEnemies) {
    if (enemy.isDead) continue;
    if (enemy.currentHp <= 0) {
      enemy.isDead = true;
      continue;
    }
    const dx = playerX - enemy.x;
    const dy = playerY - enemy.y;
    const dist = Math.abs(dx) + Math.abs(dy);
    enemy.aggro = dist < ENEMY_CHASE_RANGE / TILE_SIZE;
    if (enemy.aggro && now - enemy.lastMove > enemy.moveCooldown) {
      enemy.lastMove = now;
      const moveX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
      const moveY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
      if (Math.abs(dx) >= Math.abs(dy)) {
        if (!isSolid(areaId, enemy.x + moveX, enemy.y)) enemy.x += moveX;
        else if (!isSolid(areaId, enemy.x, enemy.y + moveY)) enemy.y += moveY;
      } else {
        if (!isSolid(areaId, enemy.x, enemy.y + moveY)) enemy.y += moveY;
        else if (!isSolid(areaId, enemy.x + moveX, enemy.y)) enemy.x += moveX;
      }
    } else if (!enemy.aggro && now - enemy.lastMove > enemy.moveCooldown + 1000) {
      enemy.lastMove = now;
      if (Math.random() < 0.3) {
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        const dir = dirs[rand(0, 3)];
        const nx = enemy.x + dir[0];
        const ny = enemy.y + dir[1];
        if (!isSolid(areaId, nx, ny)) {
          enemy.x = nx;
          enemy.y = ny;
        }
      }
    }
    enemy.displayX = enemy.x * TILE_SIZE;
    enemy.displayY = enemy.y * TILE_SIZE;
  }
  worldEnemies = worldEnemies.filter(e => !e.isDead);
  WorldSystem_spawnEnemies(saveData, areaId, playerX, playerY);
}

function WorldSystem_getEnemyAt(tx, ty) {
  return worldEnemies.find(e => e.x === tx && e.y === ty && !e.isDead) || null;
}

function WorldSystem_checkEnemyCollision(tx, ty) {
  return worldEnemies.some(e => e.x === tx && e.y === ty && !e.isDead);
}

function WorldSystem_renderEnemies(ctx, camX, camY, areaId) {
  for (const enemy of worldEnemies) {
    if (enemy.isDead) continue;
    const sx = enemy.x * TILE_SIZE - camX;
    const sy = enemy.y * TILE_SIZE - camY;
    const size = TILE_SIZE - 4;
    ctx.fillStyle = enemy.aggro ? '#ff4444' : '#ff8844';
    ctx.fillRect(sx + 2, sy + 2, size, size);
    ctx.fillStyle = enemy.color !== undefined ? '#' + enemy.color.toString(16).padStart(6, '0') : '#ff8844';
    ctx.fillRect(sx + 4, sy + 4, size - 4, size - 4);
    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(enemy.icon || '?', sx + TILE_SIZE / 2, sy + TILE_SIZE / 2 + 5);
  }
}

function WorldSystem_getNpcsForArea(areaId) {
  const mapDef = getMapData(areaId);
  if (!mapDef) return [];
  return mapDef.npcs.map(id => getNpc(id)).filter(Boolean);
}

function WorldSystem_initChests(areaId, saveData) {
  if (worldChests.length > 0) return;
  const chestPositions = {
    mosswood: [{ x: 8, y: 3 }, { x: 1, y: 5 }],
    enchanted_forest: [{ x: 3, y: 3 }, { x: 10, y: 10 }, { x: 5, y: 8 }],
    caves: [{ x: 5, y: 4 }, { x: 12, y: 10 }],
    mountains: [{ x: 8, y: 5 }, { x: 3, y: 10 }],
    snowy_peaks: [{ x: 6, y: 3 }, { x: 10, y: 8 }],
    volcano: [{ x: 8, y: 4 }, { x: 14, y: 10 }],
    ruins: [{ x: 4, y: 5 }, { x: 12, y: 8 }],
    temple: [{ x: 5, y: 3 }, { x: 12, y: 6 }],
  };
  const positions = chestPositions[areaId] || [];
  for (const pos of positions) {
    const opened = saveData.player.unlockedChests || [];
    const chestKey = `${areaId}_${pos.x}_${pos.y}`;
    worldChests.push({
      x: pos.x, y: pos.y,
      opened: opened.includes(chestKey),
      key: chestKey,
      loot: generateChestLoot(saveData, areaId)
    });
  }
}

function generateChestLoot(saveData, areaId) {
  const lootTables = {
    mosswood: [{ id: 'health_potion', qty: rand(1, 2) }, { id: 'mana_potion', qty: rand(1, 2) }, { id: 'enchanted_essence', qty: rand(2, 4) }],
    enchanted_forest: [{ id: 'crystal_staff', qty: 1 }, { id: 'great_health_potion', qty: rand(1, 2) }, { id: 'fire_nectar', qty: rand(1, 3) }],
    caves: [{ id: 'ice_crystal', qty: rand(2, 4) }, { id: 'earth_core', qty: rand(2, 3) }, { id: 'mana_crystal', qty: 1 }],
    mountains: [{ id: 'thunder_essence', qty: rand(2, 3) }, { id: 'wind_feather', qty: rand(2, 4) }, { id: 'ring_of_power', qty: 1 }],
    snowy_peaks: [{ id: 'ice_crystal', qty: rand(3, 5) }, { id: 'mana_potion', qty: rand(2, 3) }, { id: 'frost_staff', qty: 1 }],
    volcano: [{ id: 'fire_nectar', qty: rand(3, 5) }, { id: 'great_health_potion', qty: rand(2, 3) }, { id: 'flame_staff', qty: 1 }],
    ruins: [{ id: 'shadow_shard', qty: rand(2, 3) }, { id: 'great_mana_potion', qty: rand(1, 2) }, { id: 'shadow_robe', qty: 1 }],
    temple: [{ id: 'mythos_shard', qty: 1 }, { id: 'full_elixir', qty: 1 }, { id: 'mythos_staff', qty: 1 }],
  };
  const table = lootTables[areaId] || [{ id: 'enchanted_essence', qty: 1 }];
  const loot = [];
  const count = rand(1, Math.min(3, table.length));
  const shuffled = [...table].sort(() => Math.random() - 0.5);
  for (let i = 0; i < count; i++) {
    loot.push({ ...shuffled[i] });
  }
  return loot;
}

function WorldSystem_openChest(saveData, tx, ty) {
  const chest = worldChests.find(c => c.x === tx && c.y === ty && !c.opened);
  if (!chest) return null;
  chest.opened = true;
  if (!saveData.player.unlockedChests) saveData.player.unlockedChests = [];
  saveData.player.unlockedChests.push(chest.key);
  for (const loot of chest.loot) {
    InventorySystem.addItem(saveData, loot.id, loot.qty);
  }
  AudioSystem.playSfx('chest');
  const goldBonus = rand(5, 20);
  saveData.player.gold += goldBonus;
  return { loot: chest.loot, gold: goldBonus };
}

function WorldSystem_getChestAt(tx, ty) {
  return worldChests.find(c => c.x === tx && c.y === ty) || null;
}

function WorldSystem_renderChests(ctx, camX, camY) {
  for (const chest of worldChests) {
    const sx = chest.x * TILE_SIZE - camX;
    const sy = chest.y * TILE_SIZE - camY;
    ctx.fillStyle = chest.opened ? '#6a4a2a' : '#cc9933';
    ctx.fillRect(sx + 4, sy + 2, TILE_SIZE - 8, TILE_SIZE - 4);
    ctx.fillStyle = chest.opened ? '#4a3a1a' : '#ffdd44';
    ctx.fillRect(sx + 6, sy, TILE_SIZE - 12, 6);
    if (!chest.opened) {
      ctx.fillStyle = '#ffd700';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('?', sx + TILE_SIZE / 2, sy + TILE_SIZE / 2 + 5);
    }
  }
}