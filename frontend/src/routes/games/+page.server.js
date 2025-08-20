// src/routes/games/+page.server.js
export async function load() {
    return {
      configUrl: "https://<YOUR-SUPABASE-STORAGE-URL>/configs/game1.json"
    };
  }