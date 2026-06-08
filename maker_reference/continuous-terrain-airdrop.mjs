// Reference implementation for Maker.
// Purpose: replace floating-platform terrain and flying airdrop movement with
// one continuous walkable hill surface plus ground-following player movement.

export const TERRAIN = {
  hilltopRadius: 6,
  slopeOuterRadius: 120,
  wastelandRadius: 420,
  topY: 10.5,
  slopeBottomY: -15,
  eyeHeight: 1.6,
  turretCameraHeight: 4.2,
  turretCameraPitch: -0.32,
  gateAngle: Math.PI / 2,
  gateHalfWidth: 1.25,
  airdropRadius: 38,
  sandbagRadius: 5.2,
  sandbagLength: 1.55,
  sandbagThickness: 0.55,
  sandbagHeight: 0.42
};

export const PlayerMode = {
  TURRET: 'TURRET',
  EXIT_TURRET: 'EXIT_TURRET',
  RUN_TO_AIRDROP: 'RUN_TO_AIRDROP',
  LOOT_AIRDROP: 'LOOT_AIRDROP',
  RETURN_TO_TURRET: 'RETURN_TO_TURRET',
  ENTER_TURRET: 'ENTER_TURRET'
};

export function getGroundYAnalytic(x, z) {
  const r = Math.hypot(x, z);

  if (r <= TERRAIN.hilltopRadius) return TERRAIN.topY;

  if (r <= TERRAIN.slopeOuterRadius) {
    const t = (r - TERRAIN.hilltopRadius) / (TERRAIN.slopeOuterRadius - TERRAIN.hilltopRadius);
    const eased = Math.pow(t, 0.72);
    return TERRAIN.topY - eased * (TERRAIN.topY - TERRAIN.slopeBottomY);
  }

  return TERRAIN.slopeBottomY;
}

export function createContinuousTerrain(THREE, options = {}) {
  const radialSteps = options.radialSteps ?? 36;
  const segments = options.segments ?? 160;
  const outerRadius = options.outerRadius ?? TERRAIN.wastelandRadius;
  const positions = [];
  const colors = [];
  const uvs = [];
  const indices = [];

  for (let ri = 0; ri <= radialSteps; ri += 1) {
    const rt = ri / radialSteps;
    const radius = Math.pow(rt, 1.35) * outerRadius;

    for (let si = 0; si < segments; si += 1) {
      const angle = (si / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = getGroundYAnalytic(x, z);

      positions.push(x, y, z);
      uvs.push(radius / outerRadius, si / segments);

      const pathMask = isInsideGatePath(angle, radius) ? 1 : 0;
      const color = pickTerrainColor(THREE, radius, pathMask);
      colors.push(color.r, color.g, color.b);
    }
  }

  for (let ri = 0; ri < radialSteps; ri += 1) {
    for (let si = 0; si < segments; si += 1) {
      const a = ri * segments + si;
      const b = ri * segments + ((si + 1) % segments);
      const c = (ri + 1) * segments + si;
      const d = (ri + 1) * segments + ((si + 1) % segments);

      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.92,
    metalness: 0,
    flatShading: true
  });

  const terrainMesh = new THREE.Mesh(geometry, material);
  terrainMesh.name = 'ContinuousWalkableHillTerrain';
  terrainMesh.receiveShadow = true;
  terrainMesh.userData.isTerrain = true;

  return terrainMesh;
}

export function createSouthGateSandbags(THREE, scene, createSandbagMesh) {
  const sandbagMeshes = [];
  const count = 12;
  const radius = TERRAIN.sandbagRadius;
  const makeSandbag = createSandbagMesh ?? (() => createVisibleSandbagMesh(THREE));

  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    if (isAngleNear(angle, TERRAIN.gateAngle, 0.34)) continue;

    const bag = makeSandbag();
    bag.name = `Sandbag_${i}`;
    bag.position.set(
      Math.cos(angle) * radius,
      TERRAIN.topY + TERRAIN.sandbagHeight * 0.5 + 0.08,
      Math.sin(angle) * radius
    );
    bag.rotation.y = -angle + Math.PI / 2;
    bag.userData.blocksTurretSight = true;
    scene.add(bag);
    sandbagMeshes.push(bag);
  }

  return sandbagMeshes;
}

export function createVisibleSandbagMesh(THREE, material) {
  const geometry = new THREE.BoxGeometry(
    TERRAIN.sandbagLength,
    TERRAIN.sandbagHeight,
    TERRAIN.sandbagThickness
  );

  const sandbagMaterial = material ?? new THREE.MeshStandardMaterial({
    color: 0x8b7a57,
    roughness: 0.95,
    metalness: 0
  });

  const mesh = new THREE.Mesh(geometry, sandbagMaterial);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.blocksTurretSight = true;
  return mesh;
}

export function getTurretCameraPosition(THREE) {
  return new THREE.Vector3(0, TERRAIN.topY + TERRAIN.turretCameraHeight, 0);
}

export function applyTurretCamera(camera) {
  camera.position.set(0, TERRAIN.topY + TERRAIN.turretCameraHeight, 0);
  camera.rotation.x = TERRAIN.turretCameraPitch;
  camera.fov = Math.max(camera.fov ?? 75, 75);
  camera.updateProjectionMatrix?.();
}

export function assertTurretSightlineClear(camera, raycaster, scene) {
  raycaster.setFromCamera({ x: 0, y: 0 }, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  const blocker = hits.find((hit) => hit.object.userData?.blocksTurretSight);

  if (blocker && blocker.distance < 22) {
    throw new Error(`[BLOCKER] Turret sightline blocked by ${blocker.object.name}`);
  }
}

export function getFixedAcceptanceAirdropPosition() {
  const angle = TERRAIN.gateAngle;
  const x = Math.cos(angle) * TERRAIN.airdropRadius;
  const z = Math.sin(angle) * TERRAIN.airdropRadius;
  return { x, y: getGroundYAnalytic(x, z), z };
}

export function placeAirdropOnGround(crate, x, z) {
  const halfHeight = crate.userData?.halfHeight ?? 0.55;
  crate.position.set(x, getGroundYAnalytic(x, z) + halfHeight + 0.05, z);
}

export function buildAirdropPath(cratePosition) {
  const gateDir = {
    x: Math.cos(TERRAIN.gateAngle),
    z: Math.sin(TERRAIN.gateAngle)
  };

  return [
    { x: 0, z: 0, speed: 7.5 },
    { x: gateDir.x * 4.2, z: gateDir.z * 4.2, speed: 5.5 },
    { x: gateDir.x * 7.5, z: gateDir.z * 7.5, speed: 5.5 },
    { x: gateDir.x * 18, z: gateDir.z * 18, speed: 8.5 },
    { x: cratePosition.x - gateDir.x * 2.2, z: cratePosition.z - gateDir.z * 2.2, speed: 8.5 }
  ];
}

export function updateGroundedPathMovement(state, dt, camera) {
  const target = state.path[state.pathIndex];
  if (!target) return true;

  const dx = target.x - state.x;
  const dz = target.z - state.z;
  const distance = Math.hypot(dx, dz);
  const step = Math.min(distance, target.speed * dt);

  if (distance <= 0.01) {
    state.pathIndex += 1;
  } else {
    state.x += (dx / distance) * step;
    state.z += (dz / distance) * step;
  }

  const groundY = getGroundYAnalytic(state.x, state.z);
  state.y = groundY;

  state.runTime += dt;
  const bob = Math.sin(state.runTime * 10) * 0.045;
  camera.position.set(state.x, groundY + TERRAIN.eyeHeight + bob, state.z);

  return state.pathIndex >= state.path.length;
}

export function assertGrounded(camera, playerMode) {
  if (playerMode !== PlayerMode.RUN_TO_AIRDROP && playerMode !== PlayerMode.RETURN_TO_TURRET) {
    return;
  }

  const expectedY = getGroundYAnalytic(camera.position.x, camera.position.z) + TERRAIN.eyeHeight;
  const delta = camera.position.y - expectedY;

  if (Math.abs(delta) > 0.25) {
    throw new Error(
      `[BLOCKER] Player is flying. cameraY=${camera.position.y.toFixed(2)} expectedY=${expectedY.toFixed(2)} delta=${delta.toFixed(2)}`
    );
  }
}

function pickTerrainColor(THREE, radius, pathMask) {
  if (pathMask) return new THREE.Color(0x8a6f51);
  if (radius <= TERRAIN.hilltopRadius + 0.2) return new THREE.Color(0x6e5c48);
  if (radius <= TERRAIN.slopeOuterRadius) return new THREE.Color(0x5f5245);
  return new THREE.Color(0x3f443d);
}

function isInsideGatePath(angle, radius) {
  if (radius < 3 || radius > TERRAIN.airdropRadius + 6) return false;
  return isAngleNear(angle, TERRAIN.gateAngle, TERRAIN.gateHalfWidth / Math.max(radius, 1));
}

function isAngleNear(angle, target, tolerance) {
  let delta = angle - target;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return Math.abs(delta) <= tolerance;
}
