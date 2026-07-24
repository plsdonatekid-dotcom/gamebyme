const CRAFTING_RECIPES = [
  { id: 'health_potion_craft', name: 'Health Potion', result: 'health_potion', qty: 1,
    materials: { enchanted_essence: 2 }, type: 'potion', icon: '❤' },
  { id: 'mana_potion_craft', name: 'Mana Potion', result: 'mana_potion', qty: 1,
    materials: { enchanted_essence: 2 }, type: 'potion', icon: '💧' },
  { id: 'great_health_potion_craft', name: 'Great Health Potion', result: 'great_health_potion', qty: 1,
    materials: { enchanted_essence: 3, earth_core: 1 }, type: 'potion', icon: '♥' },
  { id: 'great_mana_potion_craft', name: 'Great Mana Potion', result: 'great_mana_potion', qty: 1,
    materials: { enchanted_essence: 3, ice_crystal: 1 }, type: 'potion', icon: '💎' },
  { id: 'crystal_staff_craft', name: 'Crystal Staff', result: 'crystal_staff', qty: 1,
    materials: { enchanted_essence: 5, earth_core: 3 }, type: 'weapon', icon: '🔮' },
  { id: 'flame_staff_craft', name: 'Flame Staff', result: 'flame_staff', qty: 1,
    materials: { fire_nectar: 4, enchanted_essence: 6 }, type: 'weapon', icon: '🔥' },
  { id: 'frost_staff_craft', name: 'Frost Staff', result: 'frost_staff', qty: 1,
    materials: { ice_crystal: 4, enchanted_essence: 6 }, type: 'weapon', icon: '❄️' },
  { id: 'thunder_staff_craft', name: 'Thunder Staff', result: 'thunder_staff', qty: 1,
    materials: { thunder_essence: 4, enchanted_essence: 6 }, type: 'weapon', icon: '⚡' },
  { id: 'enchanted_robe_craft', name: 'Enchanted Robe', result: 'enchanted_robe', qty: 1,
    materials: { enchanted_essence: 8, earth_core: 4 }, type: 'armor', icon: '🔵' },
  { id: 'shadow_robe_craft', name: 'Shadow Robe', result: 'shadow_robe', qty: 1,
    materials: { shadow_shard: 3, enchanted_essence: 10 }, type: 'armor', icon: '⬛' },
  { id: 'ring_of_power_craft', name: 'Ring of Power', result: 'ring_of_power', qty: 1,
    materials: { enchanted_essence: 5, mythos_shard: 2 }, type: 'accessory', icon: '💍' },
  { id: 'amulet_craft', name: 'Amulet of Protection', result: 'amulet_of_protection', qty: 1,
    materials: { enchanted_essence: 5, earth_core: 3 }, type: 'accessory', icon: '📿' },
  { id: 'mana_crystal_craft', name: 'Mana Crystal', result: 'mana_crystal', qty: 1,
    materials: { enchanted_essence: 4, ice_crystal: 2 }, type: 'accessory', icon: '💠' },
];

const CRAFTING_TYPES = ['potion', 'weapon', 'armor', 'accessory'];

function getRecipe(id) { return CRAFTING_RECIPES.find(r => r.id === id); }

function canCraft(recipe, inventory) {
  for (const [matId, qty] of Object.entries(recipe.materials)) {
    const held = inventory[matId] || 0;
    if (held < qty) return false;
  }
  return true;
}

function getRecipesByType(type) {
  return CRAFTING_RECIPES.filter(r => r.type === type);
}