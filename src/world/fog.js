// Fog of war: one byte per world tile, set once the player has sailed
// near it. Deliberately player-only — AI ship movement doesn't reveal fog.

export function createFog(world) {
  return new Uint8Array(world.width * world.height);
}

export function revealAround(fog, world, worldX, worldY, radiusTiles, tileSize) {
  const tx = Math.floor(worldX / tileSize);
  const ty = Math.floor(worldY / tileSize);
  const r2 = radiusTiles * radiusTiles;
  for (let dy = -radiusTiles; dy <= radiusTiles; dy++) {
    for (let dx = -radiusTiles; dx <= radiusTiles; dx++) {
      if (dx * dx + dy * dy > r2) continue;
      const x = tx + dx;
      const y = ty + dy;
      if (x < 0 || y < 0 || x >= world.width || y >= world.height) continue;
      fog[y * world.width + x] = 1;
    }
  }
}

export function isRevealed(fog, world, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= world.width || ty >= world.height) return false;
  return fog[ty * world.width + tx] === 1;
}
