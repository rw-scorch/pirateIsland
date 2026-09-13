import { TILE_SIZE, tilePath, ROCK_TILES, PIER_H, MOORING_TILES } from '../world/tileset.js';
import { landTileFor, pick } from '../world/autotile.js';
import { LAND, ROCK, QUAY } from '../world/worldGen.js';

function pierSpriteFor(world, x, y) {
  const i = world.pier.findIndex(([px, py]) => px === x && py === y);
  if (i === -1) return PIER_H.MID;
  if (i === 0) return PIER_H.LEFT_CAP;
  if (i === world.pier.length - 1) return PIER_H.RIGHT_CAP;
  return PIER_H.MID;
}

function isMooringCell(world, x, y) {
  return world.mooringCells.some(([mx, my]) => mx === x && my === y);
}

// Sea is our own animated layer, drawn in world space so it scrolls with
// the camera; every visible tile then draws on top of it.
export function drawWorld(ctx, images, world, camera, viewportW, viewportH, timeSec) {
  const originX = viewportW / 2 - camera.x;
  const originY = viewportH / 2 - camera.y;

  drawSea(ctx, originX, originY, viewportW, viewportH, timeSec);

  const minTx = Math.max(0, Math.floor((camera.x - viewportW / 2) / TILE_SIZE) - 1);
  const maxTx = Math.min(world.width - 1, Math.floor((camera.x + viewportW / 2) / TILE_SIZE) + 1);
  const minTy = Math.max(0, Math.floor((camera.y - viewportH / 2) / TILE_SIZE) - 1);
  const maxTy = Math.min(world.height - 1, Math.floor((camera.y + viewportH / 2) / TILE_SIZE) + 1);

  for (let ty = minTy; ty <= maxTy; ty++) {
    for (let tx = minTx; tx <= maxTx; tx++) {
      const cell = world.cellType[world.idx(tx, ty)];
      if (cell === LAND) {
        drawTile(ctx, images, landTileFor(world, tx, ty), tx, ty, originX, originY);
      } else if (cell === ROCK) {
        drawTile(ctx, images, pick(ROCK_TILES, tx, ty), tx, ty, originX, originY);
      } else if (cell === QUAY) {
        drawTile(ctx, images, pierSpriteFor(world, tx, ty), tx, ty, originX, originY);
        if (isMooringCell(world, tx, ty)) {
          drawTile(ctx, images, pick(MOORING_TILES, tx, ty), tx, ty, originX, originY);
        }
      }
    }
  }
}

function drawTile(ctx, images, tileNum, tx, ty, originX, originY) {
  const img = images.get(tilePath(tileNum));
  if (!img) return;
  ctx.drawImage(img, originX + tx * TILE_SIZE, originY + ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function drawSea(ctx, originX, originY, w, h, t) {
  ctx.save();
  ctx.fillStyle = '#1b4a63';
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#bfe3f0';
  ctx.lineWidth = 2;
  const spacing = 48;
  // wave lines anchored to world space via originY, so they scroll with camera
  const firstLine = Math.floor(-originY / spacing) * spacing + originY;
  for (let y = firstLine - spacing; y < h + spacing; y += spacing) {
    ctx.beginPath();
    for (let sx = -spacing; sx <= w + spacing; sx += 16) {
      const wx = sx - originX;
      const yy = y + Math.sin((wx + t * 70) * 0.02) * 5;
      if (sx === -spacing) ctx.moveTo(sx, yy);
      else ctx.lineTo(sx, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}
