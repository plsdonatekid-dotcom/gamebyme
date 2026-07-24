const SAVE_KEY = 'mythos_isles_save';

function createNewSave() {
  return {
    version: 1,
    player: {
      name: 'Adventurer',
      level: 1,
      xp: 0,
      xpToNext: 100,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      baseAtk: 5,
      baseDef: 2,
      baseMatk: 5,
      gold: 0,
      area: 'mosswood',
      x: 3, y: 13,
      equipped: { weapon: null, armor: null, accessory: null },
      spellSlots: ['magic_bolt', null, null, null, null],
      unlockedSpells: ['magic_bolt'],
      inventory: {},
      activeQuests: [],
      completedQuests: [],
      questProgress: {},
      enemyKills: {},
      unlockedChests: [],
      playTime: 0,
    },
    timestamp: Date.now()
  };
}

function saveGame(saveData) {
  try {
    saveData.timestamp = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch (e) {
    console.warn('Save failed:', e);
    return false;
  }
}

function loadGame() {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (parsed.version !== 1) return null;
    return parsed;
  } catch (e) {
    console.warn('Load failed:', e);
    return null;
  }
}

function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

function autoSave(saveData) {
  if (saveData) {
    saveGame(saveData);
  }
}