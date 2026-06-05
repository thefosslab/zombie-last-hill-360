# Maker Handoff: Scene Reconstruction First

This repository contains a playable extracted build, but the original game code is a monolithic generated runtime. Do not ask Maker to infer the scene from `original/index.html` line by line.

Use this handoff as the source of truth for reconstruction.

## Current Problem

Maker is failing to restore the scene because the repo is a runnable build, not a clean source project. The scene is created procedurally inside one large HTML file.

The correct workflow is:

```text
1. Rebuild the scene shell from this spec.
2. Verify the scene visually.
3. Rebuild the current 360-degree combat loop.
4. Only then add in-run/out-of-run progression.
```

Do not add progression, robots, ads, or new enemies before the scene passes acceptance.

## Important Files

- `original/index.html`: playable generated build and current behavior reference.
- `original/game_config.json`: current gameplay values.
- `original/asset_map.json`: local asset list and prompts.
- `original/assets/`: downloaded images and audio.
- `DESIGN.md`: product direction for in-run roguelite and out-of-run progression.
- `ART_DIRECTION.md`: color, lighting, material, and readability rules for Maker art passes.

## Scene Identity

The game is a first-person 360-degree hilltop defense scene.

The player stands at the center of a raised circular hilltop. A ring of sandbags surrounds the player. Zombies climb from the outer wasteland up the slope and attack from all directions. The world should feel like an apocalyptic battlefield: muted dirt, dead trees, ruins, distant smoke, murky water, and changing sky colors by wave.

Do not rebuild it as a flat arena.
Do not rebuild it as a side-scroller.
Do not rebuild it as a tower-defense board.

## Camera And Player Anchor

Required:

- First-person camera.
- FOV: around 75 degrees.
- Camera position: centered on hilltop, approximately `(0, 15, 0)`.
- Initial pitch: looking slightly down at the slope, around `-0.4`.
- Horizontal yaw: full 360 degrees.
- Player does not walk freely during normal combat.
- Player shoots from the center with a visible gun/turret in the foreground.

Acceptance:

- The player can rotate all the way around.
- Looking down reveals enemies climbing the hill.
- The sandbag ring remains visually close around the player.

## Terrain Layout

Use these coordinates as reconstruction anchors.

| Element | Required Design |
|---|---|
| Hilltop platform | Circular/cylindrical platform, radius about `6`, height about `1`, center at `(0, 10, 0)` |
| Player camera | Around `(0, 15, 0)` |
| Sandbag ring | Radius about `4`, 12 blocky sandbags around center |
| Slope | Circular slope from radius `6` to about `120` |
| Slope top Y | Around `9.5` |
| Slope bottom Y | Around `-15` |
| Outer wasteland | Ring from radius `120` to about `400` |
| Distant water/swamp | Ring from radius `250` to about `500`, slightly below terrain |

The key scene silhouette is:

```text
center gun/camera
↓
small flat circular hilltop
↓
ring of sandbags
↓
steep circular slope
↓
wasteland/ruins/dead trees
↓
far swamp/water and sky dome
```

## Defensive Ring Details

Sandbags:

- 12 sandbag blocks around the player.
- Each block roughly `2 x 1 x 1`.
- Main layer around Y `10.7`.
- Second stacked layer every other sandbag around Y `11.5`.
- Blocky/Minecraft-like style is acceptable.

Cardinal decorations:

- East: radio/communication box with antenna.
- North: slanted wooden stick.
- West: torn cloth/rag on sandbags.
- South: ammo crates with bullet belt.

These decorations help Maker and testers know the 360-degree orientation is correct.

## Environment Details

Required:

- Apocalyptic sky dome.
- Distant smoke columns.
- Muted earth terrain.
- Rocks embedded in slope.
- Dead blocky trees in the distance.
- Distant ruins/debris.
- Murky water/swamp ring.
- Fog.

Wave sky themes:

| Wave | Feel |
|---|---|
| 1 | overcast gray |
| 2 | blood dawn |
| 3 | fiery dusk |
| 4 | dark dusk |
| 5+ | night |

If Maker cannot reproduce the full procedural sky, a simpler gradient sky plus fog and smoke columns is acceptable for the first pass.

## Enemy Spawn Structure

Required:

- Enemies spawn on a full 360-degree ring.
- Spawn radius: about `100`.
- They move inward toward the hilltop.
- They should climb/enter the sandbag area before damaging the player.

Current enemy unlock order:

| Enemy | Unlock Wave |
|---|---|
| Normal | 1 |
| Helmet | 1 |
| Runner | 2 |
| Crawler | 3 |
| Bone thrower | 3 |
| Dog pack | 4 |
| Bat swarm | 5 |
| Giant | 6 |
| Screamer | 7 |

For the scene reconstruction pass, only normal placeholder zombies are required. Other enemy roles can wait.

## Current Gameplay Values

From `original/game_config.json`:

```text
playerHealth = 100
zombieHealth = 3
firstWaveZombieCount = 30
maxEnemiesOnScreen = 10
spawnAngleInitial = 360
spawnAngleIncrement = 0
spawnAngleMax = 360
autoFireRate = 0.36
autoFireBurstDelay = 0.12
airdrop.minDistance = 25
airdrop.maxDistance = 40
```

## Airdrop Scene Behavior

Current behavior:

- Airdrop appears at radius `25-40` from center.
- Plane shadow crosses the map first.
- Crate drops with parachute.
- Player can aim at the crate to collect.
- Camera temporarily runs to the crate and returns to hilltop.

For first scene reconstruction:

- A static airdrop crate marker at radius `30` is enough.
- Full plane/parachute behavior can be rebuilt later.

## HUD Anchors

Required first pass HUD:

- Crosshair centered.
- Wave display.
- Remaining enemy count.
- Health bar.
- Score.
- Start screen.
- Game over/settlement screen placeholder.

Do not focus on polishing HUD before the 3D scene is correct.

## Art Direction

After the scene structure is accepted, ask Maker to read `ART_DIRECTION.md` and perform an art/color pass only.

Do not let Maker change layout, camera, spawning, progression, robots, or monetization during the color pass.

## Maker Prompt: Phase 0 Scene

Give Maker this prompt first:

```md
Do not add new gameplay systems yet.
Do not add in-run upgrades, out-of-run progression, robots, ads, or monetization yet.

First rebuild only the scene shell for Zombie Last Hill.

The scene must be a first-person 360-degree hilltop defense arena:
- Camera at the center of an elevated hilltop, around (0, 15, 0).
- Full 360-degree horizontal rotation.
- Small circular hilltop platform, radius around 6.
- Circular sandbag defense ring around radius 4.
- 12 sandbag blocks, with every other block having a second layer.
- Circular slope falling from radius 6 to radius 120.
- Outer wasteland ring with rocks, dead trees, debris, fog, and distant murky water.
- Apocalyptic sky dome with smoke columns.
- Cardinal decorations on the sandbag ring:
  - East radio box
  - North slanted stick
  - West torn cloth
  - South ammo crates
- Add placeholder zombies spawning from a 360-degree ring at radius around 100 and walking toward the player.
- Add crosshair, health bar, wave label, and enemy count.

Acceptance:
1. Starting the game shows the hilltop, sandbag ring, slope, and distant wasteland.
2. The player can rotate 360 degrees.
3. Zombies can approach from front, back, left, and right.
4. The scene is not flat; enemies visibly come from below/up the slope.
5. No progression, robots, ads, or new systems are added in this pass.
```

## Maker Prompt: Phase 1 Current Combat

Only after Phase 0 passes:

```md
Now rebuild the current core combat loop on top of the accepted scene.

Required:
- Wave-based spawning.
- 360-degree ring spawning.
- First-person shooting from the center.
- Health loss when enemies reach the sandbag/player area.
- Score and wave progression.
- Airdrop placeholder behavior.
- Game over and restart.

Keep the code modular:
- SceneManager
- CameraController
- WaveManager
- EnemyManager
- CombatSystem
- AirdropManager
- UIManager
- GameConfig

Do not add out-of-run progression yet.
```

## Maker Prompt: Phase 2 Progression

Only after Phase 1 passes:

```md
Add the first in-run/out-of-run progression version.

Required:
- Kill-based XP bar.
- In-run level-up one-of-three choices.
- Temporary upgrades that reset after the run.
- Run settlement screen.
- Coins as the first permanent currency.
- Out-of-run weapon upgrade screen.

Do not make the game tower defense.
Robots are support/progression units, not the main gameplay.
```

## Scene Acceptance Checklist

Before asking Maker to add progression, verify:

- The game starts locally.
- The first screen renders the 3D scene.
- Camera yaw is not locked to one direction.
- The hilltop is raised above the surrounding terrain.
- The player is inside a circular sandbag ring.
- Enemies spawn from all four quadrants.
- Enemies approach from below/up the slope.
- The sky/fog/wasteland mood is visible.
- The HUD does not block the center shooting view.
- No unrelated new systems were added.

## Common Failure Modes

Reject the output if:

- The arena is flat.
- The camera is third-person without explicit approval.
- Enemies only spawn from one direction.
- The player can walk away from the hilltop during normal combat.
- The sandbag ring is missing.
- Maker adds robots/progression before scene acceptance.
- Maker turns the game into a lane tower-defense layout.
- Maker removes the current 360-degree shooting identity.
