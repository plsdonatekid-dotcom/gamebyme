const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const TILE_SIZE = 32;
const MAX_LEVEL = 50;
const MAX_HEALTH = 999;
const MAX_MANA = 999;
const BASE_MOVE_SPEED = 120;
const GOLD_NAME = 'Gold';

const KEYS = {
  W: Phaser.Input.Keyboard.KeyCodes.W,
  A: Phaser.Input.Keyboard.KeyCodes.A,
  S: Phaser.Input.Keyboard.KeyCodes.S,
  D: Phaser.Input.Keyboard.KeyCodes.D,
  SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
  E: Phaser.Input.Keyboard.KeyCodes.E,
  I: Phaser.Input.Keyboard.KeyCodes.I,
  M: Phaser.Input.Keyboard.KeyCodes.M,
  Q: Phaser.Input.Keyboard.KeyCodes.Q,
  ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
  TAB: Phaser.Input.Keyboard.KeyCodes.TAB,
  ONE: Phaser.Input.Keyboard.KeyCodes.ONE,
  TWO: Phaser.Input.Keyboard.KeyCodes.TWO,
  THREE: Phaser.Input.Keyboard.KeyCodes.THREE,
  FOUR: Phaser.Input.Keyboard.KeyCodes.FOUR,
  FIVE: Phaser.Input.Keyboard.KeyCodes.FIVE
};

const COLORS = {
  DEEP_BLUE: 0x0a0a2a,
  FOREST_GREEN: 0x1a4a1a,
  GRASS_GREEN: 0x2a6a2a,
  LIGHT_GRASS: 0x4a8a3a,
  PATH_BROWN: 0x8a6a4a,
  WATER_BLUE: 0x2a4a8a,
  WATER_LIGHT: 0x4a7aba,
  WALL_GRAY: 0x5a5a6a,
  ROOF_RED: 0x8a3a2a,
  WOOD_BROWN: 0x6a4a2a,
  GOLD: 0xffd700,
  RED: 0xff4444,
  WHITE: 0xffffff,
  SKY_BLUE: 0x6aaaee,
  CAVE_BROWN: 0x3a2a1a,
  LAVA_ORANGE: 0xff6622,
  SNOW_WHITE: 0xeeeef0,
  RUIN_GRAY: 0x4a4a4a,
  CRYSTAL_PURPLE: 0xaa66ff,
  MAGIC_PINK: 0xff66aa,
  HEALTH_GREEN: 0x44ff44,
  MANA_BLUE: 0x4488ff,
  XP_YELLOW: 0xffff44
};