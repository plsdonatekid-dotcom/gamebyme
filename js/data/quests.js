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
};

const QUEST_ARRAY = Object.values(QUESTS);

function getQuest(id) { return QUESTS[id] || null; }

function isQuestUnlocked(quest, completedQuestIds) {
  if (quest.completed) return false;
  if (!quest.prereq) return true;
  return completedQuestIds.includes(quest.prereq);
}