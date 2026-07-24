const MAP_TILES = {
  mosswood: [
    'GGGGGGGGGGGGGGGGGGGGGGGGGG',
    'GGG....GGG....GGG....GGGG',
    'GG..H..GG..H..GG..H..GGG',
    'GGG....GGG....GGG....GGG',
    'GGGGGGGGGGGGGGGGGGGGGGGG',
    'GG..T..GGG..B..GGG..E..',
    'GG....GG......GG........',
    'GG..W...GG..M...GG..L...',
    'GG....GG......GG........',
    'GGGGGGGGGGGGGGGGGGGGGGGG',
    'GGGGGGGGGGGGGGGGGGGGGGGG',
    'GGGGGGGGGGGGGGGGGGGGGGGG',
    'GG........GGGGGGGGGGGGGG',
    'GG..P....GGGGGGGGGGGGGGG',
    'GG........GGGGGGGGGGGGGG',
    'GGGGGGGGGGGGGGGGGGGGGGGG',
  ],
  enchanted_forest: [
    'TTT..TTT..TTT..TTT..TTT',
    'T.....G...G...G....TTT',
    'T..G..G..S..G..G...T',
    'TT..G..G..G..G..G..TT',
    'TTTTTTTTTTTTTTTTTTTTTT',
    'G..G..G..G..G..G..G.G',
    'G..F..G..F..G..F..G.G',
    'G..G..G..G..G..G..G.G',
    'TTT..TTT..TTT..TTT..TT',
    'R..G..R..G..R..G..R.G',
    'G..G..G..P..G..G..G.G',
    'E..G..G..G..G..E2...G',
    'TTT..TTT..TTT..TTT..TT',
    'TTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTT',
  ],
  wizard_tower: [
    'WWWWWWWWWWWWWW',
    'W..........WW',
    'W..B..B..S.W',
    'W..........W',
    'W..T..T....W',
    'W..........W',
    'W..B..B....W',
    'W..........W',
    'W..T..T....W',
    'W..........W',
    'W..P..E..WW',
    'WWWWWWWWWW',
  ],
  caves: [
    'WWWWWWWWWWWWWWWWWWWWWW',
    'WW..............WWWWW',
    'WW..P..........WW...W',
    'WW.............WW...W',
    'WW...WWWWWW...WW....W',
    'WWW..W........WW....W',
    'WWWW.A........WW....W',
    'WWWWWWWWWWWW..WW....W',
    'WW.............WW...W',
    'WW..............WW..W',
    'WW...WWWWWW......WWWW',
    'WWW.WW..WW.W......WW',
    'WWWWWWWWWWWWW......W',
    'WWW................W',
    'WW....E..E2......WW',
    'WWWWWWWWWWWWWWWWWWWW',
  ],
  mountains: [
    'RRRRRRRRRRRRRRRRRRRRRRRR',
    'R......R......R......RR',
    'R..S...R..T...R..T..RRR',
    'R......R......R......RR',
    'RRRR...RRRR...RRRR...RR',
    '..T...............T..R',
    '.......R..P..R.......R',
    '..T...............T..R',
    'RRRR...RRRR...RRRR...RR',
    'R..S...R..S...R..S..RRR',
    'R......R......R......RR',
    'R..E...R..E2..R......RR',
    'R......R......R......RR',
    'RRRRRRRRRRRRRRRRRRRRRRRR',
    'RRRRRRRRRRRRRRRRRRRRRRRR',
    'RRRRRRRRRRRRRRRRRRRRRRRR',
  ],
  snowy_peaks: [
    'RRRRRRRRRRRRRRRRRRRR',
    'R..T..R..T..R..T..R',
    'R......R......R...R',
    'R..T..R..T..R..T.R',
    'RRRR...RRRR...RRRR',
    '..T.......T......',
    'R..P..R..T..R...R',
    'R......R......R.R',
    'RRRR...RRRR...RRRR',
    'R..T..E..T..E2.RR',
    'R......R......RRR',
    'R..T..R..T..RRRRR',
    'RRRR..RRRR..RRRRR',
    'RRRRRRRRRRRRRRRRR',
  ],
  volcano: [
    'WWWWWWWWWWWWWWWWWWWWWW',
    'W.................WWW',
    'W..L..L..L..L....WWW',
    'W..L..B..L..B..L..WW',
    'W..L..L..L..L....WWW',
    'W................WWW',
    'W..P..L..L..L...WWW',
    'W.....L..B..L...WWW',
    'W..L..L..L..L...WWW',
    'W................WWW',
    'W..L..L..L..L...WWW',
    'W..E..L..L..E2..WWW',
    'W..L..L..L..L...WWW',
    'W................WWW',
    'W................WWW',
    'WWWWWWWWWWWWWWWWWWWWWW',
  ],
  ruins: [
    'WWWWWWWWWWWWWWWWWWWWWWWW',
    'W....W....W....W......W',
    'W..S.W....W....W..C..W',
    'W....W....W....W......W',
    'WWWWWWWWWWWWWWWWWWWWWW',
    'W....W....W....W......',
    'W..C.W..S.W..C.W.....',
    'W....W....W....W.....',
    'WWWWWWWWWWWWWWWWWWWW',
    'W....W....W....W....W',
    'W..S.W....W..C.W....W',
    'W....W..P.W....W....W',
    'WWWWWWWWWWWWWWWWWWWWWW',
    'W....W....W....W......W',
    'W..E..W..E2.W......W',
    'W....W....W......WW',
  ],
  temple: [
    'WWWWWWWWWWWWWWWWWWWW',
    'W................WW',
    'W..G..W..S..W..G.W',
    'W..............W.W',
    'W..W..W....W..W..W',
    'W..............W.W',
    'W..G..W..P..W..G.W',
    'W..............W.W',
    'W..W..W....W..W..W',
    'W..............W.W',
    'W..E..W..S..W..GW',
    'W................W',
    'WWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWW',
  ],
};

const MAP_DATA = {};
for (const key of Object.keys(MAP_TILES)) {
  const tileLines = MAP_TILES[key];
  const width = Math.max(...tileLines.map(l => l.length));
  const height = tileLines.length;
  const mapDef = {
    name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    width, height, tiles: tileLines,
    tileset: {},
    npcs: [],
    enemies: [],
    enemySpawnRate: 0.002,
    music: 'explore'
  };

  for (let y = 0; y < height; y++) {
    const row = tileLines[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (!mapDef.tileset[ch]) {
        mapDef.tileset[ch] = { type: 'floor', color: 0x444444, solid: false };
      }
    }
  }
  MAP_DATA[key] = mapDef;
}

MAP_DATA.mosswood.name = 'Mosswood Village';
MAP_DATA.mosswood.tileset['G'] = { type: 'grass', color: 0x3a7a2a, solid: false };
MAP_DATA.mosswood.tileset['.'] = { type: 'path', color: 0x7a6a4a, solid: false };
MAP_DATA.mosswood.tileset['H'] = { type: 'house', color: 0x7a3a2a, solid: true };
MAP_DATA.mosswood.tileset['T'] = { type: 'tree', color: 0x2a5a2a, solid: true };
MAP_DATA.mosswood.tileset['B'] = { type: 'tree', color: 0x2a5a2a, solid: true };
MAP_DATA.mosswood.tileset['W'] = { type: 'wall', color: 0x5a4a2a, solid: true };
MAP_DATA.mosswood.tileset['M'] = { type: 'wall', color: 0x5a4a2a, solid: true };
MAP_DATA.mosswood.tileset['L'] = { type: 'wall', color: 0x5a4a2a, solid: true };
MAP_DATA.mosswood.tileset['E'] = { type: 'exit', color: 0x4466aa, solid: false, exitTo: 'enchanted_forest', exitX: 0, exitY: 5 };
MAP_DATA.mosswood.tileset['P'] = { type: 'path', color: 0x7a6a4a, solid: false, playerStart: true };
MAP_DATA.mosswood.npcs = ['elder_wisdom', 'merchant_maya', 'blacksmith_borin'];
MAP_DATA.mosswood.enemies = ['slime', 'forest_spirit'];
MAP_DATA.mosswood.enemySpawnRate = 0;
MAP_DATA.mosswood.music = 'village';

MAP_DATA.enchanted_forest.name = 'Enchanted Forest';
MAP_DATA.enchanted_forest.tileset['T'] = { type: 'tree', color: 0x1a4a1a, solid: true };
MAP_DATA.enchanted_forest.tileset['G'] = { type: 'grass', color: 0x2a6a2a, solid: false };
MAP_DATA.enchanted_forest.tileset['.'] = { type: 'dirt', color: 0x6a5a3a, solid: false };
MAP_DATA.enchanted_forest.tileset['S'] = { type: 'shrine', color: 0x8866aa, solid: true };
MAP_DATA.enchanted_forest.tileset['F'] = { type: 'flower', color: 0xaa66ff, solid: false };
MAP_DATA.enchanted_forest.tileset['R'] = { type: 'rock', color: 0x5a5a5a, solid: true };
MAP_DATA.enchanted_forest.tileset['E'] = { type: 'exit', color: 0x4466aa, solid: false, exitTo: 'mosswood', exitX: 7, exitY: 12 };
MAP_DATA.enchanted_forest.tileset['E2'] = { type: 'exit', color: 0x44aa66, solid: false, exitTo: 'caves', exitX: 1, exitY: 14 };
MAP_DATA.enchanted_forest.tileset['P'] = { type: 'dirt', color: 0x6a5a3a, solid: false, playerStart: true };
MAP_DATA.enchanted_forest.npcs = ['forest_guardian_lyra'];
MAP_DATA.enchanted_forest.enemies = ['slime', 'forest_spirit', 'shadow_wisp'];
MAP_DATA.enchanted_forest.enemySpawnRate = 0.002;
MAP_DATA.enchanted_forest.music = 'forest';

MAP_DATA.wizard_tower.name = 'Wizard Tower';
MAP_DATA.wizard_tower.tileset['.'] = { type: 'floor', color: 0x4a3a5a, solid: false };
MAP_DATA.wizard_tower.tileset['W'] = { type: 'wall', color: 0x3a2a4a, solid: true };
MAP_DATA.wizard_tower.tileset['B'] = { type: 'bookshelf', color: 0x6a4a3a, solid: true };
MAP_DATA.wizard_tower.tileset['S'] = { type: 'stairs', color: 0x6a5a7a, solid: false };
MAP_DATA.wizard_tower.tileset['T'] = { type: 'table', color: 0x5a4a3a, solid: true };
MAP_DATA.wizard_tower.tileset['E'] = { type: 'exit', color: 0x4466aa, solid: false, exitTo: 'enchanted_forest', exitX: 10, exitY: 10 };
MAP_DATA.wizard_tower.tileset['P'] = { type: 'floor', color: 0x4a3a5a, solid: false, playerStart: true };
MAP_DATA.wizard_tower.npcs = ['scholar_luna'];
MAP_DATA.wizard_tower.enemySpawnRate = 0;
MAP_DATA.wizard_tower.music = 'magic';

MAP_DATA.caves.name = 'Crystal Caves';
MAP_DATA.caves.tileset['.'] = { type: 'cave_floor', color: 0x3a2a1a, solid: false };
MAP_DATA.caves.tileset['W'] = { type: 'wall', color: 0x2a1a0a, solid: true };
MAP_DATA.caves.tileset['A'] = { type: 'altar', color: 0x8866ff, solid: false };
MAP_DATA.caves.tileset['E'] = { type: 'exit', color: 0x4466aa, solid: false, exitTo: 'enchanted_forest', exitX: 8, exitY: 2 };
MAP_DATA.caves.tileset['E2'] = { type: 'exit', color: 0x44aa66, solid: false, exitTo: 'mountains', exitX: 1, exitY: 11 };
MAP_DATA.caves.tileset['P'] = { type: 'cave_floor', color: 0x3a2a1a, solid: false, playerStart: true };
MAP_DATA.caves.npcs = [];
MAP_DATA.caves.enemies = ['cave_bat', 'rock_golem', 'frost_wraith'];
MAP_DATA.caves.enemySpawnRate = 0.003;
MAP_DATA.caves.music = 'cave';

MAP_DATA.mountains.name = 'Stonepeak Mountains';
MAP_DATA.mountains.tileset['R'] = { type: 'rock', color: 0x5a5a4a, solid: true };
MAP_DATA.mountains.tileset['.'] = { type: 'mountain_path', color: 0x6a6a5a, solid: false };
MAP_DATA.mountains.tileset['S'] = { type: 'snow', color: 0x8a8a8a, solid: false };
MAP_DATA.mountains.tileset['T'] = { type: 'pine', color: 0x1a3a1a, solid: true };
MAP_DATA.mountains.tileset['E'] = { type: 'exit', color: 0x4466aa, solid: false, exitTo: 'caves', exitX: 14, exitY: 10 };
MAP_DATA.mountains.tileset['E2'] = { type: 'exit', color: 0x44aa66, solid: false, exitTo: 'snowy_peaks', exitX: 1, exitY: 5 };
MAP_DATA.mountains.tileset['P'] = { type: 'mountain_path', color: 0x6a6a5a, solid: false, playerStart: true };
MAP_DATA.mountains.npcs = [];
MAP_DATA.mountains.enemies = ['rock_golem', 'thunder_bird'];
MAP_DATA.mountains.enemySpawnRate = 0.003;
MAP_DATA.mountains.music = 'mountain';

MAP_DATA.snowy_peaks.name = 'Snowy Peaks';
MAP_DATA.snowy_peaks.tileset['R'] = { type: 'rock', color: 0x6a6a7a, solid: true };
MAP_DATA.snowy_peaks.tileset['.'] = { type: 'snow', color: 0xccccee, solid: false };
MAP_DATA.snowy_peaks.tileset['T'] = { type: 'pine', color: 0x1a3a2a, solid: true };
MAP_DATA.snowy_peaks.tileset['E'] = { type: 'exit', color: 0x4466aa, solid: false, exitTo: 'mountains', exitX: 7, exitY: 7 };
MAP_DATA.snowy_peaks.tileset['E2'] = { type: 'exit', color: 0x44aa66, solid: false, exitTo: 'volcano', exitX: 1, exitY: 8 };
MAP_DATA.snowy_peaks.tileset['P'] = { type: 'snow', color: 0xccccee, solid: false, playerStart: true };
MAP_DATA.snowy_peaks.npcs = [];
MAP_DATA.snowy_peaks.enemies = ['frost_wraith', 'thunder_bird'];
MAP_DATA.snowy_peaks.enemySpawnRate = 0.003;
MAP_DATA.snowy_peaks.music = 'snow';

MAP_DATA.volcano.name = 'Volcano Caldera';
MAP_DATA.volcano.tileset['.'] = { type: 'volcanic_rock', color: 0x4a2a1a, solid: false };
MAP_DATA.volcano.tileset['L'] = { type: 'lava', color: 0xff4400, solid: false, damage: true };
MAP_DATA.volcano.tileset['W'] = { type: 'wall', color: 0x3a1a0a, solid: true };
MAP_DATA.volcano.tileset['B'] = { type: 'bridge', color: 0x6a4a2a, solid: false };
MAP_DATA.volcano.tileset['E'] = { type: 'exit', color: 0x4466aa, solid: false, exitTo: 'snowy_peaks', exitX: 6, exitY: 12 };
MAP_DATA.volcano.tileset['E2'] = { type: 'exit', color: 0x44aa66, solid: false, exitTo: 'ruins', exitX: 1, exitY: 10 };
MAP_DATA.volcano.tileset['P'] = { type: 'volcanic_rock', color: 0x4a2a1a, solid: false, playerStart: true };
MAP_DATA.volcano.npcs = ['elder_volcano'];
MAP_DATA.volcano.enemies = ['fire_elemental', 'magma_beast', 'boss_wyrm', 'boss_phoenix'];
MAP_DATA.volcano.enemySpawnRate = 0.004;
MAP_DATA.volcano.music = 'volcano';

MAP_DATA.ruins.name = 'Forgotten Ruins';
MAP_DATA.ruins.tileset['.'] = { type: 'ruin_floor', color: 0x4a4a4a, solid: false };
MAP_DATA.ruins.tileset['W'] = { type: 'ruin_wall', color: 0x3a3a3a, solid: true };
MAP_DATA.ruins.tileset['C'] = { type: 'column', color: 0x5a5a5a, solid: true };
MAP_DATA.ruins.tileset['S'] = { type: 'statue', color: 0x6a6a6a, solid: true };
MAP_DATA.ruins.tileset['E'] = { type: 'exit', color: 0x4466aa, solid: false, exitTo: 'volcano', exitX: 12, exitY: 10 };
MAP_DATA.ruins.tileset['E2'] = { type: 'exit', color: 0x44aa66, solid: false, exitTo: 'temple', exitX: 1, exitY: 10 };
MAP_DATA.ruins.tileset['P'] = { type: 'ruin_floor', color: 0x4a4a4a, solid: false, playerStart: true };
MAP_DATA.ruins.npcs = [];
MAP_DATA.ruins.enemies = ['shadow_wisp', 'shadow_knight', 'boss_lich'];
MAP_DATA.ruins.enemySpawnRate = 0.004;
MAP_DATA.ruins.music = 'ruins';

MAP_DATA.temple.name = 'Ancient Temple';
MAP_DATA.temple.tileset['.'] = { type: 'temple_floor', color: 0x5a4a3a, solid: false };
MAP_DATA.temple.tileset['W'] = { type: 'temple_wall', color: 0x4a3a2a, solid: true };
MAP_DATA.temple.tileset['G'] = { type: 'gold', color: 0xffd700, solid: false };
MAP_DATA.temple.tileset['S'] = { type: 'shrine', color: 0xaa88ff, solid: true };
MAP_DATA.temple.tileset['E'] = { type: 'exit', color: 0x4466aa, solid: false, exitTo: 'ruins', exitX: 10, exitY: 8 };
MAP_DATA.temple.tileset['P'] = { type: 'temple_floor', color: 0x5a4a3a, solid: false, playerStart: true };
MAP_DATA.temple.npcs = [];
MAP_DATA.temple.enemies = ['crystal_guardian', 'boss_golem'];
MAP_DATA.temple.enemySpawnRate = 0.003;
MAP_DATA.temple.music = 'temple';

function getMapData(areaId) { return MAP_DATA[areaId] || null; }

function getTileAt(areaId, tx, ty) {
  const mapDef = MAP_DATA[areaId];
  if (!mapDef) return null;
  if (ty < 0 || ty >= mapDef.tiles.length) return null;
  if (tx < 0 || tx >= mapDef.tiles[ty].length) return null;
  const ch = mapDef.tiles[ty][tx];
  return mapDef.tileset[ch] || null;
}

function isSolid(areaId, tx, ty) {
  const tile = getTileAt(areaId, tx, ty);
  return tile ? (tile.solid || false) : true;
}