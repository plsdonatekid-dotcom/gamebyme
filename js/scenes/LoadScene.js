class LoadScene extends Phaser.Scene {
  constructor() { super('LoadScene'); }

  preload() {
    const loadingFill = document.getElementById('loading-fill');
    const loadingText = document.getElementById('loading-text');
    this.load.on('progress', (val) => {
      if (loadingFill) loadingFill.style.width = (val * 100) + '%';
    });
  }

  create() {
    const loadingScreen = document.getElementById('loading-screen');
    const titleScreen = document.getElementById('title-screen');
    const continueBtn = document.getElementById('continue-btn');
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (titleScreen) titleScreen.style.display = 'flex';
    if (continueBtn && hasSave()) {
      continueBtn.classList.remove('hidden');
    }
  }
}