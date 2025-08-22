<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { gameTrackingService, gameTracking } from '$lib/stores/gameTracking';
  import { Card, Badge, Progressbar } from 'flowbite-svelte';
  import { ArrowUpOutline, ArrowDownOutline, PlaySolid, ChartPieSolid } from 'flowbite-svelte-icons';

  export let gameId: string = '';
  
  let statistics: any[] = [];
  let recentPlays: any[] = [];
  let loading = true;
  
  $: trackingState = $gameTracking;
  $: sessionStats = {
    spins: trackingState.totalSpins,
    wagered: trackingState.totalWagered,
    won: trackingState.totalWon,
    netResult: trackingState.totalWon - trackingState.totalWagered
  };

  onMount(async () => {
    if ($user) {
      await loadStatistics();
    }
    loading = false;
  });

  async function loadStatistics() {
    if (!$user) return;
    
    try {
      const [stats, plays] = await Promise.all([
        gameTrackingService.getUserStatistics($user.id, gameId, 7), // Last 7 days
        gameTrackingService.getRecentPlays($user.id, 10) // Last 10 plays
      ]);
      
      statistics = stats || [];
      recentPlays = plays || [];
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString();
  }

  $: totalStats = statistics.reduce((acc, stat) => ({
    spins: acc.spins + stat.total_spins,
    wagered: acc.wagered + stat.total_wagered,
    won: acc.won + stat.total_won,
    netResult: acc.netResult + stat.net_result
  }), { spins: 0, wagered: 0, won: 0, netResult: 0 });
</script>

{#if $user && !loading}
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <!-- Session Statistics -->
    <Card class="p-4 bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/30">
      <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
        <PlaySolid class="w-5 h-5 mr-2" />
        Current Session
      </h3>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-400">{sessionStats.spins}</div>
          <div class="text-sm text-gray-400">Spins</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-400">{formatCurrency(sessionStats.wagered)}</div>
          <div class="text-sm text-gray-400">Wagered</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-yellow-400">{formatCurrency(sessionStats.won)}</div>
          <div class="text-sm text-gray-400">Won</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold {sessionStats.netResult >= 0 ? 'text-green-400' : 'text-red-400'}">
            {formatCurrency(sessionStats.netResult)}
          </div>
          <div class="text-sm text-gray-400">Net</div>
        </div>
      </div>
    </Card>

    <!-- Weekly Statistics -->
    <Card class="p-4 bg-gradient-to-br from-green-900/50 to-blue-900/50 border-green-500/30">
      <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
        <ChartPieSolid class="w-5 h-5 mr-2" />
        Last 7 Days
      </h3>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-400">{totalStats.spins}</div>
          <div class="text-sm text-gray-400">Total Spins</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-400">{formatCurrency(totalStats.wagered)}</div>
          <div class="text-sm text-gray-400">Total Wagered</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-yellow-400">{formatCurrency(totalStats.won)}</div>
          <div class="text-sm text-gray-400">Total Won</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold {totalStats.netResult >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center justify-center">
            {#if totalStats.netResult >= 0}
              <ArrowUpOutline class="w-5 h-5 mr-1" />
            {:else}
              <ArrowDownOutline class="w-5 h-5 mr-1" />
            {/if}
            {formatCurrency(totalStats.netResult)}
          </div>
          <div class="text-sm text-gray-400">Net Result</div>
        </div>
      </div>
    </Card>
  </div>

  <!-- Recent Plays -->
  {#if recentPlays.length > 0}
    <Card class="p-4 bg-gradient-to-br from-gray-900/50 to-blue-900/50 border-gray-500/30 mb-6">
      <h3 class="text-lg font-semibold text-white mb-4">Recent Plays</h3>
      
      <div class="space-y-2 max-h-48 overflow-y-auto">
        {#each recentPlays.slice(0, 5) as play}
          <div class="flex justify-between items-center p-2 bg-black/20 rounded">
            <div class="flex items-center space-x-3">
              <Badge color={play.win_amount > 0 ? 'green' : 'red'}>
                {play.win_amount > 0 ? 'WIN' : 'LOSS'}
              </Badge>
              <span class="text-sm text-gray-300">
                Bet: {formatCurrency(play.bet_amount)}
              </span>
              {#if play.win_amount > 0}
                <span class="text-sm text-green-400">
                  Won: {formatCurrency(play.win_amount)}
                </span>
              {/if}
            </div>
            <div class="text-xs text-gray-500">
              {formatTime(play.played_at)}
            </div>
          </div>
        {/each}
      </div>
    </Card>
  {/if}

  <!-- Daily Progress -->
  {#if statistics.length > 0}
    <Card class="p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30">
      <h3 class="text-lg font-semibold text-white mb-4">Daily Progress</h3>
      
      <div class="space-y-3">
        {#each statistics.slice(0, 3) as stat}
          {@const rtp = stat.total_wagered > 0 ? (stat.total_won / stat.total_wagered) * 100 : 0}
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-300">{new Date(stat.date).toLocaleDateString()}</span>
              <span class="text-gray-300">{stat.total_spins} spins</span>
            </div>
            <Progressbar 
              progress={Math.min(rtp, 150)} 
              color={rtp >= 100 ? 'green' : 'red'}
              class="h-2"
            />
            <div class="flex justify-between text-xs text-gray-500">
              <span>RTP: {rtp.toFixed(1)}%</span>
              <span>Net: {formatCurrency(stat.net_result)}</span>
            </div>
          </div>
        {/each}
      </div>
    </Card>
  {/if}
{:else if !$user}
  <Card class="p-4 bg-gradient-to-br from-gray-900/50 to-blue-900/50 border-gray-500/30">
    <div class="text-center text-gray-400">
      <p>Login to track your game statistics and wagering history</p>
    </div>
  </Card>
{/if}
