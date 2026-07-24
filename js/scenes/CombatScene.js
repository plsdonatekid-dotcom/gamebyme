class CombatScene extends Phaser.Scene {
  constructor() { super('CombatScene'); }
  create() {
    this.scene.start('WorldScene');
  }
}