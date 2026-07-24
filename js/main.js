(function() {
  'use strict';

  function init() {
    try {
      console.log('Game starting...');
      
      const canvas = document.getElementById('game-canvas');
      if (!canvas) { document.body.innerHTML = '<h1 style="color:red;">Error: Canvas element not found</h1>'; return; }
      
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width || 800, canvas.height || 600);
      ctx.fillStyle = '#80d0ff';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Starting Mythos Isles...', 400, 300);

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
    } catch (e) {
      console.error('Fatal init error:', e);
      const canvas = document.getElementById('game-canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1a0a0a';
        ctx.fillRect(0, 0, 800, 600);
        ctx.fillStyle = '#ff4444';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('ERROR: ' + e.message, 20, 50);
        ctx.fillText('See console (F12) for details.', 20, 80);
      } else {
        document.body.innerHTML = '<h1 style="color:red;">Error: ' + e.message + '</h1>';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();