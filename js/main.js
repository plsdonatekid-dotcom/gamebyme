(function() {
  'use strict';

  function init() {
    document.getElementById('title-screen').style.display = 'flex';
    document.getElementById('loading-screen').style.display = 'flex';

    if (hasSave()) {
      document.getElementById('continue-btn')?.classList.remove('hidden');
    }

    const loadingFill = document.getElementById('loading-fill');
    let loadProgress = 0;
    const loadInterval = setInterval(() => {
      loadProgress += 0.05 + Math.random() * 0.1;
      if (loadProgress > 1) loadProgress = 1;
      if (loadingFill) loadingFill.style.width = (loadProgress * 100) + '%';
      if (loadProgress >= 1) {
        clearInterval(loadInterval);
        setTimeout(() => {
          document.getElementById('loading-screen').style.display = 'none';
          document.getElementById('title-screen').style.display = 'flex';
        }, 300);
      }
    }, 200);

    const config = {
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: 'game-container',
      backgroundColor: '#0a0a1a',
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [BootScene, LoadScene, TitleScene, WorldScene, CombatScene, DialogScene, InventoryScene, MapScene],
      input: {
        keyboard: true,
        mouse: true,
        touch: true,
      },
    };

    const game = new Phaser.Game(config);
    game.global = {
      saveData: null,
      spellSlots: ['magic_bolt', null, null, null, null],
    };

    game.events.on('ready', () => {
      if (hasSave()) {
        document.getElementById('continue-btn')?.classList.remove('hidden');
      }
    });

    AudioSystem.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();