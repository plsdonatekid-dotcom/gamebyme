const ENEMIES = {
  slime: {
    id: 'slime', name: 'Slime', icon: '🟢', hp: 20, atk: 3, def: 1, xp: 10, gold: 3,
    color: 0x44cc44, drops: [{ id: 'enchanted_essence', chance: 0.3 }], level: 1,
    desc: 'A bouncy blob of magical goo.', areas: ['enchanted_forest', 'mosswood']
  },
  forest_spirit: {
    id: 'forest_spirit', name: 'Forest Spirit', icon: '🌿', hp: 35, atk: 5, def: 2, xp: 18, gold: 5,
    color: 0x66dd88, drops: [{ id: 'earth_core', chance: 0.35 }, { id: 'enchanted_essence', chance: 0.2 }],
    level: 2, desc: 'A guardian of the woods.', areas: ['enchanted_forest', 'mosswood']
  },
  shadow_wisp: {
    id: 'shadow_wisp', name: 'Shadow Wisp', icon: '👻', hp: 25, atk: 7, def: 0, xp: 15, gold: 4,
    color: 0x664488, drops: [{ id: 'shadow_shard', chance: 0.2 }], level: 2,
    desc: 'A faint, flickering shadow.', areas: ['enchanted_forest', 'ruins']
  },
  cave_bat: {
    id: 'cave_bat', name: 'Cave Bat', icon: '🦇', hp: 15, atk: 4, def: 0, xp: 8, gold: 2,
    color: 0x554466, drops: [{ id: 'wind_feather', chance: 0.25 }], level: 1,
    desc: 'Attracted to light and noise.', areas: ['caves']
  },
  rock_golem: {
    id: 'rock_golem', name: 'Rock Golem', icon: '🗿', hp: 60, atk: 8, def: 6, xp: 25, gold: 8,
    color: 0x887766, drops: [{ id: 'earth_core', chance: 0.5 }, { id: 'enchanted_essence', chance: 0.3 }],
    level: 4, desc: 'An ancient being of stone.', areas: ['caves', 'mountains', 'ruins']
  },
  fire_elemental: {
    id: 'fire_elemental', name: 'Fire Elemental', icon: '🔥', hp: 40, atk: 12, def: 2, xp: 22, gold: 7,
    color: 0xff4400, drops: [{ id: 'fire_nectar', chance: 0.4 }], level: 4,
    desc: 'A being of pure flame.', areas: ['volcano']
  },
  frost_wraith: {
    id: 'frost_wraith', name: 'Frost Wraith', icon: '❄️', hp: 45, atk: 10, def: 3, xp: 24, gold: 6,
    color: 0x88ddff, drops: [{ id: 'ice_crystal', chance: 0.4 }], level: 5,
    desc: 'A vengeful spirit of ice.', areas: ['snowy_peaks', 'caves']
  },
  thunder_bird: {
    id: 'thunder_bird', name: 'Thunder Bird', icon: '🦅', hp: 50, atk: 14, def: 3, xp: 28, gold: 9,
    color: 0xcccc44, drops: [{ id: 'thunder_essence', chance: 0.35 }], level: 6,
    desc: 'Commands the skies.', areas: ['mountains', 'snowy_peaks']
  },
  shadow_knight: {
    id: 'shadow_knight', name: 'Shadow Knight', icon: '⚔️', hp: 70, atk: 16, def: 8, xp: 35, gold: 12,
    color: 0x333344, drops: [{ id: 'shadow_shard', chance: 0.5 }, { id: 'mythos_shard', chance: 0.1 }],
    level: 8, desc: 'A cursed warrior.', areas: ['ruins', 'dungeon']
  },
  magma_beast: {
    id: 'magma_beast', name: 'Magma Beast', icon: '🌋', hp: 80, atk: 18, def: 6, xp: 38, gold: 14,
    color: 0xff6622, drops: [{ id: 'fire_nectar', chance: 0.5 }, { id: 'earth_core', chance: 0.3 }],
    level: 9, desc: 'Born from the heart of the volcano.', areas: ['volcano']
  },
  crystal_guardian: {
    id: 'crystal_guardian', name: 'Crystal Guardian', icon: '💎', hp: 90, atk: 15, def: 12, xp: 40, gold: 15,
    color: 0xaa66ff, drops: [{ id: 'mythos_shard', chance: 0.3 }, { id: 'enchanted_essence', chance: 0.6 }],
    level: 10, desc: 'Protector of ancient secrets.', areas: ['temple', 'dungeon']
  },
  boss_wyrm: {
    id: 'boss_wyrm', name: 'Ancient Wyrm', icon: '🐉', hp: 200, atk: 25, def: 10, xp: 120, gold: 50,
    color: 0xcc4422, drops: [{ id: 'mythos_shard', chance: 1 }, { id: 'full_elixir', chance: 0.5 }],
    level: 12, desc: 'A dragon of legend.', areas: ['volcano'], isBoss: true,
    phases: [{ hpPct: 1, atk: 25 }, { hpPct: 0.5, atk: 35 }, { hpPct: 0.25, atk: 45 }]
  },
  boss_lich: {
    id: 'boss_lich', name: 'The Lich King', icon: '💀', hp: 180, atk: 30, def: 5, xp: 150, gold: 60,
    color: 0x8844aa, drops: [{ id: 'mythos_shard', chance: 1 }, { id: 'arcane_staff', chance: 0.3 }],
    level: 14, desc: 'Archmage of the undead.', areas: ['ruins'], isBoss: true,
    phases: [{ hpPct: 1, atk: 30 }, { hpPct: 0.5, atk: 40 }, { hpPct: 0.2, atk: 55 }]
  },
  boss_golem: {
    id: 'boss_golem', name: 'Titan Golem', icon: '🏛️', hp: 250, atk: 20, def: 18, xp: 130, gold: 55,
    color: 0x887766, drops: [{ id: 'mythos_shard', chance: 1 }, { id: 'mythos_robe', chance: 0.25 }],
    level: 13, desc: 'A massive guardian.', areas: ['temple'], isBoss: true,
    phases: [{ hpPct: 1, atk: 20 }, { hpPct: 0.5, atk: 28 }, { hpPct: 0.2, atk: 38 }]
  },
  boss_phoenix: {
    id: 'boss_phoenix', name: 'Crimson Phoenix', icon: '🦩', hp: 160, atk: 35, def: 4, xp: 160, gold: 65,
    color: 0xff6622, drops: [{ id: 'mythos_shard', chance: 1 }, { id: 'mythos_staff', chance: 0.2 }],
    level: 15, desc: 'A fiery bird of legend.', areas: ['volcano'], isBoss: true,
    phases: [{ hpPct: 1, atk: 35 }, { hpPct: 0.5, atk: 45 }, { hpPct: 0.15, atk: 60 }]
  }
};

const ENEMY_ARRAY = Object.values(ENEMIES);

function getEnemy(id) { return ENEMIES[id] || null; }

function getEnemiesForArea(area) {
  return ENEMY_ARRAY.filter(e => e.areas.includes(area) && !e.isBoss);
}

function getBossesForArea(area) {
  return ENEMY_ARRAY.filter(e => e.areas.includes(area) && e.isBoss);
}