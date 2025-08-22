<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { mathApi, type GameConfig, type SpinResult } from '$lib/api/mathApi';
  import { apiConnection } from '$lib/stores/api';
  import { gameTrackingService, gameTracking } from '$lib/stores/gameTracking';
  import ApiStatus from '$lib/components/ApiStatus.svelte';
  import GameStats from '$lib/components/GameStats.svelte';
  import { Card, Button, Input, Label, Alert, Spinner } from 'flowbite-svelte';
  import { PlaySolid, CogSolid, ArrowLeftOutline } from 'flowbite-svelte-icons';
  
  // Game state
  let gameConfig: GameConfig | null = null;
  let betAmount = 1.0;
  let balance = 1000.0;
  let lastSpin: SpinResult | null = null;
  let loading = false;
  let error: string | null = null;
  let gameStarted = false;
  let autoPlay = false;
  let autoSpinsRemaining = 0;
  
  // Use centralized API connection and game tracking
  $: apiConnected = $apiConnection.connected;
  $: trackingState = $gameTracking;
  
  // Session management
  let sessionId: string | null = null;
  
  // Mythical Dragons specific config
  const dragonSymbols = ['🐉', '🔥', '💎', '👑', '⚔️', '🏰', '🌟'];
  const dragonConfig = {
    game_id: "mythical_dragons",
    provider_name: "BuffaloCasino",
    game_name: "Mythical Dragons",
    rtp: 0.96,
    house_edge: 0.04,
    max_bet: 500,
    theme: "dragons",
    paylines: {
      "0": [1, 1, 1, 1, 1], // Middle line
      "1": [0, 0, 0, 0, 0], // Top line
      "2": [2, 2, 2, 2, 2], // Bottom line
      "3": [0, 1, 2, 1, 0], // V shape
      "4": [2, 1, 0, 1, 2], // ^ shape
      "5": [1, 0, 1, 2, 1], // Zigzag
      "6": [1, 2, 1, 0, 1], // Reverse zigzag
      "7": [0, 0, 1, 2, 2], // Diagonal
      "8": [2, 2, 1, 0, 0], // Reverse diagonal
    }
  };

  onMount(async () => {
    gameConfig = dragonConfig;
    
    // Start game session if user is logged in
    if ($user) {
      sessionId = await gameTrackingService.startGameSession(
        dragonConfig.game_id,
        $user.id,
        balance
      );
    }
  });
  
  onDestroy(async () => {
    // End game session when component is destroyed
    if (sessionId && $user) {
      await gameTrackingService.endGameSession(balance);
    }
  });

  async function spin() {
    if (!gameConfig || betAmount > balance || loading || !apiConnected) return;
    
    loading = true;
    error = null;
    const spinStartTime = Date.now();
    const balanceBefore = balance;
    
    try {
      const result = await mathApi.spin({
        bet_amount: betAmount,
        game_config: gameConfig
      });
      
      // Replace symbols with dragon themed ones
      const themedBoard = result.board.map(reel => 
        reel.map(symbol => {
          const symbolMap: Record<string, string> = {
            'A': '🐉', 'K': '🔥', 'Q': '💎', 'J': '👑', 
            '10': '⚔️', '9': '🏰', 'W': '🌟'
          };
          return symbolMap[symbol] || symbol;
        })
      );
      
      lastSpin = { ...result, board: themedBoard };
      balance -= betAmount;
      balance += result.total_win;
      const balanceAfter = balance;
      const spinDuration = Date.now() - spinStartTime;
      
      // Track the play in Supabase if user is logged in
      if ($user && sessionId) {
        await gameTrackingService.recordGamePlay(
          gameConfig.game_id,
          $user.id,
          betAmount,
          result.total_win,
          result.board, // Original board before theming
          result.wins,
          balanceBefore,
          balanceAfter,
          spinDuration
        );
      }
      
      // Auto play logic
      if (autoPlay && autoSpinsRemaining > 0) {
        autoSpinsRemaining--;
        if (autoSpinsRemaining > 0 && balance >= betAmount) {
          setTimeout(() => spin(), 2000); // 2 second delay between spins
        } else {
          autoPlay = false;
        }
      }
    } catch (e) {
      error = `Spin failed: ${e instanceof Error ? e.message : 'Unknown error'}`;
      autoPlay = false;
    } finally {
      loading = false;
    }
  }

  function startAutoPlay(spins: number) {
    if (balance < betAmount * spins) {
      error = "Insufficient balance for auto play";
      return;
    }
    autoPlay = true;
    autoSpinsRemaining = spins;
    spin();
  }

  function stopAutoPlay() {
    autoPlay = false;
    autoSpinsRemaining = 0;
  }

  function getSymbolMultiplier(symbol: string): string {
    const multipliers: Record<string, string> = {
      '🐉': '100x', '🔥': '50x', '💎': '25x', '👑': '15x',
      '⚔️': '10x', '🏰': '5x', '🌟': 'WILD'
    };
    return multipliers[symbol] || '1x';
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 md:p-6">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
      <div class="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
        <Button href="/games" color="alternative" size="sm">
          <ArrowLeftOutline class="w-4 h-4 mr-2" />
          Back to Games
        </Button>
        <div>
          <h1 class="text-2xl md:text-4xl font-bold text-white">🐉 Mythical Dragons</h1>
          <p class="text-sm md:text-base text-gray-300">Legendary wins await in the dragon's lair</p>
        </div>
      </div>
      <div class="text-right">
        <div class="text-sm text-gray-400">Balance</div>
        <div class="text-xl font-bold text-green-400">${balance.toFixed(2)}</div>
      </div>
    </div>

  <div class="max-w-7xl mx-auto p-6">
    <!-- API Status -->
    <ApiStatus />
    
    <!-- Game Statistics -->
    <GameStats gameId="mythical_dragons" />
    
    {#if error}
      <Alert color="red" class="mb-6">
        <span class="font-medium">Error!</span> {error}
      </Alert>
    {/if}

    <div class="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
      <!-- Game Board -->
      <div class="xl:col-span-3">
        <Card class="p-4 md:p-6 bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30">
          <!-- Slot Machine -->
          <div class="mb-4 md:mb-6">
            {#if lastSpin}
              <div class="grid grid-cols-5 gap-1 md:gap-3 mb-4 md:mb-6">
                {#each lastSpin.board as reel, reelIndex}
                  <div class="space-y-1 md:space-y-3">
                    {#each reel as symbol, symbolIndex}
                      <div class="bg-black/40 border-2 border-purple-500/50 rounded-lg p-2 md:p-4 text-center backdrop-blur-sm
                                  hover:border-purple-400 transition-all duration-300">
                        <span class="text-2xl md:text-4xl">{symbol}</span>
                      </div>
                    {/each}
                  </div>
                {/each}
              </div>
            {:else}
              <!-- Empty Board -->
              <div class="grid grid-cols-5 gap-1 md:gap-3 mb-4 md:mb-6">
                {#each Array(5) as _, reelIndex}
                  <div class="space-y-1 md:space-y-3">
                    {#each Array(3) as _, symbolIndex}
                      <div class="bg-black/40 border-2 border-gray-600 rounded-lg p-2 md:p-4 text-center">
                        <span class="text-2xl md:text-4xl text-gray-500">?</span>
                      </div>
                    {/each}
                  </div>
                {/each}
              </div>
            {/if}

            <!-- Win Display -->
            {#if lastSpin}
              {#if lastSpin.total_win > 0}
                <div class="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border border-yellow-500/50 rounded-lg p-6 mb-4">
                  <div class="text-center">
                    <h3 class="text-2xl font-bold text-yellow-400 mb-2">🎉 DRAGON WIN! 🎉</h3>
                    <div class="text-4xl font-bold text-yellow-400 mb-4">
                      ${lastSpin.total_win.toFixed(2)}
                    </div>
                    
                    {#if lastSpin.wins.length > 0}
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {#each lastSpin.wins as win}
                          <div class="bg-black/30 rounded p-2 text-yellow-300 text-sm">
                            {win.symbol} x{win.kind} = ${win.win.toFixed(2)}
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </div>
                </div>
              {:else}
                <div class="bg-gray-900/50 border border-gray-600 rounded-lg p-4 mb-4 text-center">
                  <div class="text-gray-400">The dragons slumber... Try again!</div>
                </div>
              {/if}
            {/if}
          </div>
        </Card>
      </div>

      <!-- Controls & Info -->
      <div class="space-y-6">
        <!-- Game Controls -->
        <Card class="p-6 bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30">
          <h3 class="text-lg font-semibold text-white mb-4">🎮 Game Controls</h3>
          
          <div class="space-y-4">
            <div>
              <Label for="bet" class="mb-2 text-purple-300">Bet Amount</Label>
              <Input
                id="bet"
                type="number"
                bind:value={betAmount}
                min="0.1"
                max={Math.min(balance, gameConfig?.max_bet || 500)}
                step="0.1"
                disabled={loading || autoPlay}
                class="bg-black/30 border-purple-500/50"
              />
            </div>
            
            <div class="space-y-2">
              <Button
                on:click={spin}
                disabled={loading || autoPlay || betAmount > balance}
                class="w-full"
                color="primary"
              >
                {#if loading}
                  <Spinner class="mr-3" size="4" color="white" />
                  Spinning...
                {:else if autoPlay}
                  Auto Playing ({autoSpinsRemaining})
                {:else}
                  <PlaySolid class="mr-2 w-4 h-4" />
                  SPIN (${betAmount.toFixed(2)})
                {/if}
              </Button>
              
              {#if !autoPlay}
                <div class="grid grid-cols-2 gap-2">
                  <Button
                    on:click={() => startAutoPlay(10)}
                    disabled={loading || balance < betAmount * 10}
                    size="sm"
                    color="alternative"
                  >
                    Auto 10
                  </Button>
                  <Button
                    on:click={() => startAutoPlay(25)}
                    disabled={loading || balance < betAmount * 25}
                    size="sm"
                    color="alternative"
                  >
                    Auto 25
                  </Button>
                </div>
              {:else}
                <Button
                  on:click={stopAutoPlay}
                  class="w-full"
                  color="red"
                  size="sm"
                >
                  Stop Auto Play
                </Button>
              {/if}
            </div>
          </div>
        </Card>

        <!-- Paytable -->
        <Card class="p-6 bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30">
          <h3 class="text-lg font-semibold text-white mb-4">💰 Paytable</h3>
          <div class="space-y-2">
            {#each dragonSymbols as symbol}
              <div class="flex justify-between items-center text-sm">
                <div class="flex items-center space-x-2">
                  <span class="text-xl">{symbol}</span>
                  <span class="text-purple-300">x3+</span>
                </div>
                <span class="text-yellow-400 font-semibold">{getSymbolMultiplier(symbol)}</span>
              </div>
            {/each}
          </div>
        </Card>

        <!-- Game Info -->
        <Card class="p-6 bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30">
          <h3 class="text-lg font-semibold text-white mb-4">ℹ️ Game Info</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">RTP:</span>
              <span class="text-white">{gameConfig ? (gameConfig.rtp * 100).toFixed(1) : '96.0'}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Paylines:</span>
              <span class="text-white">9</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Max Bet:</span>
              <span class="text-white">${gameConfig?.max_bet || 500}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Volatility:</span>
              <span class="text-white">High</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</div>
