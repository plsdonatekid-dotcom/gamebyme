(function() {
  'use strict';

  function init() {
    console.log('Main init started');
    try {
      document.getElementById('title-screen').style.display = 'flex';
      document.getElementById('loading-screen').style.display = 'flex';
    } catch (e) {
      console.error('DOM access error:', e);
    }

    if (hasSave()) {
      const cb = document.getElementById('continue-btn');
      if (cb) cb.classList.remove('hidden');
    }

    const loadingFill = document.getElementById('loading-fill');
    let loadProgress = 0;
    const loadInterval = setInterval(() => {
      loadProgress += 0.08 + Math.random() * 0.12;
      if (loadProgress > 1) loadProgress = 1;
      if (loadingFill) loadingFill.style.width = (loadProgress * 100) + '%';
      if (loadProgress >= 1) {
        clearInterval(loadInterval);
        setTimeout(() => {
          const ls = document.getElementById('loading-screen');
          const ts = document.getElementById('title-screen');
          if (ls) ls.style.display = 'none';
          if (ts) ts.style.display = 'flex';
        }, 300);
      }
    }, 150);

    try {
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
      console.log('Phaser game created');
    } catch (e) {
      console.error('Phaser init error:', e);
    }

    AudioSystem.init();
  }

  function waitForPhaser() {
    if (typeof Phaser !== 'undefined') {
      init();
    } else {
      console.warn('Waiting for Phaser...');
      setTimeout(waitForPhaser, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForPhaser);
  } else {
    waitForPhaser();
  }
})();