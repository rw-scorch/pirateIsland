// Standing matrix from DESIGN.md. Standings are a plain number per faction
// id on state.standings: positive is friendly, negative is angered.
// 0 is the neutral starting point for all six.

export const DETECT_RANGE = 420; // px, how far an Admiralty patrol can notice a disguise
const SUSPICION_RATE = 6; // per second, just from loitering nearby in false colours
const FIRE_SUSPICION_JUMP = 55; // "caught firing under them"
const EXPOSED_STANDING_HIT = 30;
const FIRE_STANDING_HIT = 15;
const WITNESSED_HIT = 8; // "fire on [Free companies] and everyone hears"

// The Black Account is aggressive by nature; the rest are neutral unless
// provoked. Standing can push either side of that baseline.
export function isHostile(ai, standings) {
  const st = standings[ai.flagFaction] ?? 0;
  if (ai.flagFaction === 5 && ai.exposed) return true; // caught running false colours
  if (ai.flagFaction === 6) return st <= -40; // coin cartel: a toll beats a fight, almost always
  if (ai.flagFaction === 2) return st < 40; // Black Account: hostile unless well paid off
  return st <= -20; // Free companies, Sanctuary fleet, Sworn companies, Admiralty (unexposed)
}

export function isFlyingFalseColours(ship) {
  return ship.flagFaction !== ship.sailFaction;
}

// Called every frame for each faction-5 ship, whether hostile yet or not,
// so a disguise can be "seen through" over time or instantly on a shot.
export function updateAdmiraltySuspicion(ai, player, dt, justFired, standings) {
  if (ai.flagFaction !== 5 || ai.exposed) return;
  const dist = Math.hypot(player.x - ai.x, player.y - ai.y);
  if (dist > DETECT_RANGE || !isFlyingFalseColours(player)) return;
  ai.suspicion = (ai.suspicion ?? 0) + SUSPICION_RATE * dt + (justFired ? FIRE_SUSPICION_JUMP : 0);
  if (ai.suspicion >= 100) {
    ai.exposed = true;
    standings[5] = (standings[5] ?? 0) - EXPOSED_STANDING_HIT;
  }
}

// Standing consequence for firing on `target` (whatever flag it's flying —
// that's what witnesses see, not its real sail colours).
export function applyFireConsequence(target, standings) {
  const flag = target.flagFaction;
  standings[flag] = (standings[flag] ?? 0) - FIRE_STANDING_HIT;
  if (flag === 1) {
    for (const f of [1, 2, 3, 4, 5, 6]) {
      if (f === flag) continue;
      standings[f] = (standings[f] ?? 0) - WITNESSED_HIT;
    }
  }
}
