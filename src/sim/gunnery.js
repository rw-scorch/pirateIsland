import { GUN_SLOTS, HULL_W, HULL_H } from '../render/shipRig.js';
import { subsystemAt, applyDamage } from './damage.js';

const BALL_SPEED = 260; // px/s
const BALL_RANGE = 480; // px, balls expire past this
const HIT_RADIUS = 34; // px, roughly a hull half-width
const DAMAGE_MIN = 10;
const DAMAGE_MAX = 18;
const FIRE_COOLDOWN = 0.6; // s, per ship

function rotate(x, y, heading) {
  return {
    x: x * Math.cos(heading) - y * Math.sin(heading),
    y: x * Math.sin(heading) + y * Math.cos(heading),
  };
}

// Local hull-space point -> world point for a ship at its current pose.
function localToWorld(ship, localX, localY) {
  const centered = rotate(localX - HULL_W / 2, localY - HULL_H / 2, ship.heading);
  return { x: ship.x + centered.x, y: ship.y + centered.y };
}

function worldToLocal(ship, worldX, worldY) {
  const dx = worldX - ship.x;
  const dy = worldY - ship.y;
  // inverse rotation (rotation matrices are orthogonal, so transpose = inverse)
  const localX = dx * Math.cos(ship.heading) + dy * Math.sin(ship.heading);
  const localY = -dx * Math.sin(ship.heading) + dy * Math.cos(ship.heading);
  return { x: localX + HULL_W / 2, y: localY + HULL_H / 2 };
}

// Which broadside (-1 port, 1 starboard) a world point falls on, relative
// to the shooter's heading.
export function sideTowards(ship, worldX, worldY) {
  const dx = worldX - ship.x;
  const dy = worldY - ship.y;
  const localX = dx * Math.cos(ship.heading) + dy * Math.sin(ship.heading);
  return localX < 0 ? -1 : 1;
}

export function canFire(ship) {
  return !(ship.reloadTimer > 0);
}

export function fireBroadside(ship, side, spawnBall) {
  if (!canFire(ship)) return;
  ship.reloadTimer = FIRE_COOLDOWN;
  const dir = rotate(side, 0, ship.heading);
  for (const slot of GUN_SLOTS) {
    if (slot.side !== side) continue;
    const muzzle = localToWorld(ship, slot.x, slot.y);
    spawnBall({
      x: muzzle.x,
      y: muzzle.y,
      vx: dir.x * BALL_SPEED,
      vy: dir.y * BALL_SPEED,
      traveled: 0,
      shooter: ship,
    });
  }
}

// Advances all balls, resolves hits against candidate target ships (an
// array excluding the shooter is fine too; a ship won't usually be hit by
// its own broadside since balls launch sideways from its own hull).
export function updateCannonballs(balls, ships, dt, onHit) {
  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.traveled += Math.hypot(b.vx * dt, b.vy * dt);

    let hit = false;
    for (const ship of ships) {
      if (ship === b.shooter) continue;
      if (Math.hypot(ship.x - b.x, ship.y - b.y) > HIT_RADIUS) continue;
      const local = worldToLocal(ship, b.x, b.y);
      const subsystem = subsystemAt(ship, local.x, local.y);
      const damage = DAMAGE_MIN + Math.random() * (DAMAGE_MAX - DAMAGE_MIN);
      applyDamage(ship, subsystem, damage);
      onHit?.(ship, subsystem, b.x, b.y, b.shooter);
      hit = true;
      break;
    }

    if (hit || b.traveled >= BALL_RANGE) {
      balls.splice(i, 1);
    }
  }
}

export function updateReload(ship, dt) {
  if (ship.reloadTimer > 0) ship.reloadTimer = Math.max(0, ship.reloadTimer - dt);
}
