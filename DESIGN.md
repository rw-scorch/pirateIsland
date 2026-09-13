# Marrow Sea

A top-down age-of-sail roguelite for the browser. One voyage is one run: you leave a
home port on the safe edge of an archipelago, work your way across it, and try to
reach the far side with a hull still under you.

Source library: <https://github.com/eturner58/game-assets>
Upstream: Kenney Game Assets All-in-1 v3.7.0. Licence CC0 1.0.
Credit line: Art by Kenney (kenney.nl) - CC0.

---

## Why this selection

The Pirate Pack is not a set of ship sprites. It is a set of ship *parts*: eight
hulls, thirty-seven sails, six flags, six crew figures, four gun variants and four
plank sprites, all drawn to the same top-down axis. Nothing else in the library is
built that way. That fact decides the whole design.

If the ship is assembled from parts at draw time, then the ship can be taken apart
at run time. Damage stops being a health bar and becomes a picture: the sail goes
from clean to torn to grey, the hull darkens, crew figures disappear off the deck
one at a time, the mast falls. The player reads their own condition off the sprite
without looking at a gauge.

Everything else in the pack was chosen to support that, and nothing was chosen that
fights it on style. All of it is Kenney vector-flat, so it sits together.

---

## The six flags

The Pirate Pack ships six sail emblems and six matching flags. Those are the
factions, no invention needed.

| Sprite index | Emblem | Faction | Disposition |
|---|---|---|---|
| 1 | plain canvas | Free companies | Neutral traders. Fire on them and everyone hears. |
| 2 | skull | The Black Account | Attack anything slower than them. |
| 3 | red cross | Sanctuary fleet | Hostile to the Black Account, suspicious of everyone else. |
| 4 | green crossed swords | Sworn companies | Mercenary. Their standing is purchasable. |
| 5 | blue wave | Admiralty | Patrol the safe lanes. Turn hostile if you fly false colours. |
| 6 | yellow cross | Coin cartel | Own the ports. Never fight if a toll will do. |

Flags are a separate sprite from sails, so you can fly one faction's flag over
another's sails. That is the disguise mechanic: run false colours to pass a patrol,
and take a heavy standing hit with everyone watching if you are caught firing under
them.

---

## The loop

1. **Port.** Repair, re-crew, buy powder, read the chart, take a contract.
2. **Open water.** Sail under a wind field. Sail trim against wind angle sets speed.
3. **Encounter.** Something on the horizon flying one of six flags.
4. **Gunnery.** Steer with the keyboard, aim and fire the broadside with the mouse.
5. **Resolve.** Sink them, board them, or break off. Loot, standing change, damage.
6. **Push on or put in.** Deeper water pays better and repairs are further away.

A run ends when you reach the far port or the hull opens.

---

## Systems, and the assets that carry them

### Ship assembly and damage

Draw order, bottom to top: hull, gun line, crew, sail, mast, crow nest, flag.

- `assets/ships/hull/` - `hullLarge (1-4)` and `hullSmall (1-4)`. The four variants
  are condition, not colour. Step down as hull integrity falls.
- `assets/ships/sail/` - `sailLarge (1-24)` is six emblems by four wear states.
  `sailSmall (1-13)` is the same idea for fore and mizzen. Wear state multiplies
  speed: clean, frayed, holed, struck.
- `assets/ships/rig/pole.png`, `nest.png` - mast and lookout. Losing the mast
  removes the sail entirely and drops you to oars.
- `assets/ships/crew/crew (1-6)` - one sprite per crew member on deck. Reload rate
  and boarding strength both read off the count still drawn.
- `assets/ships/gun/` - `cannon` fixed, `cannonMobile` traversable, `cannonLoose`
  for a gun broken free and rolling, `cannonBall` in flight.
- `assets/ships/debris/wood (1-4)` - what is left in the water afterwards.
- `assets/ships/prebuilt/` - Kenney's own assemblies, thirty of them. Use these to
  calibrate layer offsets, and the grey `ship (19-24)` set as derelicts and wrecks.

### Water and land

- `assets/world/tiles/` - 96 tiles at 64px. Only `tile_73` is open water, so treat
  the sea as your own animated layer underneath and use these as what sits on it.
  - `tile_01-09`, `tile_17-22`, `tile_33-41`, `tile_52-57`, `tile_68-69` - sand and
    grass with every coastline edge and corner. This is the island autotile set.
  - `tile_10-12`, `tile_26-28`, `tile_42-44`, `tile_58-59`, `tile_63-64`,
    `tile_74-75`, `tile_79-80`, `tile_89-92`, `tile_95-96` - stone, for quays,
    breakwaters and fortifications.
  - `tile_13-14`, `tile_29-30`, `tile_45-46`, `tile_61-62`, `tile_77-78`,
    `tile_93-94` - mooring rings set into stone. Mark these as berths.
  - `tile_15-16`, `tile_60` - timber decking for wooden jetties.
  - `tile_49-51`, `tile_65-67`, `tile_85-86` - rocks. Hazards at speed.
  - `tile_23-24`, `tile_70-72`, `tile_87-88` - grass, palms and scrub.
  - `tile_31-32`, `tile_47-48`, `tile_76` - barrels and crates. Cargo on the quay.
  - `tile_81-84` - a beached wreck and abandoned gear. Set dressing for a derelict
    island, or a landmark on the chart.
- `assets/world/tiles_sheet.png` plus `tilesheets.txt` if you would rather atlas it.

### Gunnery

- `assets/fx/particles/muzzle_01-05` at the gun port on fire.
- `assets/fx/particles/smoke_*` for the powder cloud, tinted grey, and for the wake,
  tinted white at low alpha. These are greyscale by design, so one texture set does
  smoke, spray and fog.
- `assets/fx/pirate/explosion1-3` and `fire1-2` for hits, drawn in the same style as
  the ships.
- `assets/fx/explosion/` for bigger events: a powder store going up, a shore battery.
- `assets/fx/particles/scorch_*` as a decal left on a struck hull.
- `assets/cursors/crosshair-*` - 007 for the aiming reticle, 018 for a locked
  target, 033 for range rings, 011 for the firing arc, 005 to mark a miss.

### The chart

A separate screen, drawn as a paper chart rather than a minimap.

- `assets/chart/paper/parchment*.png` - four 1024px sheets. Use `parchmentFolded`
  for the full chart and `parchmentCrinkled` for a torn fragment found at sea.
- `assets/chart/icons/` - line art that already matches the fiction: `ship`,
  `lighthouse`, `dock`, `skull` for wrecks, `chest` for cached loot, `vulcano`,
  `rocks*` for hazards, `castle*` and `tower*` for fortified ports, `compass` for
  the rose, `element*` as the six faction shields, `arrow*` and `path*` for plotted
  routes.

Chart fragments as loot is the roguelite meta: a run that ends badly still leaves
you better charted for the next one.

### Instruments

- `assets/ui/panel_brown*` - 9-patch panels for port and inventory screens.
  `panel_brown_damaged` is the one to use when the ship is in a bad way.
- `assets/ui/progress_*` - red for hull, green for crew, blue for powder, white for
  the boarding timer. Each has a matching `_border` frame.
- `assets/ui/minimap_ring_brown_detail.png` with `minimap_compass_toon_n/e/s/w` -
  the compass rose. Rotate the ring, keep the letters upright, and put a wind arrow
  from `minimap_arrow_*` on the outside.
- `assets/ui/minimap_icon_*` - contacts on the compass ring: jewel for cargo,
  exclamation for hostile, star for objective.
- `assets/ui/round_*` and `button_*` - controls.
- `assets/prompts/` - `keyboard_a/d` helm, `keyboard_w/s` sail trim, `keyboard_space`
  drop anchor, `mouse_left` fire, `mouse_right` aim, `mouse_move` traverse,
  `keyboard_m` chart, `keyboard_tab` ship status.
- `assets/fonts/Kenney Future Narrow.ttf` for interface, `Kenney Pixel.ttf` for the
  ship's log.

### Sound

- `audio/cannon/` - pitch `lowFrequency_explosion_*` down about four semitones for
  the broadside; layer `explosionCrunch_*` on top. `rumble*` for guns heard at
  distance.
- `audio/impact/` - `impactWood_heavy_*` for a ball into timber,
  `impactPlank_medium_*` for splintering, `impactBell_heavy_000` as the ship's bell.
- `audio/water/` - `sinkWater*` for splashes, `sinkDrain1` for going under.
- `audio/rig/` - `woosh*` on sail catch and on a ball passing close, `creak*` under
  load, `cloth*` on trim, `footstep_wood_*` for crew.
- `audio/boarding/`, `audio/port/`, `audio/ui/`, `audio/music/` as named.

Known gap: there is no true cannon report anywhere in the Kenney audio library. The
substitutes above work once pitched and layered, but this is the one place where the
kit does not cover the design.

---

## Suggested build order

1. Ship assembly from parts, with a debug panel to set each subsystem's state.
2. Sailing: wind field, trim, turn rate that falls with hull damage.
3. Tile world, coastline collision, one port you can tie up at.
4. Gunnery: mouse aim, ball flight with travel time, hit resolution per subsystem.
5. One hostile faction, then the standing matrix across all six.
6. Chart screen and fog of war.
7. Loot, refit and the between-run carry.

Step one is the one that matters. If the ship does not come apart convincingly, the
rest of the design has nothing to stand on.

---

## Contents

493 files. Open `index.html` to browse them, or read `manifest.json` for the machine
readable index. Each entry carries the original path inside the Kenney library and a
note on what it is for here.
