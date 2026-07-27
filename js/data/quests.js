const QUESTS = {
  awakening: {
    id: 'awakening', name: 'The Awakening', desc: 'Speak to Elder Wisdom in Mosswood Village.',
    objectives: [{ type: 'talk', target: 'elder_wisdom', count: 1, done: false }],
    rewards: { xp: 50, gold: 20, item: 'health_potion' }, area: 'mosswood', active: false, completed: false
  },
  forest_corruption: {
    id: 'forest_corruption', name: 'Forest Corruption', desc: 'Clear the corruption in the Enchanted Forest shrine.',
    objectives: [{ type: 'kill', target: 'forest_spirit', count: 5, done: false }],
    rewards: { xp: 100, gold: 50, item: 'crystal_staff' }, area: 'enchanted_forest',
    prereq: 'awakening', active: false, completed: false
  },
  treant_menace: {
    id: 'treant_menace', name: 'Treant Menace', desc: 'Defeat Ancient Treant in Whispering Woods.',
    objectives: [{ type: 'kill', target: 'boss_ancient_treant', count: 1, done: false }],
    rewards: { xp: 150, gold: 70, item: 'health_potion' }, area: 'enchanted_forest',
    prereq: 'forest_corruption', active: false, completed: false
  },
  crystal_puzzle: {
    id: 'crystal_puzzle', name: 'Crystal Puzzle', desc: 'Explore Crystal Caverns and collect magic crystals.',
    objectives: [{ type: 'collect', target: 'magic_crystal', count: 5, done: false }],
    rewards: { xp: 180, gold: 80, item: 'health_potion' }, area: 'caves',
    prereq: 'treant_menace', active: false, completed: false
  },
  crystal_guardian_defeat: {
    id: 'crystal_guardian_defeat', name: 'Crystal Guardian', desc: 'Defeat Crystal Guardian in the Crystal Caverns.',
    objectives: [{ type: 'kill', target: 'boss_crystal_guardian', count: 1, done: false }],
    rewards: { xp: 220, gold: 100, item: 'crystal_staff' }, area: 'caves',
    prereq: 'crystal_puzzle', active: false, completed: false
  },
  swamp_poison: {
    id: 'swamp_poison', name: 'Swamp Poison', desc: 'Clear the Enchanted Swamp of swamp witches.',
    objectives: [{ type: 'kill', target: 'swamp_witch', count: 5, done: false }],
    rewards: { xp: 200, gold: 90, item: 'health_potion' }, area: 'swamp',
    prereq: 'crystal_guardian_defeat', active: false, completed: false
  },
  hydra_slayer: {
    id: 'hydra_slayer', name: 'Hydra Slayer', desc: 'Defeat Swamp Hydra in the Enchanted Swamp.',
    objectives: [{ type: 'kill', target: 'boss_hydra', count: 1, done: false }],
    rewards: { xp: 350, gold: 150, item: 'ice_crystal' }, area: 'swamp',
    prereq: 'swamp_poison', active: false, completed: false
  },
  frost_climb: {
    id: 'frost_climb', name: 'Frost Climb', desc: 'Reach the Frost Peaks summit.',
    objectives: [{ type: 'explore', target: 'frost_peaks_summit', count: 1, done: false }],
    rewards: { xp: 250, gold: 110, item: 'mana_crystal' }, area: 'frost_peaks',
    prereq: 'hydra_slayer', active: false, completed: false
  },
  dragon_hunt: {
    id: 'dragon_hunt', name: 'Dragon Hunt', desc: 'Defeat Frost Dragon in the Frost Peaks.',
    objectives: [{ type: 'kill', target: 'boss_frost_dragon', count: 1, done: false }],
    rewards: { xp: 500, gold: 220, item: 'mythos_shard' }, area: 'frost_peaks',
    prereq: 'frost_climb', active: false, completed: false
  },
  sky_temple_riddle: {
    id: 'sky_temple_riddle', name: 'Sky Temple Riddle', desc: 'Solve the Sky Temple puzzles and collect ancient relics.',
    objectives: [{ type: 'collect', target: 'ancient_relic', count: 3, done: false }],
    rewards: { xp: 300, gold: 130, item: 'mythos_robe' }, area: 'sky_temple',
    prereq: 'dragon_hunt', active: false, completed: false
  },
  phoenix_defeat: {
    id: 'phoenix_defeat', name: 'Storm Phoenix', desc: 'Defeat Storm Phoenix in the Sky Temple.',
    objectives: [{ type: 'kill', target: 'boss_storm_phoenix', count: 1, done: false }],
    rewards: { xp: 600, gold: 260, item: 'mythos_shard' }, area: 'sky_temple',
    prereq: 'sky_temple_riddle', active: false, completed: false
  },
  library_secrets: {
    id: 'library_secrets', name: 'Library Secrets', desc: 'Research the Arcane Library and collect lore scrolls.',
    objectives: [{ type: 'collect', target: 'lore_scroll', count: 5, done: false }],
    rewards: { xp: 280, gold: 120, item: 'arcanestaff' }, area: 'arcane_library',
    prereq: 'phoenix_defeat', active: false, completed: false
  },
  archivist_boss: {
    id: 'archivist_boss', name: 'Grand Archivist', desc: 'Defeat Grand Archivist in the Arcane Library.',
    objectives: [{ type: 'kill', target: 'boss_grand_archivist', count: 1, done: false }],
    rewards: { xp: 550, gold: 240, item: 'arcanestaff' }, area: 'arcane_library',
    prereq: 'library_secrets', active: false, completed: false
  },
  catacombs_descent: {
    id: 'catacombs_descent', name: 'Catacombs Descent', desc: 'Navigate the Forgotten Catacombs and defeat skeletons.',
    objectives: [{ type: 'kill', target: 'skeleton', count: 10, done: false }],
    rewards: { xp: 350, gold: 150, item: 'mana_crystal' }, area: 'ruins',
    prereq: 'archivist_boss', active: false, completed: false
  },
  lich_king_defeat: {
    id: 'lich_king_defeat', name: 'Lich King', desc: 'Defeat the Lich King in the Forgotten Catacombs.',
    objectives: [{ type: 'kill', target: 'boss_lich_king', count: 1, done: false }],
    rewards: { xp: 700, gold: 300, item: 'mythos_robe' }, area: 'ruins',
    prereq: 'catacombs_descent', active: false, completed: false
  },
  volcano_ascent: {
    id: 'volcano_ascent', name: 'Volcano Ascent', desc: 'Climb Ember Volcano and collect fire nectar.',
    objectives: [{ type: 'collect', target: 'fire_nectar', count: 3, done: false }],
    rewards: { xp: 380, gold: 160, item: 'health_potion' }, area: 'volcano',
    prereq: 'lich_king_defeat', active: false, completed: false
  },
  inferno_titan_battle: {
    id: 'inferno_titan_battle', name: 'Inferno Titan', desc: 'Defeat Inferno Titan in Ember Volcano.',
    objectives: [{ type: 'kill', target: 'boss_inferno_titan', count: 1, done: false }],
    rewards: { xp: 800, gold: 350, item: 'mythos_shard' }, area: 'volcano',
    prereq: 'volcano_ascent', active: false, completed: false
  },
  citadel_trials: {
    id: 'citadel_trials', name: 'Citadel Trials', desc: 'Pass the Wizard\'s Citadel trials by defeating elite dark wizards.',
    objectives: [{ type: 'kill', target: 'elite_dark_wizard', count: 5, done: false }],
    rewards: { xp: 450, gold: 200, item: 'crystal_staff' }, area: 'wizards_citadel',
    prereq: 'inferno_titan_battle', active: false, completed: false
  },
  void_archmage: {
    id: 'void_archmage', name: 'Void Archmage', desc: 'Defeat The Void Archmage in the Wizard\'s Citadel.',
    objectives: [{ type: 'kill', target: 'boss_void_archmage', count: 1, done: false }],
    rewards: { xp: 1000, gold: 500, item: 'mythos_shard' }, area: 'wizards_citadel',
    prereq: 'citadel_trials', active: false, completed: false
  },
  heartstone_restored: {
    id: 'heartstone_restored', name: 'Heartstone Restored', desc: 'Return the Heartstone to Elder Wisdom in Mosswood.',
    objectives: [{ type: 'explore', target: 'mosswood_heartstone', count: 1, done: false }],
    rewards: { xp: 1000, gold: 500, item: 'mythos_shard' }, area: 'mosswood',
    prereq: 'void_archmage', active: false, completed: false
  },
  volcano_trial: {
    id: 'volcano_trial', name: 'Trial of Flame', desc: 'Defeat the Crimson Phoenix in the Volcano.',
    objectives: [{ type: 'kill', target: 'boss_phoenix', count: 1, done: false }],
    rewards: { xp: 500, gold: 200, item: 'mythos_shard' }, area: 'volcano',
    prereq: 'forest_corruption', active: false, completed: false
  },
  cave_exploration: {
    id: 'cave_exploration', name: 'Into the Depths', desc: 'Find the hidden altar in the Crystal Caves.',
    objectives: [{ type: 'explore', target: 'caves_altar', count: 1, done: false }],
    rewards: { xp: 150, gold: 60, item: 'ice_crystal' }, area: 'caves',
    prereq: null, active: false, completed: false
  },
  temple_secret: {
    id: 'temple_secret', name: 'Temple Secret', desc: 'Defeat the Titan Golem in the Ancient Temple.',
    objectives: [{ type: 'kill', target: 'boss_golem', count: 1, done: false }],
    rewards: { xp: 400, gold: 180, item: 'mythos_robe' }, area: 'temple',
    prereq: 'cave_exploration', active: false, completed: false
  },
  ruins_mystery: {
    id: 'ruins_mystery', name: 'Ruins Mystery', desc: 'Defeat the Lich King in the Forgotten Ruins.',
    objectives: [{ type: 'kill', target: 'boss_lich', count: 1, done: false }],
    rewards: { xp: 450, gold: 200, item: 'arcanestaff' }, area: 'ruins',
    prereq: 'temple_secret', active: false, completed: false
  },
  gather_essence: {
    id: 'gather_essence', name: 'Essence Harvest', desc: 'Collect 10 Enchanted Essence from any creatures.',
    objectives: [{ type: 'collect', target: 'enchanted_essence', count: 10, done: false }],
    rewards: { xp: 80, gold: 30, item: 'mana_crystal' }, area: 'mosswood',
    prereq: null, active: false, completed: false
  },
  mushroom_hunt: {
    id: 'mushroom_hunt', name: 'Mushroom Hunt', desc: 'Find 10 rare mushrooms in Enchanted Swamp.',
    objectives: [{ type: 'collect', target: 'fairy_charm', count: 1, done: false }],
    rewards: { xp: 60, gold: 25, item: 'health_potion' }, area: 'swamp',
    prereq: null, active: false, completed: false
  },
  frozen_treasure: {
    id: 'frozen_treasure', name: 'Frozen Treasure', desc: 'Find hidden treasure in Frost Peaks.',
    objectives: [{ type: 'collect', target: 'dragon_scale', count: 1, done: false }],
    rewards: { xp: 90, gold: 40, item: 'ice_crystal' }, area: 'frost_peaks',
    prereq: null, active: false, completed: false
  },
  lost_books: {
    id: 'lost_books', name: 'Lost Books', desc: 'Return 5 lost books to the Arcane Library.',
    objectives: [{ type: 'collect', target: 'arcane_staff', count: 1, done: false }],
    rewards: { xp: 70, gold: 30, item: 'mana_crystal' }, area: 'arcane_library',
    prereq: null, active: false, completed: false
  },
  ghost_stories: {
    id: 'ghost_stories', name: 'Ghost Stories', desc: 'Listen to all ghost stories in the Catacombs.',
    objectives: [{ type: 'collect', target: 'spirit_medium', count: 1, done: false }],
    rewards: { xp: 75, gold: 35, item: 'health_potion' }, area: 'ruins',
    prereq: null, active: false, completed: false
  },
  egg_hunt: {
    id: 'egg_hunt', name: 'Egg Hunt', desc: 'Find 3 companion eggs across the isles.',
    objectives: [{ type: 'collect', target: 'companion_egg', count: 1, done: false }],
    rewards: { xp: 100, gold: 50, item: 'crystal_staff' }, area: 'mosswood',
    prereq: null, active: false, completed: false
  },
};

const QUEST_ARRAY = Object.values(QUESTS);

function getQuest(id) { return QUESTS[id] || null; }

function isQuestUnlocked(quest, completedQuestIds) {
  if (quest.completed) return false;
  if (!quest.prereq) return true;
  return completedQuestIds.includes(quest.prereq);
}
