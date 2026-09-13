// Central game state. No DOM references here — main.js and debugPanel.js
// read and mutate this, render/ and sim/ draw from and update it.

import { createWind } from './sim/wind.js';

export function createShip(overrides = {}) {
  const sailFaction = overrides.sailFaction ?? 1;
  return {
    x: 0,
    y: 0,
    heading: 0, // radians, 0 = sprite default orientation (bow toward +y)
    speed: 0, // px/s, current
    trim: 0.5, // 0 (no sail) .. 1 (full sail)
    anchored: false,
    hullCondition: 1, // 1 best .. 4 worst, derived from hullHp after combat damage
    sailWear: 1, // 1 clean .. 4 struck, derived from sailHp after combat damage
    sailFaction, // 1..6, the emblem sewn into the sail — a ship's real colours
    flagFaction: sailFaction, // 1..6, the flag actually flown — settable independently;
    // flagFaction !== sailFaction is running false colours (see sim/factions.js)
    crewCount: 6, // 0..6
    mastIntact: true,
    hullHp: 100,
    sailHp: 100,
    mastHp: 60,
    reloadTimer: 0,
    ...overrides,
  };
}

export const FACTIONS = [
  { id: 1, name: 'Free companies' },
  { id: 2, name: 'The Black Account' },
  { id: 3, name: 'Sanctuary fleet' },
  { id: 4, name: 'Sworn companies' },
  { id: 5, name: 'Admiralty' },
  { id: 6, name: 'Coin cartel' },
];

export function createState() {
  return {
    player: createShip({ sailFaction: 1 }),
    wind: createWind(),
    standings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  };
}

export function setHullCondition(ship, value) {
  ship.hullCondition = clamp(value, 1, 4);
}

export function setSailWear(ship, value) {
  ship.sailWear = clamp(value, 1, 4);
}

// Debug-panel convenience: sets both sail and flag together, since the
// panel is for calibrating ship assembly, not for testing false colours.
export function setFaction(ship, value) {
  const v = clamp(value, 1, 6);
  ship.sailFaction = v;
  ship.flagFaction = v;
}

export function setCrewCount(ship, value) {
  ship.crewCount = clamp(value, 0, 6);
}

export function setMastIntact(ship, value) {
  ship.mastIntact = !!value;
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}
