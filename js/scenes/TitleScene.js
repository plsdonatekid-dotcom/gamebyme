class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  create() {
    console.log('TitleScene started');
    const startBtn = document.getElementById('start-btn');
    const continueBtn = document.getElementById('continue-btn');
    const titleScreen = document.getElementById('title-screen');

    if (startBtn) {
      startBtn.onclick = () => {
        console.log('New game started');
        AudioSystem.init();
        AudioSystem.resume();
        titleScreen.style.display = 'none';
        this.game.global.saveData = createNewSave();
        this.game.global.saveData.player.unlockedSpells = ['magic_bolt'];
        this.game.global.saveData.player.spellSlots = ['magic_bolt', null, null, null, null];
        saveGame(this.game.global.saveData);
        showToast('Welcome to the Mythos Isles!', '#a0d0ff');
        AudioSystem.playSfx('levelup');
        this.scene.start('WorldScene');
      };
    }

    if (continueBtn) {
      continueBtn.onclick = () => {
        console.log('Continue game');
        AudioSystem.init();
        AudioSystem.resume();
        const loaded = loadGame();
        if (loaded) {
          this.game.global.saveData = loaded;
          titleScreen.style.display = 'none';
          this.scene.start('WorldScene');
        } else {
          showToast('No save found!', '#ff4444');
        }
      };
    }
  }
}