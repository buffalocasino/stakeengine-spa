<script lang="ts">
  import { supabase } from "$lib/supabaseClient";
  import { onMount } from "svelte";

  let files: any[] = [];
  let loading = true;
  let error: string | null = null;
  let configs: Record<string, any> = {};

  // Fetch list of files in the "configs" bucket
  onMount(async () => {
    const { data, error: err } = await supabase
      .storage
      .from("configs")
      .list();

    if (err) {
      error = err.message;
      loading = false;
      return;
    }

    // For each file, fetch its contents
    for (const f of data) {
      const { data: url } = supabase.storage
        .from("configs")
        .getPublicUrl(f.name);

      try {
        const res = await fetch(url.publicUrl);
        configs[f.name] = await res.json();
      } catch (e) {
        configs[f.name] = { error: "Could not fetch config" };
      }
    }

    loading = false;
  });
</script>

<h1 class="text-2xl font-bold mb-4">Games</h1>

{#if loading}
  <p>Loading configs...</p>
{:else if error}
  <p class="text-red-500">Error: {error}</p>
{:else}
  <h2 class="text-xl mb-2">Available Configs</h2>
  <ul class="space-y-4">
    {#each Object.entries(configs) as [name, cfg]}
      <li class="border p-3 rounded bg-gray-50">
        <h3 class="font-semibold">{name}</h3>
        <pre class="text-sm">{JSON.stringify(cfg, null, 2)}</pre>
      </li>
    {/each}
  </ul>
{/if}
