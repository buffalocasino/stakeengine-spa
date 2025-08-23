<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { user } from '$lib/stores/auth';
  import { get } from 'svelte/store';
  import { Card, Badge, Modal, Button, Progressbar } from 'flowbite-svelte';
  import { StarSolid, LockSolid, CheckCircleSolid } from 'flowbite-svelte-icons';

  let achievements: any[] = [];
  let userAchievements: any[] = [];
  let loading = true;
  let selectedAchievement: any = null;
  let showModal = false;

  onMount(async () => {
    if (get(user)) {
      await loadAchievements();
    }
    loading = false;
  });

  async function loadAchievements() {
    try {
      if (!browser) return;
      // For now, return empty array - achievements would need server endpoint
      achievements = [];
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  }

  async function claimAchievement(achievementId: number) {
    const currentUser = get(user);
    if (!currentUser || !browser) return;

    try {
      // For now, just add to local set - would need server endpoint
      userAchievements.add(achievementId);
      userAchievements = userAchievements; // Trigger reactivity
    } catch (error) {
      console.error('Error claiming achievement:', error);
    }
  }

  function getUserAchievement(achievementId: string) {
    return userAchievements.find(ua => ua.achievements.achievement_id === achievementId);
  }

  function isUnlocked(achievementId: string): boolean {
    const userAchievement = getUserAchievement(achievementId);
    return !!userAchievement;
  }

  function isClaimed(achievementId: string): boolean {
    const userAchievement = getUserAchievement(achievementId);
    return userAchievement?.is_claimed || false;
  }

  function getProgress(achievement: any): number {
    const userAchievement = getUserAchievement(achievement.achievement_id);
    if (!userAchievement) return 0;
    return Math.min((userAchievement.progress_value / achievement.requirement_value) * 100, 100);
  }

  function getCategoryColor(category: string): string {
    switch (category) {
      case 'spins': return 'blue';
      case 'wins': return 'green';
      case 'wagering': return 'purple';
      case 'streaks': return 'orange';
      case 'special': return 'pink';
      default: return 'gray';
    }
  }

  function openAchievementModal(achievement: any) {
    selectedAchievement = achievement;
    showModal = true;
  }

  $: unclaimedCount = userAchievements.filter(ua => !ua.is_claimed).length;
  $: totalUnlocked = userAchievements.length;
  $: completionRate = achievements.length > 0 ? (totalUnlocked / achievements.length) * 100 : 0;
</script>

{#if $user && !loading}
  <Card class="p-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/30">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold text-white flex items-center">
        <StarSolid class="w-6 h-6 mr-2" />
        Achievements
      </h3>
      <div class="text-right">
        <div class="text-2xl font-bold text-yellow-400">{totalUnlocked}/{achievements.length}</div>
        <div class="text-sm text-gray-400">Unlocked</div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mb-6">
      <div class="flex justify-between text-sm text-gray-300 mb-2">
        <span>Overall Progress</span>
        <span>{completionRate.toFixed(1)}%</span>
      </div>
      <Progressbar progress={completionRate} color="yellow" class="h-3" />
    </div>

    <!-- Unclaimed Achievements Alert -->
    {#if unclaimedCount > 0}
      <div class="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <StarSolid class="w-5 h-5 text-yellow-400 mr-2" />
          <span class="text-yellow-300">
            You have {unclaimedCount} unclaimed achievement{unclaimedCount !== 1 ? 's' : ''}!
          </span>
        </div>
      </div>
    {/if}

    <!-- Achievement Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {#each achievements as achievement}
        {@const unlocked = isUnlocked(achievement.achievement_id)}
        {@const claimed = isClaimed(achievement.achievement_id)}
        {@const progress = getProgress(achievement)}
        
        <button
          on:click={() => openAchievementModal(achievement)}
          class="relative p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105
                 {unlocked 
                   ? claimed 
                     ? 'bg-green-900/30 border-green-500/50 hover:border-green-400' 
                     : 'bg-yellow-900/30 border-yellow-500/50 hover:border-yellow-400 animate-pulse'
                   : 'bg-gray-900/30 border-gray-600/50 hover:border-gray-500'}"
        >
          <!-- Achievement Icon -->
          <div class="text-4xl mb-2 {unlocked ? '' : 'grayscale opacity-50'}">
            {achievement.icon}
          </div>
          
          <!-- Achievement Name -->
          <div class="text-sm font-semibold text-white mb-1 truncate">
            {achievement.name}
          </div>
          
          <!-- Category Badge -->
          <Badge color={getCategoryColor(achievement.category)} class="text-xs mb-2">
            {achievement.category}
          </Badge>
          
          <!-- Progress Bar (if not unlocked) -->
          {#if !unlocked && progress > 0}
            <div class="mt-2">
              <Progressbar progress={progress} color="blue" class="h-1" />
              <div class="text-xs text-gray-400 mt-1">
                {progress.toFixed(0)}%
              </div>
            </div>
          {/if}
          
          <!-- Status Icon -->
          <div class="absolute top-2 right-2">
            {#if claimed}
              <CheckCircleSolid class="w-5 h-5 text-green-400" />
            {:else if unlocked}
              <StarSolid class="w-5 h-5 text-yellow-400" />
            {:else}
              <LockSolid class="w-5 h-5 text-gray-500" />
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </Card>

  <!-- Achievement Detail Modal -->
  <Modal bind:open={showModal} size="md" class="bg-gray-900">
    {#if selectedAchievement}
      {@const unlocked = isUnlocked(selectedAchievement.achievement_id)}
      {@const claimed = isClaimed(selectedAchievement.achievement_id)}
      {@const userAchievement = getUserAchievement(selectedAchievement.achievement_id)}
      
      <div class="text-center">
        <div class="text-6xl mb-4 {unlocked ? '' : 'grayscale opacity-50'}">
          {selectedAchievement.icon}
        </div>
        
        <h3 class="text-2xl font-bold text-white mb-2">
          {selectedAchievement.name}
        </h3>
        
        <p class="text-gray-300 mb-4">
          {selectedAchievement.description}
        </p>
        
        <Badge color={getCategoryColor(selectedAchievement.category)} class="mb-4">
          {selectedAchievement.category.toUpperCase()}
        </Badge>
        
        {#if unlocked}
          <div class="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-4">
            <div class="text-green-400 font-semibold mb-2">
              🎉 Achievement Unlocked!
            </div>
            <div class="text-sm text-gray-300">
              Unlocked on {new Date(userAchievement.unlocked_at).toLocaleDateString()}
            </div>
          </div>
          
          {#if !claimed}
            <Button 
              color="yellow" 
              size="lg" 
              on:click={() => claimAchievement(selectedAchievement.id)}
              class="mb-4"
            >
              <StarSolid class="w-5 h-5 mr-2" />
              Claim Reward
            </Button>
          {:else}
            <div class="text-green-400 mb-4">
              <CheckCircleSolid class="w-6 h-6 mx-auto mb-2" />
              Reward Claimed
            </div>
          {/if}
        {:else}
          <div class="bg-gray-900/50 border border-gray-600/50 rounded-lg p-4 mb-4">
            <div class="text-gray-400 mb-2">
              Requirement: {selectedAchievement.requirement_value.toLocaleString()}
              {selectedAchievement.requirement_type === 'total' ? 'total' : ''}
            </div>
            {#if userAchievement}
              <div class="text-sm text-gray-500">
                Progress: {userAchievement.progress_value.toLocaleString()} / {selectedAchievement.requirement_value.toLocaleString()}
              </div>
              <Progressbar progress={getProgress(selectedAchievement)} color="blue" class="h-2 mt-2" />
            {:else}
              <div class="text-sm text-gray-500">
                Start playing to make progress!
              </div>
            {/if}
          </div>
        {/if}
        
        <Button color="alternative" on:click={() => showModal = false}>
          Close
        </Button>
      </div>
    {/if}
  </Modal>
{:else if !$user}
  <Card class="p-6 bg-gradient-to-br from-gray-900/50 to-blue-900/50 border-gray-500/30">
    <div class="text-center text-gray-400">
      <StarSolid class="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>Login to unlock and track achievements</p>
    </div>
  </Card>
{/if}
