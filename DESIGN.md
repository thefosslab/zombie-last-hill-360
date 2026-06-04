# Zombie Last Hill - Game Design

## Current Product Direction

`Zombie Last Hill` is a 360-degree hilltop survival shooter. The player holds a central position, aims around the full defensive ring, survives escalating zombie waves, collects supplies, and pushes for higher wave scores.

The current build is best positioned as an IAA-first hybrid-casual game:

- Low barrier: immediate shooting, simple controls, short sessions.
- Medium depth: wave pressure, enemy priority, supplies, upgrades, and future defensive placements.
- Monetization fit: rewarded ads at natural fail/reward moments, with interstitials only at clean wave transitions.

## Current Playable Content

- Full 360-degree horizontal aiming.
- Circular enemy, dog pack, and airdrop spawn coverage.
- Wave-based survival loop.
- Supply drops and inventory item usage.
- Multiple enemy roles, including standard zombies, runners, helmet zombies, crawlers, giants, bats, bone throwers, screamers, and dog packs.
- Local runtime shim for Astrocade APIs, assets, config, logs, and local leaderboard.

## Core Loop

1. Start wave.
2. Scan 360-degree threat directions.
3. Shoot priority targets and manage immediate danger.
4. Collect or use supplies when pressure allows.
5. Clear wave or die.
6. Receive reward, upgrade, revive, or restart.

The target session length should be 3-5 minutes for early users, with strong replay pressure after death.

## Next Gameplay Depth: Light Tower Defense

The strongest next layer is light tower-defense support, not full passive tower defense.

Player role:

- Active shooter.
- Emergency responder.
- Priority-target killer.
- Defender of weak sides.

Robot role:

- Hold lanes.
- Create strategic coverage.
- Buy time.
- Become a repair/protection objective.

### First Tower-Defense Prototype

Add two robot points first:

- Left-side robot point.
- Right-side robot point.

Each robot should cover a limited angle, not the full circle. The player still needs to rotate, rescue weak areas, and kill high-priority enemies.

Recommended first robot types:

- Machine-gun robot: stable damage, good against normal zombies.
- Shock or shotgun robot: short-range knockback, good against breakthrough pressure.
- Freeze robot: slows groups and creates control windows.

Robot constraints:

- Robots can be damaged.
- Robots can overheat, reload, or temporarily stop firing.
- Some enemies should target robots directly.
- Broken robots create urgent pressure rather than ending the run instantly.

## Enemy Design After Robots

Enemy roles should force the player to make target-priority decisions:

- Runner: rushes robot points.
- Giant: damages defensive points heavily.
- Bone thrower: chips robot health from range.
- Screamer: accelerates or summons nearby waves.
- Bat: breaks player comfort by attacking from elevation or odd angles.

## Upgrade Structure

Between waves, offer one of three upgrades:

- Increase robot damage.
- Repair a robot.
- Add temporary armor to one side.
- Add fire, pierce, freeze, or chain effects.
- Reduce supply cooldown.
- Improve player reload, damage, or critical shots.

Permanent progression can use scrap as soft currency:

- Weapon upgrades.
- Robot slot upgrades.
- Robot type unlocks.
- Base durability upgrades.
- Cosmetic weapon and robot skins.

## IAA Monetization Design

Rewarded video should be the main ad format:

- Death revive: revive once with partial health and a small area clear.
- Wave reward double: double scrap or supply rewards after clearing a wave.
- Upgrade reroll: refresh the three upgrade choices.
- Robot repair: repair one broken robot during a wave or before the next wave.
- Temporary robot slot: unlock an extra robot point for the current run.

Interstitials should only appear at natural breaks:

- After wave 2 or wave 3, never during active combat.
- After boss wave clear.
- After failure/settlement.

Avoid banner ads inside combat. They compete with aiming, threat indicators, and mobile screen space.

## Metrics To Validate

Core retention:

- D1, D3, D7 retention.
- Average session length.
- Average wave reached.
- Death source and death direction.

Ad health:

- Rewarded ad opt-in rate by placement.
- Impressions per session.
- Ad ARPDAU.
- Churn after interstitial.
- Revive ad completion and post-revive survival time.

Gameplay balance:

- Robot damage share.
- Player damage share.
- Robot destruction frequency.
- Upgrade pick rates.
- Enemy type kill/death contribution.

## Roadmap

Phase 1:

- Keep current 360-degree shooter.
- Add edge threat indicators or radar.
- Add two robot points.
- Add robot damage and repair state.
- Add wave-end three-choice upgrades.

Phase 2:

- Add rewarded revive.
- Add wave reward double.
- Add upgrade reroll.
- Add robot repair reward.
- Add analytics events for retention and ad placement.

Phase 3:

- Add more robot slot layouts.
- Add boss waves.
- Add permanent upgrade tree.
- Add daily missions.
- Add cosmetics and optional remove-ads purchase if the platform supports it.
