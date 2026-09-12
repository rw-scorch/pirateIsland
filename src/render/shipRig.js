// Ship assembly. Layer order and offsets calibrated against
// assets/ships/prebuilt/ship (3).png (hullLarge 1 + sailLarge 9 + flag 3),
// which lines up as: sail, mast, crow's nest and flag are all horizontally
// centered on the hull, at fixed vertical offsets from the hull's top edge.

const SAIL_TOP_OFFSET = 19; // px below hull top
const MAST_TOP_OFFSET = -2; // px above hull top
const NEST_TOP_OFFSET = 9;
const FLAG_TOP_OFFSET = -5;

// Deck slots in hull-local pixel space (hullLarge is 50x108). Gun line sits
// port and starboard amidships; crew fill the exposed deck fore of the sail
// and aft of it.
const GUN_SLOTS = [
  { x: 6, y: 42, side: -1 },
  { x: 44, y: 42, side: 1 },
  { x: 6, y: 68, side: -1 },
  { x: 44, y: 68, side: 1 },
];

const CREW_SLOTS = [
  { x: 25, y: 10 },
  { x: 14, y: 70 },
  { x: 36, y: 74 },
  { x: 25, y: 84 },
  { x: 15, y: 94 },
  { x: 35, y: 97 },
];

export function sailIndexFor(faction, wear) {
  return (wear - 1) * 6 + faction;
}

function img(images, path) {
  const im = images.get(path);
  if (!im) throw new Error(`missing image ${path}`);
  return im;
}

// Draws centered at (screenX, screenY), rotated by heading (radians,
// 0 = sprite default orientation, bow toward +y in local space).
export function drawShip(ctx, images, ship, screenX, screenY, scale = 1) {
  const hull = img(images, `assets/ships/hull/hullLarge (${ship.hullCondition}).png`);
  const hullW = hull.width;
  const hullH = hull.height;
  const originX = -hullW / 2;
  const originY = -hullH / 2;

  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(ship.heading);
  ctx.scale(scale, scale);

  // hull
  ctx.drawImage(hull, originX, originY);

  // gun line
  const cannon = img(images, 'assets/ships/gun/cannon.png');
  for (const slot of GUN_SLOTS) {
    ctx.save();
    ctx.translate(originX + slot.x, originY + slot.y);
    ctx.rotate(slot.side < 0 ? -Math.PI / 2 : Math.PI / 2);
    ctx.drawImage(cannon, -cannon.width / 2, -cannon.height / 2);
    ctx.restore();
  }

  // crew
  const crewSprites = [];
  for (let i = 1; i <= ship.crewCount; i++) {
    crewSprites.push(img(images, `assets/ships/crew/crew (${i}).png`));
  }
  crewSprites.forEach((sprite, i) => {
    const slot = CREW_SLOTS[i];
    ctx.drawImage(sprite, originX + slot.x - sprite.width / 2, originY + slot.y - sprite.height / 2);
  });

  if (ship.mastIntact) {
    // sail
    const sailIndex = sailIndexFor(ship.faction, ship.sailWear);
    const sail = img(images, `assets/ships/sail/sailLarge (${sailIndex}).png`);
    const sailX = originX + (hullW - sail.width) / 2;
    const sailY = originY + SAIL_TOP_OFFSET;
    ctx.drawImage(sail, sailX, sailY);

    // mast
    const pole = img(images, 'assets/ships/rig/pole.png');
    const poleX = originX + (hullW - pole.width) / 2;
    const poleY = originY + MAST_TOP_OFFSET;
    ctx.drawImage(pole, poleX, poleY);

    // crow's nest
    const nest = img(images, 'assets/ships/rig/nest.png');
    const nestX = originX + (hullW - nest.width) / 2;
    const nestY = originY + NEST_TOP_OFFSET;
    ctx.drawImage(nest, nestX, nestY);

    // flag
    const flag = img(images, `assets/ships/flag/flag (${ship.faction}).png`);
    const flagX = originX + (hullW - flag.width) / 2;
    const flagY = originY + FLAG_TOP_OFFSET;
    ctx.drawImage(flag, flagX, flagY);
  }

  ctx.restore();
}
