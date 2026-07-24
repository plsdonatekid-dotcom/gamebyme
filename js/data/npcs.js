const NPCS = {
  elder_wisdom: {
    id: 'elder_wisdom', name: 'Elder Wisdom', icon: '🧙', color: 0x8888ff,
    desc: 'An old sage with kind eyes.', area: 'mosswood',
    dialogues: {
      first: { text: 'Welcome, traveler, to the Mythos Isles. Dark times have fallen upon us.', choices: [
        { text: 'Tell me more.', next: 'intro2' },
        { text: 'I must be going.', next: null }
      ]},
      intro2: { text: 'The magical balance is broken. Strange creatures roam free, and ancient evils stir. Will you help us restore peace?', choices: [
        { text: 'I will help.', next: 'quest_accept', action: 'startQuest_awakening' },
        { text: "I'm not ready yet.", next: null }
      ]},
      quest_accept: { text: 'Thank you! Start by exploring the Forest of Whispers. Find the source of the corruption there.', choices: [
        { text: 'I will return.', next: null }
      ]},
      default: { text: 'Have you found the source of corruption in the forest?', choices: [
        { text: 'Not yet.', next: null },
        { text: 'Tell me about the isles.', next: 'lore' }
      ]},
      lore: { text: 'These isles were once a paradise, held together by the Heartstone. It shattered, and now darkness seeps through the cracks. Find the shards to restore it.', choices: [
        { text: 'I see. Farewell.', next: null }
      ]},
    }
  },
  merchant_maya: {
    id: 'merchant_maya', name: 'Merchant Maya', icon: '👩', color: 0xffaa44,
    desc: 'A friendly traveling merchant.', area: 'mosswood',
    dialogues: {
      first: { text: 'Welcome to my humble stall! I have wares if you have coin.', choices: [
        { text: 'Show me your goods.', next: null, action: 'openShop' },
        { text: 'Maybe later.', next: null }
      ]},
      default: { text: 'Looking to buy or sell?', choices: [
        { text: 'Trade.', next: null, action: 'openShop' },
        { text: 'Not now.', next: null }
      ]},
    }
  },
  blacksmith_borin: {
    id: 'blacksmith_borin', name: 'Blacksmith Borin', icon: '⚒️', color: 0xff8844,
    desc: 'A stout dwarf with a hammer.', area: 'mosswood',
    dialogues: {
      first: { text: 'Hmph, another wanderer. If you have materials, I can craft you something fine.', choices: [
        { text: 'What can you make?', next: null, action: 'openCrafting' },
        { text: 'Not interested.', next: null }
      ]},
      default: { text: 'Got any good materials for me?', choices: [
        { text: 'Let\'s craft.', next: null, action: 'openCrafting' },
        { text: 'No thanks.', next: null }
      ]},
    }
  },
  scholar_luna: {
    id: 'scholar_luna', name: 'Scholar Luna', icon: '📚', color: 0x88aaff,
    desc: 'A studious mage.', area: 'wizard_tower',
    dialogues: {
      first: { text: 'Oh! A visitor! I study the arcane arts. Perhaps I can teach you something.', choices: [
        { text: 'Teach me magic.', next: 'magic_lessons' },
        { text: 'I\'m fine, thanks.', next: null }
      ]},
      magic_lessons: { text: 'Magic flows through all things. To master it, you must first understand the elements. Practice with the spells you know, and return when you\'ve grown stronger.', choices: [
        { text: 'I will practice.', next: null }
      ]},
      default: { text: 'Practicing your magic? Good. There\'s always more to learn.', choices: [
        { text: 'Farewell.', next: null }
      ]},
    }
  },
  forest_guardian_lyra: {
    id: 'forest_guardian_lyra', name: 'Guardian Lyra', icon: '🧝', color: 0x66dd88,
    desc: 'A tall elf with a bow.', area: 'enchanted_forest',
    dialogues: {
      first: { text: 'The forest is restless. Dark spirits have been stirring since the Heartstone shattered. Can you feel it?', choices: [
        { text: 'I can. I\'m here to help.', next: 'help_forest' },
        { text: 'I\'ll be careful.', next: null }
      ]},
      help_forest: { text: 'Then enter the deeper woods. The corruption festers near the old shrine. Bring light to the darkness.', choices: [
        { text: 'I will.', next: null, action: 'startQuest_forest_corruption' }
      ]},
      default: { text: 'The forest needs you. Clear the corruption at the shrine.', choices: [
        { text: 'On it.', next: null }
      ]},
    }
  },
  elder_volcano: {
    id: 'elder_volcano', name: 'Sage Ignis', icon: '🔥', color: 0xff6622,
    desc: 'A fire mage tending the volcano.', area: 'volcano',
    dialogues: {
      first: { text: 'The volcano stirs with ancient power. Deep within lies the Crimson Phoenix, guardian of the Flame Shard.', choices: [
        { text: 'I seek the shard.', next: 'volcano_quest' },
        { text: 'I\'m just exploring.', next: null }
      ]},
      volcano_quest: { text: 'Then steel yourself. The Phoenix will not yield its treasure lightly. Defeat it, and you may claim the Flame Shard of the Heartstone.', choices: [
        { text: 'I\'m ready.', next: null, action: 'startQuest_volcano_trial' },
        { text: 'I need to prepare.', next: null }
      ]},
      default: { text: 'The fire within burns bright. Are you ready to face it?', choices: [
        { text: 'Not yet.', next: null }
      ]},
    }
  },
};

const NPC_ARRAY = Object.values(NPCS);

function getNpc(id) { return NPCS[id] || null; }

function getNpcsForArea(area) {
  return NPC_ARRAY.filter(n => n.area === area);
}