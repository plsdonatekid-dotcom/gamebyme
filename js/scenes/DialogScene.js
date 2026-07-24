class DialogScene extends Phaser.Scene {
  constructor() { super('DialogScene'); }
  create() { this.scene.start('WorldScene'); }
}