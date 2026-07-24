class MapScene extends Phaser.Scene {
  constructor() { super('MapScene'); }
  create() { this.scene.start('WorldScene'); }
}