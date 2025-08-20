<script lang="ts">
    import { supabase } from "$lib/supabaseClient";
    import { user } from "$lib/stores/auth";
    import { goto } from "$app/navigation";
    import { Card, Button, Input, Label, Alert, Spinner } from "flowbite-svelte";
    import { EnvelopeSolid, EyeSlashOutline, EyeOutline, UserSolid } from "flowbite-svelte-icons";
    
    let email = "";
    let password = "";
    let confirmPassword = "";
    let error: string | null = null;
    let success: string | null = null;
    let loading = false;
    let showPassword = false;
    let showConfirmPassword = false;
  
    async function register() {
      if (!email || !password || !confirmPassword) {
        error = "Please fill in all fields";
        return;
      }
      
      if (password !== confirmPassword) {
        error = "Passwords do not match";
        return;
      }
      
      if (password.length < 6) {
        error = "Password must be at least 6 characters long";
        return;
      }
      
      loading = true;
      error = null;
      success = null;
      
      const { error: err } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (err) {
        error = err.message;
      } else {
        success = "Registration successful! Please check your email to confirm your account.";
        // Clear form
        email = "";
        password = "";
        confirmPassword = "";
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
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Create your account</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Already have an account? 
          <a href="/login" class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
            Sign in here
          </a>
        </p>
      </div>
      
      <Card class="p-8">
        <form on:submit|preventDefault={register} class="space-y-6">
          {#if error}
            <Alert color="red" dismissable>
              <span class="font-medium">Error!</span> {error}
            </Alert>
          {/if}
          
          {#if success}
            <Alert color="green" dismissable>
              <span class="font-medium">Success!</span> {success}
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
            >
              <EnvelopeSolid slot="left" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
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
            >
              <button
                slot="right"
                type="button"
                on:click={() => showPassword = !showPassword}
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {#if showPassword}
                  <EyeSlashOutline class="w-4 h-4" />
                {:else}
                  <EyeOutline class="w-4 h-4" />
                {/if}
              </button>
            </Input>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Password must be at least 6 characters long
            </p>
          </div>
          
          <div>
            <Label for="confirmPassword" class="mb-2">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              bind:value={confirmPassword}
              required
              disabled={loading}
            >
              <button
                slot="right"
                type="button"
                on:click={() => showConfirmPassword = !showConfirmPassword}
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {#if showConfirmPassword}
                  <EyeSlashOutline class="w-4 h-4" />
                {:else}
                  <EyeOutline class="w-4 h-4" />
                {/if}
              </button>
            </Input>
          </div>
          
          <Button
            type="submit"
            class="w-full"
            disabled={loading}
            color="primary"
          >
            {#if loading}
              <Spinner class="mr-3" size="4" color="white" />
              Creating account...
            {:else}
              <UserSolid class="mr-2 w-4 h-4" />
              Create account
            {/if}
          </Button>
        </form>
      </Card>
    </div>
  </div>
