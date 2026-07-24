const CraftingSystem = {
  craft(saveData, recipeId, qty = 1) {
    const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return false;
    for (let i = 0; i < qty; i++) {
      if (!canCraft(recipe, saveData.player.inventory)) return false;
      for (const [matId, needQty] of Object.entries(recipe.materials)) {
        InventorySystem.removeItem(saveData, matId, needQty);
      }
      InventorySystem.addItem(saveData, recipe.result, recipe.qty || 1);
      PlayerSystem.addXp(saveData, Math.floor(recipe.qty || 1) * 5);
    }
    return true;
  },

  getCraftable(saveData) {
    return CRAFTING_RECIPES.filter(r => canCraft(r, saveData.player.inventory));
  },

  getRecipesByType(saveData, type) {
    return CRAFTING_RECIPES.filter(r => r.type === type);
  }
};