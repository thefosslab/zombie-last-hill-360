# Maker Fallback: Remote Airdrop Collection

This is not the current product direction.

The current direction requires physical airdrop pickup. Use `MAKER_PHYSICAL_AIRDROP_COLLECTION.md` first.

Only use this remote collection fallback if the user explicitly approves removing physical pickup later.

## New Airdrop Design

The player never leaves the hilltop.

Flow:

```text
Plane/drop event
↓
Airdrop crate lands on terrain
↓
Player aims crosshair at crate
↓
Hold/click to scan or recall crate
↓
Progress ring fills for 0.8-1.2 seconds
↓
Crate opens remotely
↓
Reward flies to HUD/inventory
↓
Crate disappears
```

No camera run.
No player body run.
No first-person gun hiding state.
No mounted gun carried to the crate.

The player stays in turret mode the entire time.

## Required Behavior

- Keep `playerMode = TURRET` at all times during airdrop collection.
- Do not move the camera toward the crate.
- Do not move the player toward the crate.
- Do not detach or hide the gun.
- Do not show a running animation.
- Do not create `RUN_TO_AIRDROP`, `LOOT_AIRDROP`, or `RETURN_TO_TURRET` states.
- Aiming at the crate changes crosshair to supply mode.
- Clicking or holding while aimed at the crate starts remote collection.
- Collection can be interrupted if the player looks away or takes damage.

## Collection Interaction

Recommended:

```js
const AIRDROP_COLLECT_TIME = 1.0;
let activeAirdropTarget = null;
let airdropCollectProgress = 0;
let isCollectingAirdrop = false;
```

Update:

```js
function updateAirdropTarget(dt) {
  activeAirdropTarget = getAirdropUnderCrosshair();

  if (!activeAirdropTarget) {
    isCollectingAirdrop = false;
    airdropCollectProgress = 0;
    setCrosshairSupplyMode(false);
    return;
  }

  setCrosshairSupplyMode(true);

  if (isCollectingAirdrop) {
    airdropCollectProgress += dt / AIRDROP_COLLECT_TIME;
    updateAirdropProgressUI(airdropCollectProgress);

    if (airdropCollectProgress >= 1) {
      collectAirdrop(activeAirdropTarget);
      isCollectingAirdrop = false;
      airdropCollectProgress = 0;
    }
  }
}
```

Input:

```js
function onShootOrInteractPressed() {
  if (activeAirdropTarget) {
    isCollectingAirdrop = true;
    airdropCollectProgress = 0;
    return;
  }

  shoot();
}

function onShootOrInteractReleased() {
  isCollectingAirdrop = false;
  airdropCollectProgress = 0;
}
```

Remote collection:

```js
function collectAirdrop(airdrop) {
  if (!airdrop || airdrop.state !== 'landed') return;

  giveAirdropReward(airdrop);
  spawnRewardFlyToHudEffect(airdrop.position);
  removeAirdrop(airdrop);
  setCrosshairSupplyMode(false);
}
```

## Shooting Rule

If the crosshair is on a landed airdrop, click/hold should interact with the crate instead of shooting.

If the crosshair is not on a landed airdrop, click shoots normally.

The first-person gun remains visible because the player is still on the turret. That is correct in this fallback design.

## Airdrop Landing Still Required

The crate must still land above terrain:

```js
const groundY = getGroundYByRaycast(x, z);
crate.position.y = groundY + crateHalfHeight + 0.05;
```

Reject if the crate clips underground.

## Visual Feedback

Required:

- Supply lock crosshair when aimed at crate.
- Progress ring or progress bar while holding/clicking.
- Small beam, scan line, or drone/reel effect from hilltop to crate.
- Reward icon flies to HUD/inventory.
- Crate disappears after collection.

The fantasy can be:

- Radio-guided supply recall.
- Magnetic cable retrieval.
- Small drone fetch.
- Remote crate unlock.

Do not show the player physically running to the crate.

## Maker Prompt

```md
Stop trying to implement running to the airdrop. Remove that interaction completely.

Read MAKER_AIRDROP_REMOTE_COLLECT.md and implement remote airdrop collection.

New rule:
- Player never leaves the turret/hilltop to collect airdrop.
- No camera movement to crate.
- No player run state.
- No RUN_TO_AIRDROP / LOOT_AIRDROP / RETURN_TO_TURRET.
- The first-person gun remains visible because the player stays on the turret.

Interaction:
- Airdrop lands on terrain.
- Player aims crosshair at landed crate.
- Crosshair enters supply lock mode.
- Click/hold for 0.8-1.2 seconds to remotely collect.
- Reward goes to inventory/HUD.
- Crate disappears.

Keep:
- 360-degree shooting.
- Wave combat.
- Airdrop landing.
- Normal shooting when not aiming at crate.

Acceptance:
- There is no sequence where the player runs to the airdrop.
- There is no bug where the player carries the gun while running, because running is removed.
- Aiming at crate collects remotely.
- Airdrop does not clip underground.
- No unrelated gameplay changes.
```

## Rejection Checklist

Reject Maker output if:

- It still moves the camera/player to the crate.
- It still has run-to-airdrop states.
- It asks the player to physically loot at the crate.
- It still has the old "hide gun while running" implementation.
- The crate clips underground.
- Click does not collect when crosshair is on a landed crate.
