import { HULL_W, HULL_H, SAIL_BAND, MAST_ZONE } from '../render/shipRig.js';
import { clamp } from '../vecmath.js';

export const HULL_MAX_HP = 100;
export const SAIL_MAX_HP = 100;
export const MAST_MAX_HP = 60;

// A cannonball arriving at (localX, localY) in hull-local space (origin at
// hull top-left, same frame CREW_SLOTS/GUN_SLOTS use) picks a subsystem by
// where it actually landed, so the visible damage in shipRig.js is driven
// by real hits rather than a single health pool.
export function subsystemAt(ship, localX, localY) {
  const centerX = HULL_W / 2;
  if (
    ship.mastIntact &&
    localY >= MAST_ZONE.top &&
    localY <= MAST_ZONE.bottom &&
    Math.abs(localX - centerX) <= MAST_ZONE.halfWidth
  ) {
    return 'mast';
  }
  if (ship.mastIntact && localY >= SAIL_BAND.top && localY <= SAIL_BAND.bottom) {
    return 'sail';
  }
  const onOpenDeck = localY < SAIL_BAND.top || localY > SAIL_BAND.bottom;
  if (onOpenDeck && ship.crewCount > 0) {
    return 'crew';
  }
  return 'hull';
}

export function applyDamage(ship, subsystem, amount) {
  switch (subsystem) {
    case 'hull':
      ship.hullHp = clamp(ship.hullHp - amount, 0, HULL_MAX_HP);
      break;
    case 'sail':
      ship.sailHp = clamp(ship.sailHp - amount, 0, SAIL_MAX_HP);
      break;
    case 'mast':
      ship.mastHp = clamp(ship.mastHp - amount, 0, MAST_MAX_HP);
      break;
    case 'crew':
      ship.crewCount = Math.max(0, ship.crewCount - 1);
      break;
  }
  syncTiersFromHp(ship);
}

export function syncTiersFromHp(ship) {
  ship.hullCondition = tierFromHp(ship.hullHp, HULL_MAX_HP);
  ship.sailWear = tierFromHp(ship.sailHp, SAIL_MAX_HP);
  if (ship.mastHp <= 0) ship.mastIntact = false;
}

function tierFromHp(hp, max) {
  const frac = hp / max;
  if (frac > 0.75) return 1;
  if (frac > 0.5) return 2;
  if (frac > 0.25) return 3;
  return 4;
}
