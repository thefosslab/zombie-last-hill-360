# Zombie Last Hill - Local Original

This folder contains the extracted Astrocade published build for:

`https://www.astrocade.com/games/zombie-last-hill/01KSEDNMD1G288092SE29M2Y8J`

It also contains the current 360-degree gameplay update, Maker handoff instructions, and the design plan for in-run roguelite builds plus out-of-run progression.

## Play

Run a local server from this directory:

```sh
python3 -m http.server 8003
```

Then open:

`http://127.0.0.1:8003/original/`

The root `index.html` redirects to `original/`.

## Extracted Files

- `original/index.html`: original exported Astrocade game code with a local startup wrapper appended
- `original/local-runtime.js`: local Astrocade runtime shim for assets, config, logs, and local leaderboard
- `original/asset_map.json`: asset map rewritten to local file paths
- `original/game_config.json`: extracted game configuration
- `original/assets/`: downloaded game images and audio
- `original/vendor/three.min.js`: local Three.js r128
- `play.json`, `full.json`: extracted Astrocade context packages
- `MAKER_HANDOFF.md`: scene reconstruction instructions for Maker
- `ART_DIRECTION.md`: color, lighting, material, and readability rules
- `MAKER_ENEMY_COMBAT_FIX.md`: enemy visuals and hit detection fix instructions
- `MAKER_TEXTURE_AIRDROP_FIX.md`: texture/material pass and airdrop state bugfix instructions
- `MAKER_HARD_BLOCKERS.md`: hard blocker instructions for gun-visible pickup and rejected block-grid zombies
- `MAKER_AIRDROP_REMOTE_COLLECT.md`: fallback that removes run-to-airdrop and uses remote supply collection

Verified locally with Chrome headless WebGL: the original start screen renders from local files.

## Local Changes

- Combat camera now supports full 360-degree horizontal aiming.
- Zombies, dog packs, and airdrops now spawn around the full circular defensive ring instead of the original forward cone.

## Design

See `DESIGN.md` for the current product direction.

See `MAKER_HANDOFF.md` before asking Maker to rebuild or extend the game. The first Maker task should be scene reconstruction only, not progression or monetization.

After the scene structure is correct, use `ART_DIRECTION.md` for the color pass.

If enemies look like gray placeholders or cannot be killed reliably, use `MAKER_ENEMY_COMBAT_FIX.md`.

If the game still looks too plain, airdrops clip underground, or the player carries the gun while collecting supplies, use `MAKER_TEXTURE_AIRDROP_FIX.md`.

If the player still carries the gun during airdrop pickup or zombies still look blocky/grid-like, use `MAKER_HARD_BLOCKERS.md` and stop all other work until those are fixed.

If Maker still cannot fix gun-visible airdrop pickup, switch to `MAKER_AIRDROP_REMOTE_COLLECT.md` and remove physical airdrop pickup entirely.
