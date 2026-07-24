class LoadScene extends Phaser.Scene {
  constructor() { super('LoadScene'); }

  create() {
    console.log('LoadScene: showing title');
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