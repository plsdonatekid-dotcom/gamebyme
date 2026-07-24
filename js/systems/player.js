const PlayerSystem = {
  getTotalAtk(saveData) {
    const base = saveData.player.baseAtk + Math.floor(saveData.player.level * 0.5);
    const equip = InventorySystem.getEquippedStats(saveData);
    return base + equip.atk;
  },

  getTotalDef(saveData) {
    const base = saveData.player.baseDef + Math.floor(saveData.player.level * 0.3);
    const equip = InventorySystem.getEquippedStats(saveData);
    return base + equip.def;
  },

  getTotalMatk(saveData) {
    const base = saveData.player.baseMatk + Math.floor(saveData.player.level * 0.8);
    const equip = InventorySystem.getEquippedStats(saveData);
    return base + equip.matk;
  },

  getMaxHp(saveData) {
    return saveData.player.maxHp + (saveData.player.level - 1) * 10;
  },

  getMaxMp(saveData) {
    return saveData.player.maxMp + (saveData.player.level - 1) * 5;
  },

  xpForLevel(level) {
    return Math.floor(100 * Math.pow(1.15, level - 1));
  },

  addXp(saveData, amount) {
    saveData.player.xp += amount;
    let leveled = false;
    while (saveData.player.xp >= saveData.player.xpToNext && saveData.player.level < MAX_LEVEL) {
      saveData.player.xp -= saveData.player.xpToNext;
      saveData.player.level++;
      saveData.player.xpToNext = this.xpForLevel(saveData.player.level);
      saveData.player.maxHp = this.getMaxHp(saveData);
      saveData.player.maxMp = this.getMaxMp(saveData);
      saveData.player.hp = saveData.player.maxHp;
      saveData.player.mp = saveData.player.maxMp;
      this.unlockSpellsForLevel(saveData, saveData.player.level);
      leveled = true;
    }
    return leveled;
  },

  takeDamage(saveData, amount) {
    const def = this.getTotalDef(saveData);
    const reduced = Math.max(1, Math.floor(amount * (100 / (100 + def))));
    saveData.player.hp -= reduced;
    if (saveData.player.hp <= 0) {
      saveData.player.hp = 0;
      return true;
    }
    return false;
  },

  heal(saveData, amount) {
    saveData.player.hp = Math.min(this.getMaxHp(saveData), saveData.player.hp + amount);
  },

  restoreMp(saveData, amount) {
    saveData.player.mp = Math.min(this.getMaxMp(saveData), saveData.player.mp + amount);
  },

  canCast(saveData, spellId) {
    const spell = getSpell(spellId);
    if (!spell) return false;
    if (!saveData.player.unlockedSpells.includes(spellId)) return false;
    if (saveData.player.mp < spell.cost) return false;
    return true;
  },

  castSpell(saveData, spellId) {
    const spell = getSpell(spellId);
    if (!this.canCast(saveData, spellId)) return false;
    saveData.player.mp -= spell.cost;
    const matk = this.getTotalMatk(saveData);
    const damage = Math.floor(spell.damage + matk * 0.5);
    return { spell, damage };
  },

  unlockSpellsForLevel(saveData, level) {
    for (const spell of SPELL_ARRAY) {
      if (spell.unlockLevel <= level && !saveData.player.unlockedSpells.includes(spell.id)) {
        saveData.player.unlockedSpells.push(spell.id);
        const emptySlot = saveData.player.spellSlots.indexOf(null);
        if (emptySlot >= 0) {
          saveData.player.spellSlots[emptySlot] = spell.id;
        }
      }
    }
  },

  addGold(saveData, amount) {
    saveData.player.gold += amount;
  },

  spendGold(saveData, amount) {
    if (saveData.player.gold < amount) return false;
    saveData.player.gold -= amount;
    return true;
  },

  killEnemy(saveData, enemyId) {
    saveData.player.enemyKills[enemyId] = (saveData.player.enemyKills[enemyId] || 0) + 1;
  },

  isDead(saveData) {
    return saveData.player.hp <= 0;
  },

  revive(saveData) {
    saveData.player.hp = Math.floor(this.getMaxHp(saveData) * 0.5);
    saveData.player.mp = Math.floor(this.getMaxMp(saveData) * 0.3);
  }
};