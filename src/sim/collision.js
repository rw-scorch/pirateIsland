import { TILE_SIZE } from '../world/tileset.js';
import { isSolid } from '../world/worldGen.js';

const SHIP_RADIUS = 60; // world units, roughly the hull's half-width at render scale

function circleHitsSolid(world, wx, wy, radius) {
  const minTx = Math.floor((wx - radius) / TILE_SIZE);
  const maxTx = Math.floor((wx + radius) / TILE_SIZE);
  const minTy = Math.floor((wy - radius) / TILE_SIZE);
  const maxTy = Math.floor((wy + radius) / TILE_SIZE);
  for (let ty = minTy; ty <= maxTy; ty++) {
    for (let tx = minTx; tx <= maxTx; tx++) {
      if (!isSolid(world, tx, ty)) continue;
      const closestX = Math.max(tx * TILE_SIZE, Math.min(wx, (tx + 1) * TILE_SIZE));
      const closestY = Math.max(ty * TILE_SIZE, Math.min(wy, (ty + 1) * TILE_SIZE));
      const dx = wx - closestX;
      const dy = wy - closestY;
      if (dx * dx + dy * dy < radius * radius) return true;
    }
  }
  return false;
}

// Axis-separated resolution: slide along whichever single axis is still
// clear, so running into land at an angle scrapes past it instead of
// stopping dead.
export function resolveCollision(ship, world, prevX, prevY) {
  if (!circleHitsSolid(world, ship.x, ship.y, SHIP_RADIUS)) return;
  if (!circleHitsSolid(world, ship.x, prevY, SHIP_RADIUS)) {
    ship.y = prevY;
  } else if (!circleHitsSolid(world, prevX, ship.y, SHIP_RADIUS)) {
    ship.x = prevX;
  } else {
    ship.x = prevX;
    ship.y = prevY;
  }
  ship.speed *= 0.2;
}
