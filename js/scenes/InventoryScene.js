class InventoryScene extends Phaser.Scene {
  constructor() { super('InventoryScene'); }
  create() { this.scene.start('WorldScene'); }
}