<script lang="ts">
  import { supabase } from "$lib/supabaseClient";
  import { onMount } from "svelte";

  interface ConfigFile {
    name: string;
    content: Record<string, unknown> | { error: string };
  }

  let configs: ConfigFile[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    const { data: files, error: err } = await supabase
      .storage
      .from("configs")
      .list();

    if (err) {
      error = err.message;
      loading = false;
      return;
    }

    if (!files) {
      error = "No configs found.";
      loading = false;
      return;
    }

    try {
      configs = await Promise.all(
        files.map(async (f) => {
          const { data: url } = supabase.storage
            .from("configs")
            .getPublicUrl(f.name);

          if (!url?.publicUrl) {
            return { name: f.name, content: { error: "Missing public URL" } };
          }

          try {
            const res = await fetch(url.publicUrl);
            const json = await res.json();
            return { name: f.name, content: json };
          } catch {
            return { name: f.name, content: { error: "Could not fetch config" } };
          }
        })
      );
    } catch (e) {
      error = e instanceof Error ? e.message : "Unexpected error";
    } finally {
      loading = false;
    }
  });
</script>

<h1 class="text-2xl font-bold mb-4">Games</h1>

{#if loading}
  <p class="text-gray-300">Loading configs...</p>
{:else if error}
  <p class="text-red-400">Error: {error}</p>
{:else}
  <h2 class="text-xl mb-4 text-primary-500">Available Configs</h2>
  <ul class="space-y-4">
    {#each configs as cfg}
      <li class="border border-gray-700 p-4 rounded-lg bg-gray-800">
        <h3 class="font-semibold text-primary-500 mb-2">{cfg.name}</h3>
        <pre class="text-sm text-gray-300 bg-charcoal-950 p-3 rounded overflow-x-auto">{JSON.stringify(cfg.content, null, 2)}</pre>
      </li>
    {/each}
  </ul>
{/if}
