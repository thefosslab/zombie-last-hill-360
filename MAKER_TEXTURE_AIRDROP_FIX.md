# Maker Fix: Texture Pass And Airdrop State

Use this document when Maker has restored the scene structure but the game still looks too plain, has no texture/material design, or has broken airdrop behavior.

Do not add progression, robots, ads, new weapons, or new chapters during this pass.
Do not change the camera anchor, hilltop layout, 360-degree spawning, wave rules, or core shooting loop.

## Current Problems To Fix

Observed issues:

- The game looks too plain because most surfaces use flat colors.
- Terrain, sandbags, ruins, gun, airdrop crate, and enemies do not have material identity.
- Airdrop falls through or lands under the ground.
- When collecting an airdrop, the player still carries the first-person machine gun.

These are asset/material and state-machine bugs.

## Required Fix Order

Fix in this order:

```text
1. Add material/texture identity to major scene surfaces.
2. Fix airdrop landing height so the crate lands on terrain, never underground.
3. Fix airdrop collection player state: hide first-person gun, disable shooting, restore after return.
4. Verify with a close airdrop test and screenshots.
```

## Texture And Material Pass

The game can remain low-poly/blocky, but it cannot look like untextured placeholder geometry.

Every major object class needs either:

- A local image texture from `original/assets/`.
- A procedural canvas texture.
- At minimum, clear face colors plus noise/seams/highlights.

Flat single-color materials are only acceptable for tiny UI markers, hit flashes, or debug objects.

## Required Surface Materials

| Surface | Required Material Identity |
|---|---|
| Hilltop platform | rocky dirt, sparse dry grass/noise, warm brown |
| Slope | darker dirt, subtle stratified bands, small stone flecks |
| Outer wasteland | dark olive/charcoal ground, low contrast noise |
| Sandbags | tan fabric blocks, darker seams, side shading, dirt stains |
| Ruins/debris | broken concrete/stone, edge highlights, not pure black |
| Dead wood | brown grain lines, darker cracks |
| Gun | dark blue-black metal, steel highlights, brass/copper detail |
| Airdrop crate | red crate body, blue tarp/top, rope/metal corner accents |
| Zombies | green skin, teal shirt, dark pants, visible eyes/mouth |
| Water/swamp | dark teal with subtle tiling/noise |

## Local Assets To Reuse

If Maker can load local assets, use these first:

```text
original/assets/hilltop_ground_texture_hilltop_ground_texture_136b6627-ba95-4e77-a9db-e6fb1461654b.webp
original/assets/beach_sand_texture_beach_sand_texture_b678f970-52a4-49ab-8e7a-c17befdad8ba.webp
original/assets/ocean_water_texture_ocean_water_texture_2cb3b5c6-57f8-4bd0-8a35-68ec393b79a2.webp
original/assets/zombie_texture_zombie_texture_dffb99f7-a6c8-4cb6-97a1-40611bd2ccea.webp
```

Texture setup:

```js
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.colorSpace = THREE.SRGBColorSpace;
texture.needsUpdate = true;
```

For pixel/blocky textures:

```js
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
```

For terrain textures:

```js
texture.repeat.set(8, 8);
```

## Procedural Texture Fallback

If image textures are unreliable, generate canvas textures. Do not fall back to flat colors.

Minimum acceptable procedural material examples:

```js
function makeNoiseTexture(base, dark, light, size = 128, block = 4) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += block) {
    for (let x = 0; x < size; x += block) {
      const roll = Math.random();
      ctx.fillStyle = roll < 0.45 ? base : (roll < 0.75 ? dark : light);
      ctx.globalAlpha = 0.18 + Math.random() * 0.18;
      ctx.fillRect(x, y, block, block);
    }
  }

  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

const slopeDirtTex = makeNoiseTexture('#3A3028', '#2A241F', '#514236');
const sandbagTex = makeNoiseTexture('#B18A55', '#6B5034', '#D0A86C', 64, 4);
const metalTex = makeNoiseTexture('#20262D', '#11161A', '#59626C', 64, 2);
```

Add seams/details for sandbags:

```js
// Add dark horizontal/vertical seam lines to the sandbag texture canvas.
```

Add grain lines for wood:

```js
// Add thin darker lines across the wood texture, plus a few knots.
```

## Material Rejection Rules

Reject Maker output if:

- The terrain is mostly one flat color.
- Sandbags are plain boxes with no seams/noise.
- The gun is a flat black shape.
- Zombies have no visible facial/body color separation.
- Ruins are pure black blocks.
- Airdrop crate is a plain gray or black cube.

## Airdrop Landing Bug

The airdrop must land on the terrain surface, never below it.

The current layout has a raised hilltop and a sloped radial terrain. A fixed Y value will often be wrong. Landing height must be calculated from the drop position.

Use either raycast-to-terrain or the same analytic height function used by the scene.

## Preferred: Raycast To Terrain

If terrain meshes exist:

```js
function getGroundYByRaycast(x, z) {
  const raycaster = new THREE.Raycaster(
    new THREE.Vector3(x, 120, z),
    new THREE.Vector3(0, -1, 0),
    0,
    250
  );
  const hits = raycaster.intersectObjects(terrainMeshes, true);
  if (hits.length > 0) return hits[0].point.y;
  return getGroundYAnalytic(x, z);
}
```

`terrainMeshes` should include:

- Hilltop platform.
- Slope mesh.
- Outer wasteland ground.

## Fallback: Analytic Terrain Height

If raycast is unavailable, use the scene's radial terrain anchors:

```js
const HILLTOP_RADIUS = 6;
const SLOPE_OUTER_RADIUS = 120;
const HILLTOP_TOP_Y = 10.5;
const SLOPE_TOP_Y = 9.5;
const SLOPE_BOTTOM_Y = -15;

function getGroundYAnalytic(x, z) {
  const r = Math.hypot(x, z);
  if (r <= HILLTOP_RADIUS) return HILLTOP_TOP_Y;
  if (r <= SLOPE_OUTER_RADIUS) {
    const t = (r - HILLTOP_RADIUS) / (SLOPE_OUTER_RADIUS - HILLTOP_RADIUS);
    return SLOPE_TOP_Y - Math.pow(t, 0.7) * (SLOPE_TOP_Y - SLOPE_BOTTOM_Y);
  }
  return SLOPE_BOTTOM_Y;
}
```

When landing the crate:

```js
const crateHalfHeight = 0.8;
const groundY = getGroundYByRaycast(x, z);
airdrop.position.set(x, groundY + crateHalfHeight + 0.05, z);
airdrop.userData.groundY = groundY;
airdrop.state = 'landed';
```

During falling:

```js
const targetY = groundY + crateHalfHeight + 0.05;
airdrop.position.y = Math.max(targetY, airdrop.position.y - fallSpeed * dt);
if (airdrop.position.y <= targetY + 0.01) {
  airdrop.position.y = targetY;
  airdrop.state = 'landed';
}
```

Shadow:

```js
shadow.position.y = groundY + 0.03;
```

## Airdrop Spawn Placement

For testing, place airdrop where it is easy to inspect:

```js
const TEST_AIRDROP_RADIUS = 28;
```

Rules:

- Spawn at radius `25-40` from center for gameplay.
- Clamp out of the sandbag ring; do not spawn inside radius `8`.
- Do not spawn beyond visibility/fog-heavy range during testing.
- After landing, crate top must be visibly above the terrain.

## Airdrop Collection State Bug

When the player leaves the hilltop to collect an airdrop, the first-person machine gun must not remain attached to the camera.

The player should not run to a supply crate while carrying the mounted turret.

Use an explicit player interaction state:

```js
const PlayerMode = {
  TURRET: 'turret',
  RUN_TO_AIRDROP: 'run_to_airdrop',
  LOOT_AIRDROP: 'loot_airdrop',
  RETURN_TO_TURRET: 'return_to_turret'
};

let playerMode = PlayerMode.TURRET;
```

Visibility and shooting rules:

| Player Mode | First-Person Gun | Can Shoot | Crosshair |
|---|---|---|---|
| `TURRET` | visible | yes | combat |
| `RUN_TO_AIRDROP` | hidden | no | hidden or interact |
| `LOOT_AIRDROP` | hidden | no | interact |
| `RETURN_TO_TURRET` | hidden | no | hidden |

State transitions:

```js
function enterAirdropRunMode() {
  playerMode = PlayerMode.RUN_TO_AIRDROP;
  firstPersonGun.visible = false;
  canShoot = false;
  crosshair.visible = false;
  stationaryTurret.visible = true; // optional world model left on hilltop
}

function enterAirdropLootMode() {
  playerMode = PlayerMode.LOOT_AIRDROP;
  firstPersonGun.visible = false;
  canShoot = false;
  crosshair.visible = true;
  setCrosshairInteractMode(true);
}

function returnToTurretMode() {
  playerMode = PlayerMode.TURRET;
  firstPersonGun.visible = true;
  canShoot = true;
  crosshair.visible = true;
  setCrosshairInteractMode(false);
  stationaryTurret.visible = false;
}
```

Shooting guard:

```js
function shoot() {
  if (playerMode !== PlayerMode.TURRET) return;
  if (!canShoot) return;
  // normal shooting
}
```

Render/update guard:

```js
firstPersonGun.visible = playerMode === PlayerMode.TURRET;
```

## Airdrop Collection Acceptance

Required:

- Airdrop crate lands on visible terrain, not under it.
- Crate remains above ground after landing and during collection.
- When running to the airdrop, first-person machine gun is hidden.
- Player cannot shoot while running to/looting/returning from airdrop.
- A stationary turret can be left at the hilltop as a world object.
- When the player returns to the hilltop, the first-person gun reappears.
- Crosshair mode clearly changes for supply collection.

Reject if:

- The crate clips underground.
- The crate shadow floats far above or below the terrain.
- The player still sees the machine gun while moving to the crate.
- The player can fire while looting.
- The return state does not restore the gun.

## Maker Prompt: Texture And Airdrop Fix Pass

Give Maker this prompt:

```md
Do not add progression, robots, ads, new weapons, or new chapters.
Do not change scene layout, camera anchor, 360-degree spawning, wave rules, or core shooting.

Only do this fix pass:
1. Add texture/material design.
2. Fix airdrop landing height.
3. Fix airdrop collection player state.

Texture/material requirements:
- Do not use flat placeholder colors for major objects.
- Add material identity to terrain, sandbags, ruins, dead wood, gun, airdrop crate, zombies, and water.
- Use local textures if possible:
  - hilltop_ground_texture
  - beach_sand_texture
  - ocean_water_texture
  - zombie_texture
- If local texture loading is unreliable, create procedural canvas textures with noise/seams/grain.
- Sandbags need tan fabric, darker seams, stains, and side shading.
- Terrain needs dirt/rock noise, not a flat brown/gray plane.
- Gun needs dark metal with steel/brass highlights, not pure black.
- Airdrop crate needs red body, blue tarp/top, rope/metal details.

Airdrop landing requirements:
- Airdrop must land on the terrain surface, never underground.
- Compute ground Y by raycasting downward against terrain meshes, or use the radial terrain height function.
- Set crate Y = groundY + crateHalfHeight + 0.05.
- Shadow Y = groundY + 0.03.
- Test at radius around 28 first so the bug is visible.

Airdrop collection requirements:
- Add explicit playerMode:
  - TURRET
  - RUN_TO_AIRDROP
  - LOOT_AIRDROP
  - RETURN_TO_TURRET
- First-person machine gun is visible only in TURRET mode.
- Player cannot shoot while running to/looting/returning from airdrop.
- It is okay to leave a stationary turret model on the hilltop while the player runs.
- Restore the first-person gun only after the player returns to the hilltop.

Acceptance:
- Scene no longer looks like plain flat-color geometry.
- Sandbags, terrain, gun, crate, zombies, and water have visible material/texture detail.
- Airdrop lands above terrain and does not clip underground.
- Player does not carry the machine gun when collecting airdrop.
- No unrelated gameplay/layout changes.
```
