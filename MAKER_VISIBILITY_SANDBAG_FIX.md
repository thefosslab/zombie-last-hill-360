# Maker Fix: Turret Visibility And Sandbag Scale

Use this document when the defensive ring blocks the player's view and the player cannot see zombies outside the hilltop.

This is a hard blocker. The core game is shooting enemies coming up the slope. If the slope and zombies are hidden by sandbags, the build is unplayable.

## Current Failure

The current Maker output is rejected because:

- Sandbags are scaled like walls or giant boxes.
- The turret camera is too low or too close to the sandbag meshes.
- The crosshair points into a sandbag block instead of the slope.
- The player cannot see outside zombies.

Do not solve this by removing the defensive ring. The ring should remain, but it must read as low cover, not a wall.

## Correct Visual Target

From turret mode, the screen should show:

```text
bottom 15-25%: gun/turret foreground
lower sides: nearby low sandbags
center 60%: open view to slope
far view: zombies climbing from wasteland
```

Rejected:

- Any sandbag fills the crosshair area.
- Any sandbag covers more than the lower third of the screen.
- The player sees mostly boxes/walls instead of terrain.
- The defensive ring is taller than the sightline.

## Turret Camera Height

Use a higher fixed camera only while in turret mode.

The off-turret run camera can stay near human eye height, but turret mode is mounted on the hilltop gun and must see over the defensive ring.

```js
const TURRET_CAMERA_HEIGHT = 4.2;
const TURRET_CAMERA_Y = TERRAIN.topY + TURRET_CAMERA_HEIGHT;
const TURRET_CAMERA_POSITION = new THREE.Vector3(0, TURRET_CAMERA_Y, 0);
```

Required:

- Turret camera Y: `TERRAIN.topY + 3.8` to `TERRAIN.topY + 4.8`.
- Initial pitch: around `-0.28` to `-0.38`.
- FOV: `75-82`.
- Crosshair ray should hit slope/terrain/enemy space, not sandbags.

Do not use the off-turret `EYE_HEIGHT = 1.6` for mounted turret combat.

## Sandbag Scale

Sandbags must be low cover.

Recommended per-block size:

```js
const SANDBAG = {
  radius: 5.2,
  length: 1.55,
  thickness: 0.55,
  height: 0.42,
  y: TERRAIN.topY + 0.32,
  maxTopY: TERRAIN.topY + 1.15
};
```

Rules:

- Main sandbag top must stay below `TERRAIN.topY + 1.15`.
- Optional second layer top must stay below `TERRAIN.topY + 1.65`.
- No single block should be taller than `0.55`.
- No sandbag should be placed inside radius `4.8`.
- Leave at least one clear gate/path for airdrop movement.
- Do not put a tall box directly in the center forward sightline.

Rejected:

- Cube sandbags taller than `1.0`.
- Large wall blocks.
- Stacked blocks in front of the crosshair.
- Sandbags at radius `3.0-4.0` that touch the gun/camera.

## Copyable Reference

Use the reference in:

```text
maker_reference/continuous-terrain-airdrop.mjs
```

It includes:

- `getTurretCameraPosition(THREE)`
- `applyTurretCamera(camera)`
- `createVisibleSandbagMesh(THREE)`
- `createSouthGateSandbags(THREE,scene)`
- `assertTurretSightlineClear(camera,raycaster,scene)`

Maker should use those values before changing any art or gameplay.

## Sightline Acceptance Test

Add this in development:

```js
function assertTurretSightlineClear(camera, raycaster, scene) {
  raycaster.setFromCamera({ x: 0, y: 0 }, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  const blocker = hits.find((hit) => hit.object.userData?.blocksTurretSight);

  if (blocker && blocker.distance < 22) {
    throw new Error(`[BLOCKER] Turret sightline blocked by ${blocker.object.name}`);
  }
}
```

Mark sandbag meshes:

```js
sandbag.userData.blocksTurretSight = true;
```

The center crosshair ray must not hit sandbags, decorative crates, poles, or walls within the first `22` world units.

## Acceptance

Required screenshots:

1. Looking straight ahead from turret mode: slope and distant terrain are visible.
2. Crosshair center is not on a sandbag.
3. Zombies at radius `30-100` are visible above/between the defensive ring.
4. Rotating 360 degrees never shows a giant sandbag wall filling the center of the screen.
5. The south airdrop gate remains visible and walkable.

Reject the build if the player cannot see outside enemies.

## Maker Prompt

```md
The current build is rejected because the sandbags block the view.

Do not add gameplay, upgrades, robots, ads, or polish.
Fix only turret visibility and sandbag scale.

Read MAKER_VISIBILITY_SANDBAG_FIX.md and maker_reference/continuous-terrain-airdrop.mjs.

Hard requirements:
- Sandbags are low cover, not walls.
- Turret camera Y must be TERRAIN.topY + 3.8 to +4.8.
- Do not use off-turret EYE_HEIGHT for turret combat.
- Sandbag top must stay below TERRAIN.topY + 1.15.
- No sandbag may cover the crosshair or center view.
- Center crosshair ray must not hit sandbags within 22 world units.
- From turret mode, slope and zombies must be visible.

Acceptance:
- Screenshot from turret mode shows gun bottom, low sandbags lower/sides, open slope center, zombies visible outside.
- If the view is mostly boxes or walls, it fails.
```
