const MinimapSystem = {
  canvas: null,
  ctx: null,
  scale: 3,

  init() {
    this.canvas = document.getElementById('minimap-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
  },

  render(saveData, areaId, playerX, playerY) {
    if (!this.ctx) return;
    const mapDef = getMapData(areaId);
    if (!mapDef) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);
    const tileW = w / mapDef.width;
    const tileH = h / mapDef.height;
    for (let y = 0; y < mapDef.tiles.length; y++) {
      const row = mapDef.tiles[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        const tileDef = mapDef.tileset[ch];
        if (!tileDef) continue;
        const color = typeof tileDef.color === 'number' ? '#' + tileDef.color.toString(16).padStart(6, '0') : '#444';
        ctx.fillStyle = tileDef.solid ? '#2a2a3a' : color;
        ctx.fillRect(x * tileW, y * tileH, Math.ceil(tileW), Math.ceil(tileH));
      }
    }
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(playerX * tileW - 1, playerY * tileH - 1, 4, 4);
    ctx.strokeStyle = '#5050a0';
    ctx.strokeRect(0, 0, w, h);
  }
};