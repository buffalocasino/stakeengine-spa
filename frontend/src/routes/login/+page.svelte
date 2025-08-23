<script lang="ts">
    import { authApi } from '$lib/stores/auth';
    import { user } from "$lib/stores/auth";
    import { goto } from "$app/navigation";
    import { Card, Button, Input, Label, Alert, Spinner } from "flowbite-svelte";
    import { EnvelopeSolid, EyeSlashOutline, EyeOutline } from "flowbite-svelte-icons";
    
    let email = "";
    let password = "";
    let error: string | null = null;
    let loading = false;
    let showPassword = false;
  
    async function login() {
      if (!email || !password) {
        error = "Please fill in all fields";
        return;
      }
      
      loading = true;
      error = null;
      
      try {
        await authApi.login(email, password);
        goto("/");
      } catch (err: any) {
        error = err.message;
      }
      
      loading = false;
    }
    
    // Redirect if already logged in
    $: if ($user) {
      goto("/");
    }
  </script>
  
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Sign in to BuffaloCasino</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Don't have an account? 
          <a href="/register" class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
            Sign up here
          </a>
        </p>
      </div>
      
      <Card class="p-8">
        <form on:submit|preventDefault={login} class="space-y-6">
          {#if error}
            <Alert color="red" dismissable>
              <span class="font-medium">Error!</span> {error}
            </Alert>
          {/if}
          
          <div>
            <Label for="email" class="mb-2">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              bind:value={email}
              required
              disabled={loading}
              autocomplete="email"
            >
              <svelte:fragment slot="left">
                <EnvelopeSolid class="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </svelte:fragment>
            </Input>
          </div>
          
          <div>
            <Label for="password" class="mb-2">Password</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              bind:value={password}
              required
              disabled={loading}
              autocomplete="current-password"
            >
              <svelte:fragment slot="right">
                <button
                  type="button"
                  on:click={() => showPassword = !showPassword}
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {#if showPassword}
                  <EyeSlashOutline class="w-4 h-4" />
                {:else}
                  <EyeOutline class="w-4 h-4" />
                {/if}
                {showPassword ? "Hide" : "Show"}
              </button>
              </svelte:fragment>
            </Input>
          </div>
          
          <Button
            type="submit"
            class="w-full"
            disabled={loading}
            color="primary"
          >
            {#if loading}
              <Spinner class="mr-3" size="4" />
              Signing in...
            {:else}
              Sign in
            {/if}
          </Button>
        </form>
      </Card>
    </div>
  </div>
  