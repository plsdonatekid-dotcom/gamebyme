const ITEMS = {
  health_potion: { id: 'health_potion', name: 'Health Potion', type: 'consumable', desc: 'Restores 50 HP.', value: 15, healHp: 50, icon: '❤', rarity: 'common' },
  mana_potion: { id: 'mana_potion', name: 'Mana Potion', type: 'consumable', desc: 'Restores 30 MP.', value: 20, healMp: 30, icon: '💧', rarity: 'common' },
  great_health_potion: { id: 'great_health_potion', name: 'Great Health Potion', type: 'consumable', desc: 'Restores 150 HP.', value: 40, healHp: 150, icon: '♥', rarity: 'uncommon' },
  great_mana_potion: { id: 'great_mana_potion', name: 'Great Mana Potion', type: 'consumable', desc: 'Restores 80 MP.', value: 45, healMp: 80, icon: '💎', rarity: 'uncommon' },
  full_elixir: { id: 'full_elixir', name: 'Full Elixir', type: 'consumable', desc: 'Fully restores HP and MP.', value: 200, healHp: 999, healMp: 999, icon: '✨', rarity: 'rare' },

  wooden_staff: { id: 'wooden_staff', name: 'Wooden Staff', type: 'weapon', desc: 'A simple wooden staff.', value: 10, atk: 3, matk: 5, icon: '🪄', rarity: 'common' },
  crystal_staff: { id: 'crystal_staff', name: 'Crystal Staff', type: 'weapon', desc: 'A staff with a crystal focus.', value: 80, atk: 5, matk: 15, icon: '🔮', rarity: 'uncommon' },
  flame_staff: { id: 'flame_staff', name: 'Flame Staff', type: 'weapon', desc: 'A staff imbued with fire.', value: 150, atk: 7, matk: 22, icon: '🔥', rarity: 'rare' },
  frost_staff: { id: 'frost_staff', name: 'Frost Staff', type: 'weapon', desc: 'A staff of eternal ice.', value: 160, atk: 6, matk: 24, icon: '❄️', rarity: 'rare' },
  thunder_staff: { id: 'thunder_staff', name: 'Thunder Staff', type: 'weapon', desc: 'Crackling with lightning.', value: 180, atk: 8, matk: 26, icon: '⚡', rarity: 'rare' },
  arcane_staff: { id: 'arcane_staff', name: 'Arcane Staff', type: 'weapon', desc: 'Humming with pure magic.', value: 250, atk: 10, matk: 35, icon: '🌀', rarity: 'epic' },
  mythos_staff: { id: 'mythos_staff', name: 'Mythos Staff', type: 'weapon', desc: 'The legendary staff of the isles.', value: 500, atk: 15, matk: 50, icon: '🌟', rarity: 'legendary' },

  cloth_robe: { id: 'cloth_robe', name: 'Cloth Robe', type: 'armor', desc: 'A simple cloth robe.', value: 10, def: 2, icon: '👘', rarity: 'common' },
  leather_robe: { id: 'leather_robe', name: 'Leather Robe', type: 'armor', desc: 'A sturdy leather robe.', value: 50, def: 5, icon: '🛡️', rarity: 'uncommon' },
  enchanted_robe: { id: 'enchanted_robe', name: 'Enchanted Robe', type: 'armor', desc: 'Glows with protective magic.', value: 120, def: 9, icon: '🔵', rarity: 'rare' },
  shadow_robe: { id: 'shadow_robe', name: 'Shadow Robe', type: 'armor', desc: 'Woven from shadow essence.', value: 200, def: 13, icon: '⬛', rarity: 'epic' },
  mythos_robe: { id: 'mythos_robe', name: 'Mythos Robe', type: 'armor', desc: 'The legendary robe.', value: 400, def: 20, icon: '💜', rarity: 'legendary' },

  ring_of_power: { id: 'ring_of_power', name: 'Ring of Power', type: 'accessory', desc: 'Increases magic power.', value: 100, matk: 8, icon: '💍', rarity: 'rare' },
  amulet_of_protection: { id: 'amulet_of_protection', name: 'Amulet of Protection', type: 'accessory', desc: 'Enhances defenses.', value: 100, def: 6, icon: '📿', rarity: 'rare' },
  mana_crystal: { id: 'mana_crystal', name: 'Mana Crystal', type: 'accessory', desc: 'Boosts mana regeneration.', value: 80, manaRegen: 2, icon: '💠', rarity: 'uncommon' },

  enchanted_essence: { id: 'enchanted_essence', name: 'Enchanted Essence', type: 'material', desc: 'Raw magical essence.', value: 25, icon: '🟣', rarity: 'common' },
  fire_nectar: { id: 'fire_nectar', name: 'Fire Nectar', type: 'material', desc: 'Essence of fire.', value: 35, icon: '🟠', rarity: 'uncommon' },
  ice_crystal: { id: 'ice_crystal', name: 'Ice Crystal', type: 'material', desc: 'Frozen magic.', value: 35, icon: '🔷', rarity: 'uncommon' },
  thunder_essence: { id: 'thunder_essence', name: 'Thunder Essence', type: 'material', desc: 'Sparkling electricity.', value: 40, icon: '🟡', rarity: 'uncommon' },
  earth_core: { id: 'earth_core', name: 'Earth Core', type: 'material', desc: 'Heart of the earth.', value: 30, icon: '🟤', rarity: 'common' },
  wind_feather: { id: 'wind_feather', name: 'Wind Feather', type: 'material', desc: 'Light as air.', value: 30, icon: '🪶', rarity: 'common' },
  shadow_shard: { id: 'shadow_shard', name: 'Shadow Shard', type: 'material', desc: 'Dark essence.', value: 50, icon: '⚫', rarity: 'rare' },
  mythos_shard: { id: 'mythos_shard', name: 'Mythos Shard', type: 'material', desc: 'A fragment of legend.', value: 100, icon: '💫', rarity: 'epic' },

  enchanted_key: { id: 'enchanted_key', name: 'Enchanted Key', type: 'key', desc: 'Opens magical doors.', value: 0, icon: '🗝️', rarity: 'rare' },
  treasure_map: { id: 'treasure_map', name: 'Treasure Map', type: 'quest', desc: 'Marks a hidden treasure.', value: 0, icon: '🗺️', rarity: 'uncommon' },
};

const ITEM_ARRAY = Object.values(ITEMS);

function getItem(id) { return ITEMS[id] || null; }