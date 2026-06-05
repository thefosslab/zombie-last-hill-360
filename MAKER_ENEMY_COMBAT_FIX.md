# Maker Fix: Enemy Visuals And Hit Detection

Use this document when Maker has restored the scene structure, but enemies look like gray placeholder shells or cannot be killed reliably.

Do not add new progression, robots, ads, weapons, or chapters during this pass.
Do not change the scene layout, camera anchor, or core 360-degree holdout structure.

## Current Problems To Fix

Observed issues:

- Zombies look like ugly placeholder figures.
- Many enemy meshes use gray/default materials with no texture or color identity.
- Some enemies appear inside gray shells or gray outer hulls.
- Distant enemies are too hard or impossible to kill.
- Shooting feedback is unclear, so the player cannot tell if a shot hit.

These are implementation bugs, not product-direction problems.

## Required Fix Order

Fix in this order:

```text
1. Remove gray placeholder shells.
2. Give every enemy mesh an explicit material/color/texture.
3. Add enemy hit colliders separate from visible meshes.
4. Make distant shots hit reliably with expanded hitboxes or aim tolerance.
5. Add hit feedback and death feedback.
```

## Enemy Visual Rules

### Normal Zombie First

Build one readable normal zombie before adding variants.

Required silhouette:

- Hunched horror humanoid, not Minecraft/block-grid.
- Rounded or capsule-like head, not a cube.
- Torso.
- Two arms.
- Two legs.
- Slight forward lean.
- Arms reaching forward.

Required colors:

| Part | Color |
|---|---|
| Skin | `#6F9A5D` |
| Shirt | `#245765` |
| Pants | `#26345A` |
| Eye | `#F6F2D8` |
| Eye shadow | `#101010` |
| Mouth | `#2A1111` |

Do not use a gray capsule, gray cylinder, or gray humanoid shell as the visible zombie.
Do not use cube head/body/arms/legs as the final zombie style.
Do not use Minecraft-style pixel-grid zombies.

### Do Not Use Old Block Texture As Final Style

The old exported texture below is pixel-grid/Minecraft-like. Do not use it as the final zombie look:

```text
original/assets/zombie_texture_zombie_texture_dffb99f7-a6c8-4cb6-97a1-40611bd2ccea.webp
```

Use low-poly humanoid colored materials or a non-blocky sprite impostor instead. A cube/block-grid zombie is rejected.

### Remove Placeholder Shells

Every enemy mesh must have an intentional material.

Reject any enemy that has:

- Default gray material.
- Untextured gray outer hull.
- Capsule shell around the body.
- Minecraft/block-grid body.
- Cube head/body/arms/legs as the final visual.
- Invisible hitbox rendered as a visible gray mesh.
- Same material as the ground.

If Maker needs a collider, it must be invisible:

```js
collider.visible = false;
```

or represented only in debug mode.

## Enemy Variant Minimum

After normal zombie is fixed, add variants only by clear gameplay color cues.

| Enemy | Visual Cue |
|---|---|
| Runner | reddish skin/accent, slimmer body |
| Helmet | visible gray helmet on head |
| Crawler | lower horizontal body |
| Giant | 2.5x to 3x larger, gray-blue heavy body |
| Bat | dark body, red eyes, wing silhouette |
| Dog | low quadruped brown body, red eye/accent |
| Bone thrower | pale bone in hand or backpack |
| Screamer | purple mouth/accent |

Do not add variants until normal zombie can be hit and killed reliably.

## Hit Detection Rules

The player shoots from the center crosshair. Distant enemies are small on screen, so exact mesh-only raycast is not enough.

Required:

- Use a separate enemy hit collider, not only visible body parts.
- Collider follows the enemy root position every frame.
- Collider is larger than the visual mesh for mobile readability.
- Shooting range must cover the spawn/approach distance.
- Hit feedback must be visible immediately.

Recommended values:

```js
const SHOOT_RANGE = 160;
const NORMAL_HITBOX = { width: 1.35, height: 2.35, depth: 1.35 };
const RUNNER_HITBOX = { width: 1.20, height: 2.10, depth: 1.20 };
const GIANT_HITBOX = { width: 3.50, height: 6.00, depth: 3.50 };
const DOG_HITBOX = { width: 1.50, height: 0.95, depth: 2.00 };
const BAT_HITBOX = { width: 1.80, height: 1.20, depth: 1.20 };
```

If using raycast:

```js
raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
raycaster.far = SHOOT_RANGE;
```

Hit test should use the collider list:

```js
const hits = raycaster.intersectObjects(enemyHitColliders, false);
```

Each collider must point back to its enemy:

```js
collider.userData.enemy = enemy;
```

## Aim Tolerance For Distant Targets

If exact raycast still feels bad, add a small cone/angle tolerance.

Recommended first pass:

```js
const AIM_ASSIST_ANGLE_DEG = 2.2;
const AIM_ASSIST_MAX_DIST = 120;
```

Logic:

```text
1. Cast crosshair ray.
2. If it hits a collider, damage that enemy.
3. If it does not hit, find the living enemy closest to the crosshair direction.
4. If angle to crosshair is within 2.2 degrees and distance is below 120, damage it.
5. Prefer the smallest angle, then nearest distance.
```

This is not auto-play. It only makes tiny distant targets playable on mobile.

## Health And Damage Acceptance

First combat pass values:

| Enemy | Health | Expected Result |
|---|---:|---|
| Normal | 3 | dies in 3 body shots |
| Runner | 2 | dies in 2 body shots |
| Dog | 1 | dies in 1 body shot |
| Bat | 1 | dies in 1 body shot |
| Helmet | 4 | helmet breaks or dies after 4 body shots |
| Giant | 12 | tank enemy |

Bullet damage:

```text
body shot = 1
headshot = 2
```

For debugging, normal zombies must die in 3 body shots from the starting weapon.

## Spawn Distance For Testing

The original build uses a spawn radius around `100`. That is fine after combat is stable.

For Maker validation, use a temporary test radius:

```js
const TEST_SPAWN_RADIUS = 55;
```

Acceptance:

- Enemies spawn close enough to visibly inspect.
- They can still approach from all 360 degrees.
- After hit detection is confirmed, spawn radius can be raised to `80-100`.

Do not keep enemies so far away that the player sees tiny unreadable figures in fog.

## Hit Feedback Required

Every successful hit must show at least two feedback cues:

- Enemy flashes red or white for 0.08-0.12 seconds.
- Crosshair briefly changes to danger red.
- Small hit spark/blood particle at impact.
- Optional floating damage number.

Every death must show:

- Enemy removed or death animation starts within 0.2 seconds.
- Score/enemy counter updates.
- Optional collapse/fade effect.

If there is no hit feedback, the player will assume enemies are unkillable.

## Debug Mode

Add a temporary debug flag:

```js
const DEBUG_HITBOXES = false;
```

When true:

- Show enemy hitboxes as transparent green wireframes.
- Show the crosshair ray.
- Log hit enemy name, distance, and remaining health.

When false:

- Hitboxes must be invisible.
- No gray debug boxes should remain in the shipping view.

## Maker Prompt: Enemy Fix Pass

Give Maker this prompt:

```md
The scene structure is acceptable, but enemy visuals and hit detection are broken.
Do not add new systems. Do not change progression, robots, ads, scene layout, or camera.

Only fix enemies and shooting.

Problems:
- Zombies look ugly and placeholder-like.
- Many enemies are gray shells or have no texture/material.
- Enemies are too far/small and cannot be killed reliably.
- Shooting has unclear hit feedback.

Required fixes:
1. Remove all visible gray placeholder shells from enemies.
2. Build a readable normal zombie first: low-poly horror humanoid, rounded/capsule head, tapered torso, bent arms, uneven legs, green skin, teal shirt, dark pants, visible eyes.
3. Every enemy mesh must have intentional material/color/texture. No default gray material.
4. Add invisible hit colliders for enemies. Do not rely only on exact visible mesh raycast.
5. Normal zombie health = 3 and it must die in 3 body shots.
6. Set shooting range to at least 160.
7. Add distant aim tolerance around 2.2 degrees if exact raycast misses.
8. Add immediate hit feedback: enemy flash, crosshair flash, and enemy counter/score update on death.
9. Temporarily test enemies at radius around 55 so they are visible and killable; later radius can return to 80-100.
10. Add DEBUG_HITBOXES=false and ensure no debug gray boxes show in normal play.

Acceptance:
- No enemy has a visible gray shell.
- Normal zombies are green/teal, readable, and not block-grid/Minecraft style.
- A normal zombie dies in exactly 3 body shots from the starting gun.
- Distant enemies can be hit when the crosshair is visually on them.
- Hit feedback is obvious.
- No scene layout or gameplay system changes were made.
```

## Rejection Checklist

Reject the Maker output if:

- Any enemy still has a visible gray capsule/box shell.
- Hitboxes are visible during normal play.
- Zombies still look like Minecraft/block-grid characters.
- Normal zombies do not die in 3 body shots.
- Shooting only works at point-blank range.
- Enemies stay tiny and unreadable behind fog.
- Maker changes scene layout instead of fixing enemy visuals/combat.
