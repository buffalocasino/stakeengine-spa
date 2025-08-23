// src/routes/games/+page.server.js
export async function load() {
    return {
      configUrl: "/game-config.json"
    };
  }