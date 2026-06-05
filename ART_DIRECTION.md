# Zombie Last Hill - Art Direction

## Current Visual Problem

The current Maker reconstruction has the correct structure, but the color direction is weak.

Observed problems:

- Sky and fog are too flat and pale blue-gray.
- Terrain is too pink/purple and reads like clay, not apocalyptic dirt.
- Foreground blocks are near-black with little material identity.
- Sandbags, terrain, buildings, and enemies do not have a clear color hierarchy.
- Distant enemies blend into the horizon.
- The scene feels washed out instead of tense.

The fix is not more geometry. The fix is a stricter color script, better lighting separation, and clearer gameplay readability.

## Visual Target

Readable apocalyptic survival shooter.

The scene should feel:

- Cold in the sky.
- Warm and dusty around the player defense ring.
- Dark in the distant wasteland.
- High contrast around enemies, crosshair, and interactable objects.
- Gritty but still readable on mobile.

Do not make the scene monochrome.
Do not use pastel purple terrain.
Do not use pure black structures unless they are small silhouettes.
Do not hide enemies in fog.

## Core Palette

Use these colors as the first pass palette.

| Role | Hex | Usage |
|---|---|---|
| Sky top | `#28303A` | upper sky, storm atmosphere |
| Sky horizon | `#56616A` | horizon gradient |
| Fog | `#5F6668` | distance fog, not too bright |
| Hilltop dirt | `#4E4032` | player platform and near ground |
| Slope dirt | `#3A3028` | main slope |
| Outer wasteland | `#252722` | far ground |
| Sandbag base | `#B18A55` | sandbag top color |
| Sandbag shadow | `#6B5034` | sandbag sides and cracks |
| Metal dark | `#20262D` | gun and ruined metal |
| Metal edge | `#59626C` | subtle metal highlights |
| Wood | `#5A3D25` | dead wood and crates |
| Cloth | `#574736` | dirty fabric |
| Murky water | `#1B3A3D` | far swamp/water |
| Zombie skin | `#6F9A5D` | normal enemy skin |
| Zombie shirt | `#245765` | enemy clothing |
| Runner accent | `#B84A35` | fast enemy warning color |
| Giant accent | `#58636C` | heavy enemy color |
| Danger red | `#FF3D32` | crosshair hit, damage, warnings |
| Interact green | `#39FF68` | start, interact, supply confirmation |
| Reward gold | `#F4C65A` | coins, rewards, clear states |

## Color Hierarchy

Use this priority order:

1. UI and danger markers: brightest.
2. Enemies: more saturated than environment.
3. Sandbag defense ring and gun: readable foreground.
4. Terrain: muted and dark.
5. Sky/fog: atmospheric, not dominant.

Enemies must be visible at long distance. They should be slightly greener/bluer than the environment and should not share the terrain palette.

## Lighting Direction

Use a cold sky and a warm low side light.

Recommended setup:

```js
scene.background = new THREE.Color('#56616A');
scene.fog = new THREE.FogExp2('#5F6668', 0.008);

const hemi = new THREE.HemisphereLight('#93A5B8', '#2A241F', 0.55);
scene.add(hemi);

const key = new THREE.DirectionalLight('#FFB36E', 1.15);
key.position.set(-8, 12, 6);
scene.add(key);

const fill = new THREE.DirectionalLight('#6F8DA8', 0.25);
fill.position.set(8, 5, -8);
scene.add(fill);

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
```

If Maker does not support these exact APIs, keep the same idea:

```text
cold ambient sky
warm directional sunset light
dark ground bounce
moderate fog
no flat full-bright ambient
```

## Terrain Rules

Terrain should be earthy, not pink.

Use:

- Near hilltop: warm brown dirt.
- Slope: darker brown/charcoal dirt.
- Outer wasteland: dark olive-gray.
- Add small color noise, but keep it within the same family.

Do not use:

- Pink clay.
- Pastel mauve.
- Flat gray with no material breaks.
- Same color for terrain and sandbags.

## Sandbag Rules

Sandbags should read as the player safe zone.

Use:

- Warm tan top faces.
- Darker ochre/brown side faces.
- Subtle black/brown seams.
- Slightly brighter than the slope.

Sandbags should not be pink or gray.

## Gun Rules

The gun should be heavy, dark metal, and readable against the ground.

Use:

- Dark blue-black metal body.
- Muted steel edge highlights.
- Brass/copper detail on ammo drum or barrel ring.
- Small warm muzzle flash when shooting.

Do not make the whole gun black. Pure black loses shape.

## Sky And Fog Rules

The sky can be gray, but it needs contrast and mood.

Use a vertical gradient:

```text
top: dark storm blue-gray
middle: desaturated gray
horizon: dusty warm gray
```

Fog should push distance backward, not cover the whole world equally.

Bad:

```text
everything is the same pale blue-gray
```

Good:

```text
foreground warm/readable
midground muted
background foggy
```

## Enemy Readability

Each enemy type needs a distinct gameplay color cue.

First pass:

| Enemy | Color Direction |
|---|---|
| Normal | green skin + teal shirt |
| Runner | reddish skin/accent |
| Helmet | gray helmet highlight |
| Giant | gray-blue heavy body |
| Bat | dark purple/black with red eyes |
| Dog | brown body with red eye/accent |
| Bone thrower | pale bone detail |
| Screamer | purple mouth/accent |

Add a small red or orange eye/emissive cue if enemies are hard to see.

## UI Color Rules

Do not make all UI neon green.

Use:

- Green only for positive actions/start/interact.
- Red only for damage/danger/crosshair hit.
- Gold only for rewards.
- White for basic HUD text.
- Dark translucent panels for readability.

Crosshair:

- Default: off-white `#F2F0E8`.
- Enemy hit/aim feedback: red `#FF3D32`.
- Supply lock: green `#39FF68`.

## Maker Prompt: Color Pass

Give Maker this prompt after the scene structure is correct:

```md
The scene structure is acceptable. Do not change layout, camera, spawning, or gameplay.

Now do an art/color pass only.

Problem to fix:
- The current scene is too washed out.
- The sky/fog is flat pale blue-gray.
- The terrain is pink/purple and looks wrong.
- Foreground structures are too black and shapeless.
- Enemies do not pop clearly against the background.

Apply this visual direction:
- Cold storm sky, warm dusty hilltop, dark outer wasteland.
- Terrain must be earthy brown/charcoal, not pink or purple.
- Sandbags must be warm tan/ochre and readable as the player defense ring.
- Gun must be dark metal with steel/brass highlights, not pure black.
- Enemies must be more saturated than the environment, especially green/teal normal zombies.
- Use red only for danger/crosshair hit, green only for interact/start/supply, gold only for rewards.

Use this palette:
- Sky top #28303A
- Horizon #56616A
- Fog #5F6668
- Hilltop dirt #4E4032
- Slope dirt #3A3028
- Outer wasteland #252722
- Sandbag top #B18A55
- Sandbag shadow #6B5034
- Metal dark #20262D
- Metal highlight #59626C
- Zombie skin #6F9A5D
- Zombie shirt #245765
- Danger red #FF3D32
- Interact green #39FF68
- Reward gold #F4C65A

Lighting:
- Reduce flat ambient light.
- Add cold hemisphere/ambient sky light.
- Add warm directional side light.
- Keep fog moderate; do not let fog wash out the whole screen.
- Preserve enemy visibility at distance.

Acceptance:
1. The terrain no longer looks pink/purple.
2. The sandbag ring is clearly warmer and brighter than the slope.
3. The gun has visible dark metal shape and highlights.
4. Enemies are visible against terrain and fog.
5. The overall image reads as apocalyptic, not pastel.
6. No gameplay or layout changes were made.
```

## Rejection Checklist

Reject the art pass if:

- Terrain remains pink, purple, or lavender.
- Sky and terrain are almost the same value.
- The gun is a pure black blob.
- Enemies blend into the horizon.
- UI uses neon green for unrelated elements.
- Fog is so strong that depth and targets disappear.
- Maker changes the camera, scene layout, or spawning while doing the color pass.
