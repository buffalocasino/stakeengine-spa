<script lang="ts">
  import { user, loading } from '$lib/stores/auth';
  import { supabase } from '$lib/supabaseClient';
  import { Card, Button, Input, Label, Alert, Spinner } from 'flowbite-svelte';
  import { UserCircleSolid, PenSolid } from 'flowbite-svelte-icons';
  import { onMount } from 'svelte';

  let userStats = {
    credits: 1250,
    gamesPlayed: 47,
    totalWinnings: 2847.50,
    lastLogin: new Date().toLocaleDateString()
  };

  let editMode = false;
  let displayName = '';
  let updateError: string | null = null;
  let updateSuccess = false;

  onMount(() => {
    if ($user?.user_metadata?.display_name) {
      displayName = $user.user_metadata.display_name;
    }
  });

  async function updateProfile() {
    if (!$user) return;
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });
      
      if (error) {
        updateError = error.message;
      } else {
        updateSuccess = true;
        editMode = false;
        setTimeout(() => updateSuccess = false, 3000);
      }
    } catch (err) {
      updateError = err instanceof Error ? err.message : 'Update failed';
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<div class="max-w-4xl mx-auto">
  <h1 class="text-3xl font-bold text-white mb-4">Profile</h1>
  <p class="text-gray-300 mb-8">Manage your profile settings and information here.</p>
  
  {#if $loading}
    <div class="flex justify-center py-8">
      <Spinner size="8" />
    </div>
  {:else if !$user}
    <Alert color="red">
      <span class="font-medium">Not authenticated!</span> Please log in to view your profile.
    </Alert>
  {:else}
    {#if updateSuccess}
      <Alert color="green" class="mb-6">
        <span class="font-medium">Success!</span> Profile updated successfully.
      </Alert>
    {/if}

    {#if updateError}
      <Alert color="red" class="mb-6">
        <span class="font-medium">Error!</span> {updateError}
      </Alert>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Information -->
      <div class="lg:col-span-2">
        <Card class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-primary-500 font-semibold text-lg">Account Information</h3>
            <Button
              size="sm"
              color="alternative"
              on:click={() => editMode = !editMode}
            >
              <PenSolid class="w-4 h-4 mr-2" />
              {editMode ? 'Cancel' : 'Edit'}
            </Button>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center space-x-4 mb-6">
              <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                <UserCircleSolid class="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <h4 class="text-xl font-semibold text-white">
                  {displayName || $user.email?.split('@')[0] || 'User'}
                </h4>
                <p class="text-gray-400">{$user.email}</p>
              </div>
            </div>

            {#if editMode}
              <div class="space-y-4">
                <div>
                  <Label for="displayName" class="mb-2">Display Name</Label>
                  <Input
                    id="displayName"
                    bind:value={displayName}
                    placeholder="Enter display name"
                  />
                </div>
                <div class="flex space-x-2">
                  <Button on:click={updateProfile} color="primary">
                    Save Changes
                  </Button>
                  <Button on:click={() => editMode = false} color="alternative">
                    Cancel
                  </Button>
                </div>
              </div>
            {:else}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span class="text-gray-400 text-sm block">Email</span>
                  <p class="text-white">{$user.email}</p>
                </div>
                <div>
                  <span class="text-gray-400 text-sm block">Member Since</span>
                  <p class="text-white">{formatDate($user.created_at)}</p>
                </div>
                <div>
                  <span class="text-gray-400 text-sm block">Last Login</span>
                  <p class="text-white">{formatDate($user.last_sign_in_at || $user.created_at)}</p>
                </div>
                <div>
                  <span class="text-gray-400 text-sm block">Account Status</span>
                  <p class="text-green-400 font-semibold">Active</p>
                </div>
              </div>
            {/if}
          </div>
        </Card>
      </div>

      <!-- Account Stats -->
      <div class="space-y-6">
        <Card class="p-6">
          <h3 class="text-primary-500 font-semibold text-lg mb-4">Account Stats</h3>
          <div class="space-y-4">
            <div>
              <span class="text-gray-400 text-sm block">Current Credits</span>
              <p class="text-white font-bold text-xl">{userStats.credits.toLocaleString()}</p>
            </div>
            <div>
              <span class="text-gray-400 text-sm block">Games Played</span>
              <p class="text-white font-semibold">{userStats.gamesPlayed}</p>
            </div>
            <div>
              <span class="text-gray-400 text-sm block">Total Winnings</span>
              <p class="text-green-400 font-bold">${userStats.totalWinnings.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <h3 class="text-primary-500 font-semibold text-lg mb-4">Quick Actions</h3>
          <div class="space-y-2">
            <Button href="/vault" class="w-full" color="primary">
              View Vault
            </Button>
            <Button href="/games" class="w-full" color="alternative">
              Play Games
            </Button>
            <Button href="/buy" class="w-full" color="alternative">
              Buy Credits
            </Button>
          </div>
        </Card>
      </div>
    </div>
  {/if}
</div>