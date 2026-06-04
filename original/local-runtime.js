(function () {
  "use strict";

  const localState = {
    assetMap: {},
    leaderboardKey: "zombie-last-hill-local-leaderboard"
  };

  function readLeaderboard() {
    try {
      return JSON.parse(localStorage.getItem(localState.leaderboardKey) || "[]");
    } catch (error) {
      return [];
    }
  }

  function writeLeaderboard(entries) {
    localStorage.setItem(localState.leaderboardKey, JSON.stringify(entries.slice(0, 100)));
  }

  async function loadJson(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Failed to load " + path);
    return response.json();
  }

  window.setupLocalAstrocadeRuntime = async function setupLocalAstrocadeRuntime() {
    const [assetMap, gameConfig] = await Promise.all([
      loadJson("asset_map.json"),
      loadJson("game_config.json")
    ]);

    localState.assetMap = assetMap;
    window.gameConfig = gameConfig;

    window.lib = {
      getAsset(id) {
        return localState.assetMap[id] || null;
      },

      showGameParameters() {
        // Astrocade editor-only panel. The local player build does not need it.
      },

      log(message) {
        console.log("[local-astrocade]", message);
      },

      async addPlayerScoreToLeaderboard(score) {
        const entries = readLeaderboard();
        const value = Number(score) || 0;
        entries.push({
          id: Date.now() + "-" + Math.random().toString(36).slice(2),
          score: value,
          username: "Local Player",
          avatarUrl: ""
        });
        entries.sort((a, b) => b.score - a.score);
        writeLeaderboard(entries);
        const userRank = entries.findIndex((entry) => entry.score === value) + 1;
        return { success: true, userRank: userRank || entries.length };
      },

      async getTopNEntriesFromLeaderboard(limit) {
        return { entries: readLeaderboard().slice(0, limit || 10) };
      }
    };
  };
})();
