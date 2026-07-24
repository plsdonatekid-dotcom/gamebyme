(function() {
  'use strict';

  function init() {
    console.log('Game starting...');
    AudioSystem.init();

    const game = GameEngine;
    game.init('game-canvas');

    const loadingEl = document.getElementById('loading-screen');
    const titleEl = document.getElementById('title-screen');
    if (loadingEl) loadingEl.style.display = 'none';
    if (titleEl) titleEl.style.display = 'flex';

    if (hasSave()) {
      document.getElementById('continue-btn')?.classList.remove('hidden');
    }

    document.getElementById('start-btn')?.addEventListener('click', () => {
      document.getElementById('title-screen').style.display = 'none';
      game.startGame(true);
    });

    document.getElementById('continue-btn')?.addEventListener('click', () => {
      document.getElementById('title-screen').style.display = 'none';
      game.startGame(false);
    });

    document.getElementById('inv-close')?.addEventListener('click', () => {
      document.getElementById('inventory-screen').classList.add('hidden');
    });
    document.getElementById('map-close')?.addEventListener('click', () => {
      document.getElementById('world-map').classList.add('hidden');
    });

    document.querySelectorAll('.inv-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        game.renderInventoryTab(tab.dataset.tab);
      });
    });

    document.querySelectorAll('.combat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        game.handleCombatAction(action);
      });
    });

    console.log('Game ready!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();