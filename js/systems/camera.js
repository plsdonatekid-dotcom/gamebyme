const CameraSystem = {
  x: 0, y: 0,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  mapWidth: 0,
  mapHeight: 0,
  target: null,
  smoothFactor: 0.08,

  init(mapPixelW, mapPixelH) {
    this.mapWidth = mapPixelW;
    this.mapHeight = mapPixelH;
  },

  follow(targetX, targetY) {
    this.target = { x: targetX, y: targetY };
  },

  update(dt) {
    if (!this.target) return;
    const targetCamX = this.target.x - this.width / 2;
    const targetCamY = this.target.y - this.height / 2;
    this.x = lerp(this.x, targetCamX, this.smoothFactor);
    this.y = lerp(this.y, targetCamY, this.smoothFactor);
    this.x = clamp(this.x, 0, Math.max(0, this.mapWidth - this.width));
    this.y = clamp(this.y, 0, Math.max(0, this.mapHeight - this.height));
  }
};