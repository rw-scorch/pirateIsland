export const TILE_SIZE = 64;

export function tilePath(n) {
  return `assets/world/tiles/tile_${String(n).padStart(2, '0')}.png`;
}

// Confirmed by sampling each tile's edge alpha: which sides are transparent
// (open to water) vs opaque (land), see scratch analysis. This is the only
// island shape in the pack with a full N/S/E/W edge set, so it's the one
// coastline autotile we use.
export const SAND_EDGE = { N: 2, S: 34, W: 17, E: 19 };
export const SAND_CORNER = { NW: 1, NE: 3, SW: 33, SE: 35 };
export const SAND_INTERIOR = [4, 5, 18, 20, 21, 68, 69];
export const GRASS_INTERIOR = [39, 40];

export const ROCK_TILES = [49, 50, 51, 65, 66, 67];

// Breakwater/pier wall pieces: each is a single-tile-wide capsule segment
// that only makes sense assembled in a straight run of 2+ (cap, middle*, cap).
export const PIER_H = { LEFT_CAP: 64, MID: 96, RIGHT_CAP: 80 };
export const MOORING_TILES = [13, 14];
