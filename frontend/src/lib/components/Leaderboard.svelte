<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { user } from '$lib/stores/auth';
  import { get } from 'svelte/store';
  import { Card, Badge, Avatar, Tabs, TabItem } from 'flowbite-svelte';
  import { FireSolid, StarSolid } from 'flowbite-svelte-icons';

  export let gameId: string = '';
  
  let leaderboards: any[] = [];
  let loading = true;

  onMount(async () => {
    await loadLeaderboards();
    loading = false;
  });

  async function loadLeaderboards() {
    try {
      if (!browser) return;
      // For now, return empty array - leaderboard would need server endpoint
      leaderboards = [];
    } catch (error) {
      console.error('Error loading leaderboards:', error);
    }
  }

  function formatScore(score: number, metricType: string): string {
    switch (metricType) {
      case 'total_wagered':
      case 'total_won':
      case 'biggest_win':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(score);
      case 'total_spins':
        return score.toLocaleString();
      case 'rtp':
        return `${score.toFixed(1)}%`;
      default:
        return score.toString();
    }
  }

  function getRankIcon(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  }

  function getRankColor(rank: number): string {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-orange-400';
      default: return 'text-gray-500';
    }
  }
</script>

{#if !loading}
  <Card class="p-6 bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30">
    <h3 class="text-xl font-bold text-white mb-6 flex items-center">
      🏆
      Leaderboards
    </h3>

    <Tabs>
      {#each leaderboards as leaderboard, index}
        <TabItem open={index === 0} title={leaderboard.name}>
          <div class="space-y-3">
            {#each leaderboard.entries as entry, entryIndex}
              <div class="flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                <div class="flex items-center space-x-4">
                  <div class="text-2xl font-bold {getRankColor(entry.rank)} min-w-[3rem]">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <Avatar size="sm" class="bg-gradient-to-r from-purple-500 to-blue-500">
                    {(entry.users?.username || entry.users?.email || 'Anonymous').charAt(0).toUpperCase()}
                  </Avatar>
                  
                  <div>
                    <div class="font-semibold text-white">
                      {entry.users?.username || entry.users?.email?.split('@')[0] || 'Anonymous'}
                    </div>
                    <div class="text-sm text-gray-400">
                      {entry.leaderboards?.period_type} champion
                    </div>
                  </div>
                </div>
                
                <div class="text-right">
                  <div class="text-lg font-bold text-green-400">
                    {formatScore(entry.score, entry.leaderboards?.metric_type)}
                  </div>
                  <div class="text-xs text-gray-500">
                    {new Date(entry.period_start).toLocaleDateString()}
                  </div>
                </div>
              </div>
            {/each}
            
            {#if leaderboard.entries.length === 0}
              <div class="text-center text-gray-400 py-8">
                <div class="text-6xl mb-4 opacity-50">🏆</div>
                <p>No entries yet. Be the first to make the leaderboard!</p>
              </div>
            {/if}
          </div>
        </TabItem>
      {/each}
      
      {#if leaderboards.length === 0}
        <TabItem open title="Coming Soon">
          <div class="text-center text-gray-400 py-8">
            <div class="text-8xl mb-4 opacity-50">🏆</div>
            <h4 class="text-lg font-semibold mb-2">Leaderboards Coming Soon!</h4>
            <p>Start playing to be featured on our leaderboards when they go live.</p>
          </div>
        </TabItem>
      {/if}
    </Tabs>
  </Card>
{/if}
