// Central game state. No DOM references here — main.js and debugPanel.js
// read and mutate this, render/ and sim/ draw from and update it.

import { createWind } from './sim/wind.js';

export function createShip(overrides = {}) {
  return {
    x: 0,
    y: 0,
    heading: 0, // radians, 0 = sprite default orientation (bow toward +y)
    speed: 0, // px/s, current
    trim: 0.5, // 0 (no sail) .. 1 (full sail)
    anchored: false,
    hullCondition: 1, // 1 best .. 4 worst, derived from hullHp after combat damage
    sailWear: 1, // 1 clean .. 4 struck, derived from sailHp after combat damage
    faction: 1, // 1..6, see FACTIONS
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
    player: createShip({ faction: 1 }),
    wind: createWind(),
  };
}

export function setHullCondition(ship, value) {
  ship.hullCondition = clamp(value, 1, 4);
}

export function setSailWear(ship, value) {
  ship.sailWear = clamp(value, 1, 4);
}

export function setFaction(ship, value) {
  ship.faction = clamp(value, 1, 6);
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
