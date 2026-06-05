# Maker Hard Blockers

Use this document when Maker keeps returning builds that still carry the gun during airdrop pickup or use blocky/grid-style zombies.

These are blocking bugs. Do not proceed to progression, monetization, robots, upgrades, new weapons, chapters, or art polish until both blockers are fixed.

## Blocker 1: Gun Visible During Airdrop Pickup

This means Maker did not implement a real player state machine. Hiding the gun once on click is not enough because another update path is making it visible again.

All first-person gun meshes must be under one root group:

```js
const firstPersonWeaponRoot = new THREE.Group();
firstPersonWeaponRoot.name = 'FirstPersonWeaponRoot';
camera.add(firstPersonWeaponRoot);
```

All gun meshes, muzzle flashes, barrel groups, ammo drum meshes, and gun-attached 3D parts must be children of this root. Each weapon mesh must be tagged:

```js
mesh.userData.weaponPart = true;
```

Required player modes:

```js
const PlayerMode = {
  TURRET: 'TURRET',
  RUN_TO_AIRDROP: 'RUN_TO_AIRDROP',
  LOOT_AIRDROP: 'LOOT_AIRDROP',
  RETURN_TO_TURRET: 'RETURN_TO_TURRET'
};

let playerMode = PlayerMode.TURRET;
```

This function must run every frame after camera movement and after all weapon/gun update code:

```js
function enforcePlayerModeVisuals() {
  const inTurret = playerMode === PlayerMode.TURRET;

  if (firstPersonWeaponRoot) {
    firstPersonWeaponRoot.visible = inTurret;
    firstPersonWeaponRoot.traverse((node) => {
      if (node.isMesh || node.isLine || node.isSprite) {
        node.visible = inTurret;
      }
    });
  }

  canShoot = inTurret;
  if (crosshair) crosshair.visible = inTurret || playerMode === PlayerMode.LOOT_AIRDROP;
}
```

Call it as the last visual line of the main loop:

```js
function update(dt) {
  updateCamera(dt);
  updateWeapon(dt);
  updateAirdropState(dt);
  enforcePlayerModeVisuals(); // must be last
}
```

If the gun still shows, remove the gun root from the camera during airdrop states:

```js
function detachFirstPersonWeapon() {
  if (firstPersonWeaponRoot && firstPersonWeaponRoot.parent) {
    firstPersonWeaponRoot.parent.remove(firstPersonWeaponRoot);
  }
}

function attachFirstPersonWeapon() {
  if (firstPersonWeaponRoot && firstPersonWeaponRoot.parent !== camera) {
    camera.add(firstPersonWeaponRoot);
  }
}

function setPlayerMode(nextMode) {
  playerMode = nextMode;
  if (nextMode === PlayerMode.TURRET) attachFirstPersonWeapon();
  else detachFirstPersonWeapon();
  enforcePlayerModeVisuals();
}
```

Shooting must be impossible outside turret mode:

```js
function shoot() {
  if (playerMode !== PlayerMode.TURRET) return;
  if (!canShoot) return;
  // normal shooting
}
```

Acceptance:

- During run to crate, loot, and return, no first-person gun, barrel, ammo drum, muzzle flash, or weapon mesh is visible.
- The player cannot shoot during run to crate, loot, or return.
- The gun returns only after the player is back in turret mode.
- A stationary turret model may remain on the hilltop as a world object, but it must not be attached to the camera.

Reject the build if any gun part remains visible during airdrop pickup.

## Blocker 2: Blocky/Grid Zombies

The current blocky/grid zombie style is rejected. Do not use cube-body Minecraft zombies. Do not use the old pixel-grid zombie texture as the final zombie style.

Required zombie style:

- Hunched posture.
- Rounded or capsule-like head, not a cube.
- Narrow neck.
- Tapered torso.
- Bent arms reaching forward.
- Thin uneven legs.
- Larger hands/claws.
- Slight asymmetry.

Allowed geometry:

- CapsuleGeometry.
- CylinderGeometry with low segment count.
- SphereGeometry scaled into oval shapes.
- Cone/Cylinder tapered torso.
- Plane decals for wounds, eyes, mouth, torn cloth.

Rejected geometry:

- Box head.
- Box torso.
- Box arms and box legs.
- Minecraft-style pixel grid.
- Default gray capsule shell.
- Humanoid made of plain cubes.

Minimal low-poly zombie recipe:

```js
function createLowPolyZombie() {
  const root = new THREE.Group();
  root.name = 'Zombie';

  const skin = new THREE.MeshStandardMaterial({ color: '#6F9A5D', roughness: 0.95 });
  const shirt = new THREE.MeshStandardMaterial({ color: '#245765', roughness: 0.9 });
  const pants = new THREE.MeshStandardMaterial({ color: '#26345A', roughness: 0.9 });
  const wound = new THREE.MeshBasicMaterial({ color: '#4A1010' });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6), skin);
  head.scale.set(0.85, 1.15, 0.9);
  head.position.set(0, 1.75, 0.02);
  root.add(head);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.78, 7), shirt);
  torso.position.set(0, 1.15, 0);
  torso.rotation.x = 0.18;
  root.add(torso);

  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.82, 6), skin);
  leftArm.position.set(-0.42, 1.2, -0.18);
  leftArm.rotation.set(1.05, 0.0, 0.22);
  root.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 0.42;
  rightArm.rotation.z = -0.22;
  root.add(rightArm);

  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.13, 0.86, 6), pants);
  leftLeg.position.set(-0.16, 0.42, 0);
  leftLeg.rotation.z = 0.12;
  root.add(leftLeg);

  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.18;
  rightLeg.rotation.z = -0.08;
  root.add(rightLeg);

  const eyeMat = new THREE.MeshBasicMaterial({ color: '#F4E9C8' });
  const eyeGeo = new THREE.SphereGeometry(0.035, 6, 4);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.1, 1.82, -0.29);
  root.add(leftEye);

  const rightEye = leftEye.clone();
  rightEye.position.x = 0.1;
  root.add(rightEye);

  const mouth = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.055), wound);
  mouth.position.set(0, 1.68, -0.31);
  root.add(mouth);

  root.rotation.x = -0.08;
  return root;
}
```

If Maker cannot create acceptable 3D humanoids, use a 2.5D sprite impostor instead:

- Create a transparent zombie sprite canvas.
- Use two crossed planes or one billboard plane.
- Face the camera around the Y axis.
- Use a separate invisible hit collider for shooting.

This is acceptable for a mobile IAA prototype and will look better than cube-grid zombies.

Acceptance:

- The zombie silhouette reads as a decayed human, not a block character.
- No visible cube-grid body.
- No gray default material.
- Face has eyes and mouth.
- Body has skin/shirt/pants separation.
- Normal zombie is readable at medium distance.
- Hit collider remains separate and invisible.

Reject the build if zombies still look like Minecraft/block-grid characters.

## Maker Prompt

```md
Stop all other work. This build has two blocking bugs.

Do not add progression, robots, ads, weapons, new enemies, chapters, or polish.
Only fix:
1. First-person gun still visible during airdrop pickup.
2. Zombies are blocky/grid/Minecraft-style and visually rejected.

Read MAKER_HARD_BLOCKERS.md and implement exactly.

Airdrop/gun requirements:
- Put all first-person gun meshes under one FirstPersonWeaponRoot attached to camera.
- Add PlayerMode: TURRET, RUN_TO_AIRDROP, LOOT_AIRDROP, RETURN_TO_TURRET.
- enforcePlayerModeVisuals() must run every frame after weapon/camera updates.
- Outside TURRET mode, remove or hide FirstPersonWeaponRoot and disable shooting.
- If hiding still fails, detach FirstPersonWeaponRoot from camera until player returns.
- No gun part may be visible while running to the airdrop, looting, or returning.

Zombie requirements:
- Do not use Minecraft/block/grid zombies.
- Do not use cube head/body/arms/legs.
- Build low-poly horror humanoid zombies using sphere/capsule/cylinder/tapered shapes.
- Use green skin, teal shirt, dark pants, visible eyes and mouth.
- Keep hit colliders invisible and separate.

Acceptance:
- During airdrop pickup, zero first-person gun meshes are visible and shooting is disabled.
- After returning to turret mode, gun reappears and shooting works.
- Zombies no longer look like block/grid/Minecraft characters.
- No unrelated changes.
```
