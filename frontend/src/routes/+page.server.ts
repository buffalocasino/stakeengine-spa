// Game configuration is now handled client-side or via static files
export const load = async () => {
  // Return a static config URL or handle this client-side
  return { configUrl: '/game-config.json' };
};
