<script lang="ts">
  import { onMount } from "svelte";
  import { Button, Card, Input, Label, Alert, Spinner } from "flowbite-svelte";
  import { PlaySolid, CogSolid } from "flowbite-svelte-icons";
  import { mathApi, type GameConfig, type SpinResult } from "$lib/api/mathApi";

  let gameConfig: GameConfig | null = null;
  let betAmount = 1.0;
  let balance = 1000.0;
  let lastSpin: SpinResult | null = null;
  let loading = false;
  let error: string | null = null;
  let apiConnected = false;

  onMount(async () => {
    // Check API connection and load default config
    try {
      await mathApi.healthCheck();
      apiConnected = true;
      gameConfig = await mathApi.getDefaultConfig();
    } catch (e) {
      error = `Math API not available: ${e instanceof Error ? e.message : 'Unknown error'}. Make sure the Python backend is running on port 8000.`;
      apiConnected = false;
    }
  });

  async function spin() {
    if (!gameConfig || betAmount > balance) return;
    
    loading = true;
    error = null;
    
    try {
      const result = await mathApi.spin({
        bet_amount: betAmount,
        game_config: gameConfig
      });
      
      lastSpin = result;
      balance -= betAmount;
      balance += result.total_win;
    } catch (e) {
      error = `Spin failed: ${e instanceof Error ? e.message : 'Unknown error'}`;
    } finally {
      loading = false;
    }
  }

  async function runSimulation() {
    if (!gameConfig) return;
    
    loading = true;
    error = null;
    
    try {
      const result = await mathApi.simulate({
        game_config: gameConfig,
        num_spins: 1000,
        bet_amount: betAmount
      });
      
      alert(`Simulation Results:\n` +
            `Spins: ${result.total_spins}\n` +
            `Total Bet: $${result.total_bet.toFixed(2)}\n` +
            `Total Win: $${result.total_win.toFixed(2)}\n` +
            `Actual RTP: ${(result.actual_rtp * 100).toFixed(2)}%\n` +
            `Hit Frequency: ${(result.hit_frequency * 100).toFixed(2)}%`);
    } catch (e) {
      error = `Simulation failed: ${e instanceof Error ? e.message : 'Unknown error'}`;
    } finally {
      loading = false;
    }
  }
</script>

<div class="max-w-6xl mx-auto">
  <h1 class="text-3xl font-bold text-white mb-6">StakeEngine Games</h1>
  
  {#if error}
    <Alert color="red" class="mb-6">
      <span class="font-medium">Connection Error!</span> {error}
    </Alert>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Game Controls -->
    <div class="lg:col-span-1">
      <Card class="p-6">
        <h2 class="text-xl font-semibold text-white mb-4">Game Controls</h2>
        
        <div class="space-y-4">
          <div>
            <Label for="balance" class="mb-2">Balance</Label>
            <div class="text-2xl font-bold text-green-400">${balance.toFixed(2)}</div>
          </div>
          
          <div>
            <Label for="bet" class="mb-2">Bet Amount</Label>
            <Input
              id="bet"
              type="number"
              bind:value={betAmount}
              min="0.1"
              max={balance}
              step="0.1"
              disabled={loading || !apiConnected}
            />
          </div>
          
          <div class="space-y-2">
            <Button
              on:click={spin}
              disabled={loading || !apiConnected || betAmount > balance}
              class="w-full"
              color="primary"
            >
              {#if loading}
                <Spinner class="mr-3" size="4" color="white" />
                Spinning...
              {:else}
                <PlaySolid class="mr-2 w-4 h-4" />
                Spin (${betAmount.toFixed(2)})
              {/if}
            </Button>
            
            <Button
              on:click={runSimulation}
              disabled={loading || !apiConnected}
              class="w-full"
              color="alternative"
            >
              <CogSolid class="mr-2 w-4 h-4" />
              Run Simulation
            </Button>
          </div>
        </div>
      </Card>
      
      <!-- Game Config -->
      {#if gameConfig}
        <Card class="p-6 mt-6">
          <h3 class="text-lg font-semibold text-white mb-4">Game Configuration</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Game:</span>
              <span class="text-white">{gameConfig.game_name}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">RTP:</span>
              <span class="text-white">{(gameConfig.rtp * 100).toFixed(2)}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">House Edge:</span>
              <span class="text-white">{(gameConfig.house_edge * 100).toFixed(2)}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Max Bet:</span>
              <span class="text-white">${gameConfig.max_bet}</span>
            </div>
          </div>
        </Card>
      {/if}
    </div>
    
    <!-- Game Board -->
    <div class="lg:col-span-2">
      <Card class="p-6">
        <h2 class="text-xl font-semibold text-white mb-4">Slot Machine</h2>
        
        {#if lastSpin}
          <!-- Slot Reels -->
          <div class="grid grid-cols-5 gap-2 mb-6">
            {#each lastSpin.board as reel, reelIndex}
              <div class="space-y-2">
                {#each reel as symbol, symbolIndex}
                  <div class="bg-gray-800 border-2 border-primary-500/30 rounded-lg p-4 text-center">
                    <span class="text-2xl font-bold text-primary-400">{symbol}</span>
                  </div>
                {/each}
              </div>
            {/each}
          </div>
          
          <!-- Win Information -->
          {#if lastSpin.total_win > 0}
            <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
              <h3 class="text-lg font-semibold text-green-400 mb-2">🎉 You Won!</h3>
              <div class="text-2xl font-bold text-green-400 mb-2">
                ${lastSpin.total_win.toFixed(2)}
              </div>
              
              {#if lastSpin.wins.length > 0}
                <div class="space-y-1">
                  {#each lastSpin.wins as win}
                    <div class="text-sm text-green-300">
                      {win.symbol} x{win.kind} = ${win.win.toFixed(2)}
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {:else}
            <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
              <div class="text-red-400">No win this time. Try again!</div>
            </div>
          {/if}
        {:else}
          <!-- Empty Board -->
          <div class="grid grid-cols-5 gap-2 mb-6">
            {#each Array(5) as _, reelIndex}
              <div class="space-y-2">
                {#each Array(3) as _, symbolIndex}
                  <div class="bg-gray-800 border-2 border-gray-600 rounded-lg p-4 text-center">
                    <span class="text-2xl text-gray-500">?</span>
                  </div>
                {/each}
              </div>
            {/each}
          </div>
          
          <div class="text-center text-gray-400">
            {#if !apiConnected}
              <p>Math API not connected. Start the Python backend to play!</p>
            {:else}
              <p>Click "Spin" to start playing!</p>
            {/if}
          </div>
        {/if}
      </Card>
    </div>
  </div>
</div>
