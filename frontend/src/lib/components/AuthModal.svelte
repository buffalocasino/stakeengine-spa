<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { authApi } from '$lib/stores/auth';
  import { Modal, Card, Input, Label, Alert, Spinner, Tabs, TabItem } from 'flowbite-svelte';
  import { Button } from 'flowbite-svelte';
  import { EnvelopeSolid, EyeSlashOutline, EyeOutline, UserSolid } from 'flowbite-svelte-icons';
  
  export let open = false;
  
  const dispatch = createEventDispatcher();
  
  let activeTab = 'login';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let fullName = '';
  let error: string | null = null;
  let loading = false;
  let showPassword = false;
  let showConfirmPassword = false;
  
  function resetForm() {
    email = '';
    password = '';
    confirmPassword = '';
    fullName = '';
    error = null;
    loading = false;
    showPassword = false;
    showConfirmPassword = false;
  }
  
  function closeModal() {
    open = false;
    resetForm();
    dispatch('close');
  }
  
  async function handleLogin() {
    if (!email || !password) {
      error = 'Please fill in all fields';
      return;
    }
    
    loading = true;
    error = null;
    
    try {
      await authApi.login(email, password);
      closeModal();
      dispatch('success', { type: 'login' });
    } catch (err: any) {
      error = err.message;
    }
    
    loading = false;
  }
  
  async function handleSignup() {
    if (!email || !password || !confirmPassword || !fullName) {
      error = 'Please fill in all fields';
      return;
    }
    
    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }
    
    if (password.length < 6) {
      error = 'Password must be at least 6 characters';
      return;
    }
    
    loading = true;
    error = null;
    
    try {
      await authApi.signup(email, password, fullName);
      closeModal();
      dispatch('success', { type: 'signup' });
    } catch (err: any) {
      error = err.message;
    }
    
    loading = false;
  }
  
  function switchTab(tab: string) {
    activeTab = tab;
    error = null;
  }
</script>

<Modal bind:open size="md" autoclose={false} class="w-full">
  <div class="p-6">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Welcome to StakeEngine
      </h2>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Sign in or create an account to start playing
      </p>
    </div>
    
    <Tabs style="underline">
      <TabItem open title="Sign In">
        <form on:submit|preventDefault={handleLogin} class="space-y-4">
          {#if error}
            <Alert color="red" dismissable>
              <span class="font-medium">Error!</span> {error}
            </Alert>
          {/if}
          
          <div>
            <Label for="login-email" class="mb-2">Email address</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              bind:value={email}
              required
              disabled={loading}
              autocomplete="email"
            />
          </div>
          
          <div>
            <Label for="login-password" class="mb-2">Password</Label>
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              bind:value={password}
              required
              disabled={loading}
              autocomplete="current-password"
            />
          </div>
          
          <div class="flex gap-3">
            <button
              type="submit"
              class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {#if loading}
                <Spinner class="mr-3" size="4" />
                Signing in...
              {:else}
                Sign in
              {/if}
            </button>
            <button
              type="button"
              on:click={closeModal}
              class="px-6 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </TabItem>
      
      <TabItem title="Sign Up">
        <form on:submit|preventDefault={handleSignup} class="space-y-4">
          {#if error}
            <Alert color="red" dismissable>
              <span class="font-medium">Error!</span> {error}
            </Alert>
          {/if}
          
          <div>
            <Label for="signup-name" class="mb-2">Full Name</Label>
            <Input
              id="signup-name"
              type="text"
              placeholder="Enter your full name"
              bind:value={fullName}
              required
              disabled={loading}
              autocomplete="name"
            />
          </div>
          
          <div>
            <Label for="signup-email" class="mb-2">Email address</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="Enter your email"
              bind:value={email}
              required
              disabled={loading}
              autocomplete="email"
            />
          </div>
          
          <div>
            <Label for="signup-password" class="mb-2">Password</Label>
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              bind:value={password}
              required
              disabled={loading}
              autocomplete="new-password"
            />
          </div>
          
          <div>
            <Label for="signup-confirm-password" class="mb-2">Confirm Password</Label>
            <Input
              id="signup-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              bind:value={confirmPassword}
              required
              disabled={loading}
              autocomplete="new-password"
            />
          </div>
          
          <div class="flex gap-3">
            <button
              type="submit"
              class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {#if loading}
                <Spinner class="mr-3" size="4" />
                Creating account...
              {:else}
                Create account
              {/if}
            </button>
            <button
              type="button"
              on:click={closeModal}
              class="px-6 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </TabItem>
    </Tabs>
  </div>
</Modal>
