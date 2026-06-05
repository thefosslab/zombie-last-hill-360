# Zombie Last Hill - Game Design

## Product Direction

`Zombie Last Hill` should become a 360-degree holdout shooter with in-run roguelite builds and out-of-run progression.

The game should not become a traditional tower-defense game. The player remains the main combat actor. Robots are support units and progression targets, not the core replacement for shooting.

Core structure:

```text
Out-of-run progression
Choose and upgrade weapon / robot / base / talents
↓
Start a chapter run
Survive 360-degree zombie waves from the hilltop
↓
Kill enemies and gain in-run XP
Choose one of three temporary upgrades
↓
Build a run-specific combat style
Fight elite waves and a chapter boss
↓
Die or clear the chapter
Earn coins / parts / blueprints / chests
↓
Return to out-of-run progression
Upgrade permanent power and push the next chapter
```

## Current Playable Content

- First-person 360-degree hilltop defense.
- Full circular enemy, dog pack, and airdrop spawn coverage.
- Wave-based survival loop.
- Airdrops and inventory item usage.
- Multiple enemy roles: normal zombie, crawler, helmet zombie, runner, giant, bat, dog, bone thrower, and screamer.
- Local runtime shim for Astrocade APIs, assets, config, logs, and local leaderboard.

## Core Pillars

1. Active shooting: aim, track, prioritize, and kill threats.
2. Run building: each run creates a temporary build through three-choice upgrades.
3. Permanent growth: failed runs still feed out-of-run upgrades.

## In-Run Loop

```text
Start wave
↓
Enemies approach from all 360 degrees
↓
Player shoots priority targets
↓
Kills grant XP and supplies create tactical decisions
↓
XP level-up opens one-of-three upgrades
↓
Temporary upgrades shape this run
↓
Elite/Boss waves test the build
```

Target run length:

- Early chapters: 5-8 minutes.
- Chapter format: 10 waves.
- Recommended structure: wave 3 elite, wave 6 elite, wave 10 boss.

## In-Run Upgrade Lines

Keep upgrades temporary. They reset at the end of the run.

Firepower line:

- Fire rate.
- Pierce.
- Explosive bullets.
- Shotgun spread.
- Critical chain.

Survival line:

- Shield.
- Lifesteal.
- Damage reduction.
- Emergency heal.
- One-time death protection.

Robot line:

- Robot damage.
- Robot fire rate.
- Robot temporary repair.
- Robot fire/electric/freeze module.
- Temporary extra support drone.

Supply line:

- Airdrop cooldown reduction.
- Larger pickup range.
- Better supply rewards.
- Extra medkit chance.
- Ammo/overdrive bonus.

## Evolution Rules

Upgrades should create goals, not only flat numbers.

Examples:

```text
Pierce Lv.5 + electromagnetic core = railgun bullets
Shotgun Lv.5 + explosive powder = explosive scatter
Robot Lv.5 + fire module = flame drone
Shield Lv.5 + medical module = regenerative shield
```

## Out-of-Run Progression

Permanent progression should be simple at first.

Systems:

- Weapon upgrades.
- Robot upgrades.
- Base upgrades.
- Talent tree.
- Chapter progression.

Resources:

- Coins: weapon and talent upgrades.
- Parts: robot and base upgrades.
- Blueprints: unlock new weapons, robots, and chapter features.

Design goal:

```text
The player loses a run, earns resources, upgrades permanent power, and believes the next run can push farther.
```

## Robot Positioning

Robots are support units, not a tower-defense system.

Out-of-run:

- Unlock robot support.
- Upgrade robot base damage, health, and ability.
- Unlock robot variants.

In-run:

- Temporarily improve robot damage or ability through three-choice upgrades.
- Use robots to reduce pressure from one side.
- Keep the player responsible for killing key enemies.

Robots must not clear waves by themselves.

## Monetization Placement

Rewarded ads should be optional and tied to natural run moments.

Best placements:

- Death revive.
- Settlement reward double.
- Free chest.
- Upgrade reroll.
- Daily supply.

Interstitials should only appear at clean breaks:

- After run settlement.
- After chapter clear.
- After a non-first death, with frequency caps.

No combat interruption.

## First Implementation Target

Do not add every system at once. The next product milestone should be:

1. In-run XP bar.
2. Kill-based level-up.
3. One-of-three in-run upgrade screen.
4. Run settlement screen.
5. Coins as the first permanent resource.
6. Out-of-run weapon upgrade.
7. Robot upgrade entry can exist visually, but robot depth can wait.

## Validation Metrics

Retention:

- D1, D3, D7 retention.
- Average run length.
- Chapter completion rate.
- Wave reached on failed runs.

Build health:

- Upgrade pick rates.
- Damage share by upgrade line.
- Most common death waves.
- Boss failure rate.

Economy:

- Coins earned per run.
- Upgrade purchase frequency.
- Time to first permanent upgrade.

Ads:

- Rewarded revive opt-in.
- Settlement double opt-in.
- Upgrade reroll opt-in.
- Churn after interstitial.
