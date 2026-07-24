const InventorySystem = {
  addItem(saveData, itemId, qty = 1) {
    const inv = saveData.player.inventory;
    const current = inv[itemId] || 0;
    inv[itemId] = current + qty;
    return true;
  },

  removeItem(saveData, itemId, qty = 1) {
    const inv = saveData.player.inventory;
    const current = inv[itemId] || 0;
    if (current < qty) return false;
    inv[itemId] = current - qty;
    if (inv[itemId] <= 0) delete inv[itemId];
    return true;
  },

  hasItem(saveData, itemId, qty = 1) {
    return (saveData.player.inventory[itemId] || 0) >= qty;
  },

  countItem(saveData, itemId) {
    return saveData.player.inventory[itemId] || 0;
  },

  getAllItems(saveData) {
    const items = [];
    for (const [id, qty] of Object.entries(saveData.player.inventory)) {
      const def = getItem(id);
      if (def) items.push({ ...def, qty });
    }
    return items;
  },

  getItemsByType(saveData, type) {
    return this.getAllItems(saveData).filter(i => i.type === type);
  },

  equip(saveData, itemId) {
    const item = getItem(itemId);
    if (!item) return false;
    if (item.type !== 'weapon' && item.type !== 'armor' && item.type !== 'accessory') return false;
    const slot = item.type === 'weapon' ? 'weapon' : item.type === 'armor' ? 'armor' : 'accessory';
    const current = saveData.player.equipped[slot];
    if (current) {
      this.addItem(saveData, current, 1);
    }
    saveData.player.equipped[slot] = itemId;
    this.removeItem(saveData, itemId, 1);
    return true;
  },

  unequip(saveData, slot) {
    const current = saveData.player.equipped[slot];
    if (!current) return false;
    this.addItem(saveData, current, 1);
    saveData.player.equipped[slot] = null;
    return true;
  },

  getEquippedStats(saveData) {
    const stats = { atk: 0, def: 0, matk: 0, manaRegen: 0 };
    for (const slot of ['weapon', 'armor', 'accessory']) {
      const id = saveData.player.equipped[slot];
      if (id) {
        const item = getItem(id);
        if (item) {
          stats.atk += item.atk || 0;
          stats.def += item.def || 0;
          stats.matk += item.matk || 0;
          stats.manaRegen += item.manaRegen || 0;
        }
      }
    }
    return stats;
  }
};