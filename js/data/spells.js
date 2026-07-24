const SPELLS = {
  magic_bolt: {
    id: 'magic_bolt', name: 'Magic Bolt', icon: '🔮', desc: 'A basic magic projectile.',
    cost: 5, cooldown: 500, damage: 10, type: 'arcane', tier: 1, aoe: false, color: 0x8888ff,
    effect: 'bolt', unlockLevel: 1
  },
  fireball: {
    id: 'fireball', name: 'Fireball', icon: '🔥', desc: 'A blazing sphere of fire.',
    cost: 12, cooldown: 1200, damage: 25, type: 'fire', tier: 2, aoe: true, color: 0xff4400,
    effect: 'explosion', unlockLevel: 3
  },
  ice_shard: {
    id: 'ice_shard', name: 'Ice Shard', icon: '❄️', desc: 'A piercing shard of ice.',
    cost: 10, cooldown: 1000, damage: 20, type: 'ice', tier: 2, aoe: false, color: 0x88ddff,
    effect: 'bolt', unlockLevel: 4
  },
  lightning: {
    id: 'lightning', name: 'Lightning Bolt', icon: '⚡', desc: 'Call down lightning.',
    cost: 18, cooldown: 1500, damage: 35, type: 'lightning', tier: 3, aoe: true, color: 0xffff00,
    effect: 'lightning', unlockLevel: 6
  },
  earth_spike: {
    id: 'earth_spike', name: 'Earth Spike', icon: '🪨', desc: 'Spikes erupt from the ground.',
    cost: 8, cooldown: 900, damage: 15, type: 'earth', tier: 2, aoe: false, color: 0x886633,
    effect: 'bolt', unlockLevel: 5
  },
  wind_gust: {
    id: 'wind_gust', name: 'Wind Gust', icon: '🌪️', desc: 'A powerful blast of wind.',
    cost: 7, cooldown: 700, damage: 12, type: 'wind', tier: 1, aoe: false, color: 0xaaddaa,
    effect: 'bolt', unlockLevel: 2
  },
  arcane_blast: {
    id: 'arcane_blast', name: 'Arcane Blast', icon: '🌀', desc: 'Pure arcane energy.',
    cost: 25, cooldown: 2000, damage: 50, type: 'arcane', tier: 4, aoe: true, color: 0xcc44ff,
    effect: 'explosion', unlockLevel: 10
  },
  heal: {
    id: 'heal', name: 'Heal', icon: '💚', desc: 'Restores health.', cost: 15, cooldown: 3000,
    damage: -40, type: 'healing', tier: 2, aoe: false, color: 0x44ff44, effect: 'heal', unlockLevel: 3
  },
  shield: {
    id: 'shield', name: 'Magic Shield', icon: '🛡️', desc: 'Reduces incoming damage.',
    cost: 10, cooldown: 5000, damage: 0, type: 'arcane', tier: 2, aoe: false, color: 0x88aaff,
    effect: 'shield', unlockLevel: 5
  },
  firestorm: {
    id: 'firestorm', name: 'Firestorm', icon: '🌋', desc: 'Devastating rain of fire.',
    cost: 35, cooldown: 4000, damage: 60, type: 'fire', tier: 5, aoe: true, color: 0xff2200,
    effect: 'explosion', unlockLevel: 15
  },
  blizzard: {
    id: 'blizzard', name: 'Blizzard', icon: '🌨️', desc: 'Freezing ice storm.',
    cost: 30, cooldown: 3500, damage: 55, type: 'ice', tier: 5, aoe: true, color: 0xaaddff,
    effect: 'explosion', unlockLevel: 16
  },
  thunderstorm: {
    id: 'thunderstorm', name: 'Thunderstorm', icon: '🌩️', desc: 'Electrify the battlefield.',
    cost: 40, cooldown: 4500, damage: 70, type: 'lightning', tier: 5, aoe: true, color: 0xffff44,
    effect: 'lightning', unlockLevel: 18
  },
  meteor: {
    id: 'meteor', name: 'Meteor', icon: '☄️', desc: 'Call a meteor from the sky.',
    cost: 50, cooldown: 6000, damage: 90, type: 'earth', tier: 6, aoe: true, color: 0xff6600,
    effect: 'explosion', unlockLevel: 22
  },
  arcane_beam: {
    id: 'arcane_beam', name: 'Arcane Beam', icon: '💫', desc: 'A continuous beam of magic.',
    cost: 20, cooldown: 800, damage: 15, type: 'arcane', tier: 3, aoe: false, color: 0xff66ff,
    effect: 'bolt', unlockLevel: 8
  },
  mythos_judgment: {
    id: 'mythos_judgment', name: 'Mythos Judgment', icon: '✨', desc: 'The ultimate spell.',
    cost: 80, cooldown: 10000, damage: 150, type: 'arcane', tier: 7, aoe: true, color: 0xffffff,
    effect: 'explosion', unlockLevel: 30
  },
};

const SPELL_ARRAY = Object.values(SPELLS);

function getSpell(id) { return SPELLS[id] || null; }

function getSpellsForLevel(level) {
  return SPELL_ARRAY.filter(s => s.unlockLevel <= level);
}

function getSpellTier(tier) {
  return SPELL_ARRAY.filter(s => s.tier === tier);
}