# Maker Requirement: Physical Airdrop Collection

Use this document when the design requires the player to leave the turret and physically collect an airdrop.

This is the current product direction. Physical airdrop pickup is a risk/reward decision:

```text
Stay on turret = keep shooting, safer, no supply reward yet.
Leave turret = stop shooting, become vulnerable, collect high-value supply.
```

Do not replace this with remote collection unless explicitly approved later.

## Non-Negotiable Rules

- The player must physically move from the hilltop/turret to the landed airdrop.
- The player must not carry the mounted machine gun while moving.
- The player cannot shoot while off the turret.
- The mounted gun must stay at the hilltop as a world/turret object.
- On return, the player re-enters turret mode and the first-person gun returns.

If the player still sees the gun while off the turret, the implementation is rejected.

## Correct Architecture

Maker should stop treating the first-person gun as the player's body.

Use separate rigs:

```text
TurretRig
  camera in turret mode
  FirstPersonWeaponRoot visible only here

RunnerRig
  camera in off-turret mode
  no weapon root
  optional empty hands only

StationaryTurretWorldModel
  visible on hilltop while player is away
```

The camera can be moved between these rigs, or interpolated between their transforms. The important rule is:

```text
FirstPersonWeaponRoot must never be attached to the camera outside TURRET mode.
```

## Required Player Modes

```js
const PlayerMode = {
  TURRET: 'TURRET',
  EXIT_TURRET: 'EXIT_TURRET',
  RUN_TO_AIRDROP: 'RUN_TO_AIRDROP',
  LOOT_AIRDROP: 'LOOT_AIRDROP',
  RETURN_TO_TURRET: 'RETURN_TO_TURRET',
  ENTER_TURRET: 'ENTER_TURRET'
};

let playerMode = PlayerMode.TURRET;
```

## Weapon Root Rule

All first-person gun parts must be under one root:

```js
const firstPersonWeaponRoot = new THREE.Group();
firstPersonWeaponRoot.name = 'FirstPersonWeaponRoot';
```

Every child mesh must be tagged:

```js
mesh.userData.weaponPart = true;
```

Names should also include clear labels:

```text
weapon
gun
barrel
muzzle
ammo
turret
```

## Hard Detach, Not Just Hide

Do not rely only on `visible = false`. Maker has already failed that.

Use hard detach outside turret mode:

```js
function attachWeaponToCamera() {
  if (firstPersonWeaponRoot.parent !== camera) {
    camera.add(firstPersonWeaponRoot);
  }
  firstPersonWeaponRoot.visible = true;
}

function detachWeaponFromCamera() {
  if (firstPersonWeaponRoot.parent) {
    firstPersonWeaponRoot.parent.remove(firstPersonWeaponRoot);
  }
  firstPersonWeaponRoot.visible = false;
}
```

Mode switch:

```js
function setPlayerMode(nextMode) {
  playerMode = nextMode;

  const inTurret = playerMode === PlayerMode.TURRET || playerMode === PlayerMode.ENTER_TURRET;

  if (inTurret) {
    attachWeaponToCamera();
    canShoot = true;
    if (stationaryTurretWorldModel) stationaryTurretWorldModel.visible = false;
  } else {
    detachWeaponFromCamera();
    canShoot = false;
    if (stationaryTurretWorldModel) stationaryTurretWorldModel.visible = true;
  }

  enforceNoWeaponWhileOffTurret();
}
```

## Per-Frame Enforcement

This must run every frame after all camera, weapon, and animation updates:

```js
function enforceNoWeaponWhileOffTurret() {
  const inTurret = playerMode === PlayerMode.TURRET || playerMode === PlayerMode.ENTER_TURRET;

  if (inTurret) return;

  detachWeaponFromCamera();
  canShoot = false;

  // Safety cleanup: remove any weapon-like mesh directly attached to camera.
  const toRemove = [];
  camera.traverse((node) => {
    const name = (node.name || '').toLowerCase();
    const looksLikeWeapon =
      node.userData?.weaponPart ||
      name.includes('weapon') ||
      name.includes('gun') ||
      name.includes('barrel') ||
      name.includes('muzzle') ||
      name.includes('ammo') ||
      name.includes('turret');

    if (node !== camera && looksLikeWeapon) toRemove.push(node);
  });

  for (const node of toRemove) {
    if (node.parent) node.parent.remove(node);
  }
}
```

Main loop:

```js
function update(dt) {
  updateCamera(dt);
  updatePlayerMovement(dt);
  updateWeapon(dt);
  updateAirdropPickup(dt);
  enforceNoWeaponWhileOffTurret(); // must be after everything else
}
```

## Shooting Guard

```js
function shoot() {
  if (playerMode !== PlayerMode.TURRET) return;
  if (!canShoot) return;
  // normal turret shooting
}
```

Input handlers must also check mode:

```js
if (playerMode !== PlayerMode.TURRET) {
  return; // no firing while off turret
}
```

## Physical Pickup Flow

```text
Player aims at landed airdrop
↓
Click interact
↓
EXIT_TURRET
  detach first-person gun
  show stationary turret on hilltop
↓
RUN_TO_AIRDROP
  move camera/player toward crate
  no gun visible
  no shooting
  player vulnerable
↓
LOOT_AIRDROP
  open crate for 1.0-1.5 seconds
  reward added
↓
RETURN_TO_TURRET
  move camera/player back to hilltop
  no gun visible
  no shooting
↓
ENTER_TURRET
  reattach weapon
↓
TURRET
  shooting restored
```

## Risk/Reward Rules

While off turret:

- Player cannot shoot.
- Zombies keep moving.
- Zombies can damage the player if close.
- Looting can be interrupted by damage.
- The route should take about `1.0-2.0` seconds each way in early versions.
- Looting the crate should take about `1.0-1.5` seconds.

This is the intended decision pressure.

## Camera Rules

Acceptable off-turret camera:

- First-person unarmed run camera.
- Third-person shoulder camera.
- Low run camera with empty hands.

Rejected:

- Any mounted machine gun visible.
- Gun barrel still centered at bottom of screen.
- Muzzle flash while running/looting/returning.
- Player shooting while away from turret.

## Grounded Movement Required

The player must physically run on the terrain, not fly through a camera tween.

If Maker creates a floating/elevated path or moves the camera directly from turret Y to crate Y, stop and use `MAKER_GROUNDED_AIRDROP_MOVEMENT.md`.

If Maker still cannot make it grounded, use `maker_reference/continuous-terrain-airdrop.mjs` and force the fixed south-gate acceptance pass first.

Required:

- Move only `x,z` along the airdrop path.
- Sample terrain height every frame with `getGroundY(x, z)`.
- Set camera height from `getGroundY(x, z) + EYE_HEIGHT`.
- Build a connected visible slope/ramp from hilltop to wasteland.
- Add a visible sandbag exit gap or ramp.
- Keep the hilltop as the top cap of one continuous terrain mesh, not a separate platform.

Rejected:

- Direct 3D interpolation from turret camera position to crate camera position.
- Flying arc animation.
- Invisible elevated walkway.
- Floating layer between hilltop and airdrop.
- Separate suspended hilltop platform.
- Camera movement that ignores visible terrain.

## Airdrop Landing Still Required

The crate must land on the terrain surface:

```js
const groundY = getGroundYByRaycast(x, z);
crate.position.y = groundY + crateHalfHeight + 0.05;
```

Do not let the crate clip underground.

## Debug Acceptance Helper

Add this temporary debug check:

```js
function assertNoWeaponOffTurret() {
  if (playerMode === PlayerMode.TURRET) return;

  let found = false;
  camera.traverse((node) => {
    const name = (node.name || '').toLowerCase();
    if (node.userData?.weaponPart || name.includes('gun') || name.includes('barrel') || name.includes('muzzle')) {
      found = true;
    }
  });

  if (found) {
    console.error('[BLOCKER] Weapon still attached to camera while off turret:', playerMode);
  }
}
```

Run it every frame in development.

## Acceptance

Required screenshots or checks:

1. Turret mode: gun visible, shooting works.
2. Running to airdrop: gun not visible, stationary turret remains on hilltop, shooting disabled.
3. Looting crate: gun not visible, crate opens, shooting disabled.
4. Returning to turret: gun not visible, shooting disabled.
5. Back in turret mode: gun visible again, shooting works.

Reject if any first-person mounted gun part is visible in states 2-4.

## Maker Prompt

```md
Physical airdrop pickup is required. Do not replace it with remote collection.

Read MAKER_PHYSICAL_AIRDROP_COLLECTION.md and implement exactly.
If the player appears to fly or the slope is disconnected, also read MAKER_GROUNDED_AIRDROP_MOVEMENT.md before continuing.

The design requirement:
- Player must leave the turret to collect the airdrop.
- This is the risk/reward decision.

Implementation requirement:
- Do not just hide the gun once.
- Put all first-person gun parts under FirstPersonWeaponRoot.
- Outside TURRET mode, hard detach FirstPersonWeaponRoot from camera.
- Run enforceNoWeaponWhileOffTurret() every frame after all camera/weapon updates.
- If any gun/gun barrel/muzzle/ammo mesh remains attached to camera outside TURRET, remove it.
- Player cannot shoot while off turret.
- A stationary turret world model may stay on the hilltop.
- Player movement to and from the crate must follow terrain ground height every frame.
- Do not use direct 3D camera/player interpolation to the crate.

Modes:
- TURRET
- EXIT_TURRET
- RUN_TO_AIRDROP
- LOOT_AIRDROP
- RETURN_TO_TURRET
- ENTER_TURRET

Acceptance:
- Running to airdrop shows no first-person machine gun.
- Looting airdrop shows no first-person machine gun.
- Returning to turret shows no first-person machine gun.
- Gun reappears only after returning to TURRET mode.
- Shooting is disabled in all off-turret modes.
- Airdrop lands above terrain.
- Player walks down the visible slope and runs back up the visible slope without flying.
```
