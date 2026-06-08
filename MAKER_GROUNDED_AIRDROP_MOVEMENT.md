# Maker Fix: Grounded Airdrop Movement

Use this document when the physical airdrop pickup exists, but the player appears to fly to the crate or move through an elevated layer.

This is a hard blocker. Do not add upgrades, robots, ads, UI polish, or new enemies until this is fixed.

If Maker has already built a floating platform, delete that terrain and replace it with a continuous walkable hill. Do not try to hide the problem with camera easing.

Use `maker_reference/continuous-terrain-airdrop.mjs` as the copyable reference implementation.

## Current Product Rule

Physical airdrop pickup stays.

The player must:

1. Leave the hilltop/turret.
2. Walk down the visible slope.
3. Loot the landed crate on the terrain.
4. Run back up the slope.
5. Re-enter the turret.

The player must not fly, glide through air, teleport, or move across an invisible elevated bridge.

## Current Failure Diagnosis

The current Maker output is rejected because it appears to have:

- A hilltop as a separate floating platform.
- A slope or ramp that is not physically connected to the hilltop.
- Player movement driven by camera tweening instead of ground contact.
- A return path that visually lifts the player through air.

The fix is not a better animation. The fix is continuous terrain plus ground-following movement.

## Root Cause To Fix

Maker is likely moving the camera with a direct 3D interpolation:

```js
camera.position.lerp(targetPosition, t);
```

or equivalent start/end position tweening.

That is wrong for this game. It interpolates the camera Y value through the air, so the player appears to fly up or down instead of walking on terrain.

## Required Movement Model

Move on a horizontal path only.

Every frame:

1. Update the player's `x` and `z`.
2. Sample terrain height at that `x,z`.
3. Set camera/player height from the sampled ground.

```js
const EYE_HEIGHT = 1.6;

function updateOffTurretMovement(dt) {
  updatePlayerXZAlongPath(dt);

  const groundY = getGroundY(player.position.x, player.position.z);
  player.position.y = groundY;
  camera.position.set(
    player.position.x,
    groundY + EYE_HEIGHT,
    player.position.z
  );
}
```

Rejected:

```js
camera.position.lerp(crateCameraTarget, t);
player.position.lerp(cratePlayerTarget, t);
```

Do not interpolate from turret world Y to crate world Y directly.

## Mandatory Simplified Acceptance Pass

Before restoring full 360-degree random airdrop pickup, Maker must pass this simpler fixed setup:

- Use one fixed sandbag exit gap on the south side.
- Spawn the acceptance-test airdrop only in front of that gate, radius `35-40`.
- Build one visible dirt path from the hilltop through the gate to the crate.
- The player must walk down that same visible path and run back up it.

After this fixed-path version is accepted, 360-degree airdrops can return by adding more gates or a path planner.

Do not attempt full 360 airdrop movement while the basic south-gate path still looks like flying.

## Ground Height Sampling

Prefer terrain raycast if Maker has real terrain meshes:

```js
const terrainMeshes = [
  hilltopMesh,
  slopeMesh,
  wastelandMesh,
  dirtPathMesh
].filter(Boolean);

function getGroundYByRaycast(x, z) {
  const raycaster = new THREE.Raycaster(
    new THREE.Vector3(x, 120, z),
    new THREE.Vector3(0, -1, 0),
    0,
    260
  );

  const hits = raycaster.intersectObjects(terrainMeshes, true);
  if (hits.length) return hits[0].point.y;

  return getGroundYAnalytic(x, z);
}
```

If the scene uses procedural rings, use an analytic fallback:

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

function getGroundY(x, z) {
  return getGroundYByRaycast(x, z);
}
```

The exact numbers can be adjusted, but the rule cannot change: player Y comes from ground height, not from a direct camera tween.

## Required Slope Geometry

The hill must be one continuous walkable structure:

```text
turret center
small flat hilltop
sandbag ring with a visible exit gap
connected dirt ramp/path
circular slope surface
outer wasteland
landed airdrop crate
```

Rejected terrain:

- A floating top platform above the slope.
- A separate invisible elevated walkway.
- Flat rings stacked at different heights with gaps between them.
- A camera path that ignores the visible ground.
- A crate placed on a lower surface while the player moves on a higher invisible layer.

The slope can be stylized, low-poly, and simplified, but it must be physically connected.

Maker must not create an object named or treated as `FloatingPlatform`, `UpperPlatform`, `SkyBridge`, `AirPath`, or equivalent. The flat hilltop is just the top cap of the same terrain mass.

## Copyable Terrain Reference

The repository includes a reference file:

```text
maker_reference/continuous-terrain-airdrop.mjs
```

Use it to create:

- `createContinuousTerrain(THREE)`: one connected radial terrain mesh.
- `getGroundYAnalytic(x,z)`: the single source of truth for ground height.
- `getFixedAcceptanceAirdropPosition()`: fixed south-gate crate position for acceptance.
- `placeAirdropOnGround(crate,x,z)`: crate placement on the same ground.
- `updateGroundedPathMovement(state,dt,camera)`: X/Z path movement with camera Y sampled from ground.
- `assertGrounded(camera,playerMode)`: hard failure if the player is flying.

During this fix, Maker should copy that reference first, then adapt names to the project.

## Exit Path

Create a real visible exit from the defensive ring.

Use one of these options:

- A fixed sandbag gap on the south side.
- A rotating temporary gap aligned with the airdrop direction.
- A short dirt ramp cutting through the sandbag ring.

Do not let the player pass through sandbags or jump over them.

Example path construction:

```js
function makeAirdropPath(cratePosition) {
  const crateDir = new THREE.Vector3(cratePosition.x, 0, cratePosition.z).normalize();
  const exitDir = crateDir.lengthSq() > 0 ? crateDir : new THREE.Vector3(0, 0, 1);

  const start = new THREE.Vector3(0, 0, 0);
  const exit = exitDir.clone().multiplyScalar(5.8);
  const slopeEntry = exitDir.clone().multiplyScalar(8.5);
  const crateApproach = new THREE.Vector3(cratePosition.x, 0, cratePosition.z)
    .add(exitDir.clone().multiplyScalar(-2.2));

  return [start, exit, slopeEntry, crateApproach];
}
```

When following the path, only interpolate `x,z`. Calculate `y` from `getGroundY()`.

## Camera Feel

The off-turret camera should feel like running, not floating.

Acceptable:

```js
const RUN_BOB_AMOUNT = 0.045;
const RUN_BOB_SPEED = 10;

function applyRunCamera(dt, speed01) {
  runTime += dt * speed01;
  const groundY = getGroundY(player.position.x, player.position.z);
  const bob = Math.sin(runTime * RUN_BOB_SPEED) * RUN_BOB_AMOUNT * speed01;
  camera.position.y = groundY + EYE_HEIGHT + bob;
}
```

Small smoothing is acceptable only after sampling ground:

```js
const targetY = getGroundY(player.position.x, player.position.z) + EYE_HEIGHT;
camera.position.y += (targetY - camera.position.y) * 0.35;
```

Rejected:

- Smoothing from start Y to end Y.
- Flying arc animation.
- Jump-like lift unless there is a real step/ramp.

## Airdrop Landing

The crate must land on the same terrain system that the player uses:

```js
function placeAirdropCrate(crate, x, z) {
  const groundY = getGroundY(x, z);
  crate.position.set(x, groundY + crate.userData.halfHeight + 0.05, z);
}
```

If the crate is on `groundY`, the player approach point must also use that same `groundY`.

Do not mix separate height functions for crate and player.

## Debug Blocker

Add this during development:

```js
function assertPlayerGrounded() {
  if (playerMode !== PlayerMode.RUN_TO_AIRDROP && playerMode !== PlayerMode.RETURN_TO_TURRET) {
    return;
  }

  const expectedY = getGroundY(camera.position.x, camera.position.z) + EYE_HEIGHT;
  const delta = camera.position.y - expectedY;

  if (Math.abs(delta) > 0.25) {
    console.error('[BLOCKER] Player is not grounded during airdrop movement', {
      mode: playerMode,
      cameraY: camera.position.y,
      expectedY,
      delta
    });
  }
}
```

Also render a temporary debug line showing the path:

- Center to ring exit.
- Ring exit to slope entry.
- Slope entry to crate approach.
- Crate approach to crate.

If the debug path floats above the terrain, the implementation is rejected.

## Acceptance

Required checks:

1. From turret view, the player exits through a visible sandbag gap or ramp.
2. The camera visibly descends along the slope when going to the crate.
3. The camera visibly climbs the slope when returning to the turret.
4. The player/camera height stays within `0.25` units of `getGroundY(x,z) + EYE_HEIGHT`.
5. The crate sits on the terrain surface, not underground and not floating.
6. No mounted gun is visible in `RUN_TO_AIRDROP`, `LOOT_AIRDROP`, or `RETURN_TO_TURRET`.
7. The terrain has no floating elevated layer between hilltop and wasteland.

Reject the build if the player appears to fly.

## Maker Prompt

```md
Do not change the physical airdrop pickup design.
Do not remove the run-to-crate risk/reward decision.
Do not work on upgrades, robots, ads, monetization, UI polish, or new enemies yet.

Fix only the airdrop movement and ramp/terrain structure.

Read MAKER_GROUNDED_AIRDROP_MOVEMENT.md and implement exactly.

Hard requirements:
- If there is a floating platform, delete it.
- Use maker_reference/continuous-terrain-airdrop.mjs as the implementation reference.
- First pass must use a fixed south sandbag gate and a fixed crate in front of that gate.
- Delete direct 3D camera/player interpolation from turret to crate.
- Movement to the airdrop must interpolate only X/Z along a visible ground path.
- Every frame, sample terrain height with getGroundY(x,z).
- Set camera Y to getGroundY(x,z) + EYE_HEIGHT.
- Build a real connected slope/ramp from hilltop to wasteland.
- Add a visible sandbag exit gap or ramp.
- The player must walk down the slope and run back up the slope.
- The player must not fly, float, glide, teleport, or move across an invisible elevated layer.
- The crate and player must use the same terrain height function.

Acceptance:
- Camera Y stays within 0.25 units of groundY + eye height during RUN_TO_AIRDROP and RETURN_TO_TURRET.
- Video/screenshot clearly shows downhill movement to crate and uphill movement back to turret.
- No first-person mounted gun appears while running, looting, or returning.
- The hilltop is not a separate floating platform; it is the flat top of a continuous terrain mesh.
```
