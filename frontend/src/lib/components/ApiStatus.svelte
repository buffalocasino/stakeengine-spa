<script lang="ts">
  import { apiConnection, checkApiConnection } from '$lib/stores/api';
  import { Alert, Button, Spinner } from 'flowbite-svelte';
  import { RefreshOutline, CheckCircleSolid, ExclamationCircleSolid } from 'flowbite-svelte-icons';

  $: ({ connected, loading, error, lastChecked } = $apiConnection);

  function handleRefresh() {
    checkApiConnection();
  }
</script>

<div class="mb-4">
  {#if loading}
    <Alert color="blue" class="flex items-center">
      <Spinner class="mr-3" size="4" />
      <span>Checking API connection...</span>
    </Alert>
  {:else if connected}
    <Alert color="green" class="flex items-center justify-between">
      <div class="flex items-center">
        <CheckCircleSolid class="mr-3 w-5 h-5" />
        <span>Math API Connected</span>
        {#if lastChecked}
          <span class="ml-2 text-sm opacity-75">
            (Last checked: {lastChecked.toLocaleTimeString()})
          </span>
        {/if}
      </div>
      <Button size="xs" color="alternative" on:click={handleRefresh}>
        <RefreshOutline class="w-3 h-3" />
      </Button>
    </Alert>
  {:else}
    <Alert color="red" class="flex items-center justify-between">
      <div class="flex items-center">
        <ExclamationCircleSolid class="mr-3 w-5 h-5" />
        <div>
          <div>Math API Disconnected</div>
          {#if error}
            <div class="text-sm opacity-75">{error}</div>
          {/if}
        </div>
      </div>
      <Button size="xs" color="alternative" on:click={handleRefresh}>
        <RefreshOutline class="w-3 h-3" />
      </Button>
    </Alert>
  {/if}
</div>
