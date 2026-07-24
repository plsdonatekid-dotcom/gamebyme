class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    this.createTextures();
  }

  createTextures() {
    const tileSize = 32;
    const colors = {
      grass: 0x3a7a2a, dirt: 0x7a6a4a, wall: 0x5a5a6a, water: 0x2a4a8a,
      tree: 0x1a4a1a, stone: 0x5a5a5a, path: 0x6a5a3a, floor: 0x4a3a5a,
      cave_floor: 0x3a2a1a, ruin_floor: 0x4a4a4a, snow: 0xccccee,
      lava: 0xff4400, bridge: 0x6a4a2a, temple_floor: 0x5a4a3a,
    };
    for (const [name, color] of Object.entries(colors)) {
      this.createTileTexture(name, color, tileSize);
    }
    this.createPlayerTexture(tileSize);
    this.createEnemyTexture(tileSize);
    this.createNpcTexture(tileSize);
    this.createParticleTextures();
  }

  createTileTexture(key, color, size) {
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRect(0, 0, size, size);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  createPlayerTexture(size) {
    const g = this.add.graphics();
    g.fillStyle(0x4488ff, 1);
    g.fillRect(4, 2, size - 8, 6);
    g.fillStyle(0x66aaff, 1);
    g.fillRect(6, 8, size - 12, size - 10);
    g.fillStyle(0xffdd88, 1);
    g.fillRect(8, 4, 6, 6);
    g.fillRect(size - 14, 4, 6, 6);
    g.generateTexture('player', size, size);
    g.destroy();
  }

  createEnemyTexture(size) {
    const g = this.add.graphics();
    g.fillStyle(0xff4444, 1);
    g.fillRect(4, 4, size - 8, size - 8);
    g.fillStyle(0xcc2222, 1);
    g.fillRect(6, 6, size - 12, size - 12);
    g.fillStyle(0xffffff, 1);
    g.fillRect(8, 8, 4, 4);
    g.fillRect(size - 12, 8, 4, 4);
    g.generateTexture('enemy', size, size);
    g.destroy();
  }

  createNpcTexture(size) {
    const g = this.add.graphics();
    g.fillStyle(0x44ff88, 1);
    g.fillRect(4, 2, size - 8, 6);
    g.fillStyle(0x66ffaa, 1);
    g.fillRect(6, 8, size - 12, size - 10);
    g.fillStyle(0xffdd88, 1);
    g.fillRect(8, 4, 6, 6);
    g.fillRect(size - 14, 4, 6, 6);
    g.generateTexture('npc', size, size);
    g.destroy();
  }

  createParticleTextures() {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('particle', 4, 4);
    g.destroy();
    const g2 = this.add.graphics();
    g2.fillStyle(0xffffff, 1);
    g2.fillRect(0, 0, 8, 8);
    g2.generateTexture('particle_large', 8, 8);
    g2.destroy();
  }

  create() {
    this.scene.start('LoadScene');
  }
}