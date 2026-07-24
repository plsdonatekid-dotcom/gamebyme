class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    this.createTextures();
    this.scene.start('LoadScene');
  }

  createTextures() {
    const ts = 32;
    this.makeTile('grass', 0x3a7a2a, ts);
    this.makeTile('dirt', 0x7a6a4a, ts);
    this.makeTile('wall', 0x5a5a6a, ts);
    this.makeTile('water', 0x2a4a8a, ts);
    this.makeTile('tree', 0x1a4a1a, ts);
    this.makeTile('stone', 0x5a5a5a, ts);
    this.makeTile('path', 0x6a5a3a, ts);
    this.makeTile('floor', 0x4a3a5a, ts);
    this.makeTile('cave_floor', 0x3a2a1a, ts);
    this.makeTile('ruin_floor', 0x4a4a4a, ts);
    this.makeTile('snow', 0xccccee, ts);
    this.makeTile('lava', 0xff4400, ts);
    this.makeTile('bridge', 0x6a4a2a, ts);
    this.makeTile('temple_floor', 0x5a4a3a, ts);

    const c = document.createElement('canvas');
    c.width = ts; c.height = ts;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#4488ff';
    ctx.fillRect(4, 2, 24, 6);
    ctx.fillStyle = '#66aaff';
    ctx.fillRect(6, 8, 20, 22);
    ctx.fillStyle = '#ffdd88';
    ctx.fillRect(8, 4, 6, 6);
    ctx.fillRect(18, 4, 6, 6);
    this.textures.addCanvas('player', c);

    const c2 = document.createElement('canvas');
    c2.width = ts; c2.height = ts;
    const ctx2 = c2.getContext('2d');
    ctx2.fillStyle = '#ff4444';
    ctx2.fillRect(4, 4, 24, 24);
    ctx2.fillStyle = '#cc2222';
    ctx2.fillRect(6, 6, 20, 20);
    ctx2.fillStyle = '#ffffff';
    ctx2.fillRect(8, 8, 4, 4);
    ctx2.fillRect(20, 8, 4, 4);
    this.textures.addCanvas('enemy', c2);

    const c3 = document.createElement('canvas');
    c3.width = ts; c3.height = ts;
    const ctx3 = c3.getContext('2d');
    ctx3.fillStyle = '#44ff88';
    ctx3.fillRect(4, 2, 24, 6);
    ctx3.fillStyle = '#66ffaa';
    ctx3.fillRect(6, 8, 20, 22);
    ctx3.fillStyle = '#ffdd88';
    ctx3.fillRect(8, 4, 6, 6);
    ctx3.fillRect(18, 4, 6, 6);
    this.textures.addCanvas('npc', c3);

    const cp = document.createElement('canvas');
    cp.width = 4; cp.height = 4;
    const cpCtx = cp.getContext('2d');
    cpCtx.fillStyle = '#ffffff';
    cpCtx.fillRect(0, 0, 4, 4);
    this.textures.addCanvas('particle', cp);

    const cp2 = document.createElement('canvas');
    cp2.width = 8; cp2.height = 8;
    const cp2Ctx = cp2.getContext('2d');
    cp2Ctx.fillStyle = '#ffffff';
    cp2Ctx.fillRect(0, 0, 8, 8);
    this.textures.addCanvas('particle_large', cp2);
  }

  makeTile(key, color, size) {
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, size, size);
    this.textures.addCanvas(key, c);
  }
}