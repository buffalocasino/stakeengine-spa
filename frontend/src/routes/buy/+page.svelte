<script lang="ts">
  import { 
    Card, 
    Button, 
    Modal, 
    Label, 
    Input, 
    Select, 
    Badge,
    Alert
  } from 'flowbite-svelte';
  import { 
    CreditCardSolid, 
    ExclamationCircleOutline,
    CheckCircleSolid 
  } from 'flowbite-svelte-icons';

  let checkoutModal = false;
  let selectedPackage = '';
  let processing = false;
  let success = false;
  let error = '';

  const packages = [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 100,
      price: 9.99,
      description: 'Perfect for getting started',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      credits: 500,
      price: 39.99,
      description: 'Best value for regular players',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium Pack',
      credits: 1000,
      price: 69.99,
      description: 'Maximum credits for serious gamers',
      popular: false
    }
  ];

  function openCheckout(packageId: string) {
    selectedPackage = packageId;
    checkoutModal = true;
    success = false;
    error = '';
  }

  async function processPayment() {
    processing = true;
    error = '';

    try {
      // Simulate BreezePay integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Create payment intent with BreezePay
      // 2. Handle payment confirmation
      // 3. Update user credits
      
      success = true;
      processing = false;
      
      // Close modal after success
      setTimeout(() => {
        checkoutModal = false;
        success = false;
      }, 2000);
      
    } catch (err) {
      error = 'Payment failed. Please try again.';
      processing = false;
    }
  }

  $: selectedPkg = packages.find(p => p.id === selectedPackage);
</script>

<div class="max-w-6xl mx-auto">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buy Credits</h1>
    <p class="text-gray-600 dark:text-gray-400">Purchase credits to play games and unlock features</p>
  </div>

  <!-- Package Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {#each packages as pkg}
      <Card class="relative">
        {#if pkg.popular}
          <Badge class="absolute -top-2 left-1/2 transform -translate-x-1/2" color="blue">
            Most Popular
          </Badge>
        {/if}
        
        <div class="text-center p-6">
          <h3 class="text-xl font-semibold mb-2">{pkg.name}</h3>
          <div class="text-3xl font-bold text-primary-600 mb-2">
            ${pkg.price}
          </div>
          <div class="text-gray-600 dark:text-gray-400 mb-4">
            {pkg.credits} Credits
          </div>
          <p class="text-sm text-gray-500 mb-6">{pkg.description}</p>
          
          <Button 
            color="primary" 
            class="w-full"
            onclick={() => openCheckout(pkg.id)}
          >
            <CreditCardSolid class="w-4 h-4 mr-2" />
            Purchase Now
          </Button>
        </div>
      </Card>
    {/each}
  </div>

  <!-- Features List -->
  <Card class="bg-gray-800 border-gray-700">
    <h2 class="text-xl font-semibold mb-4 text-primary-500">What you get with credits:</h2>
    <ul class="space-y-2 text-gray-300">
      <li class="flex items-center">
        <CheckCircleSolid class="w-5 h-5 text-green-500 mr-2" />
        Access to premium games
      </li>
      <li class="flex items-center">
        <CheckCircleSolid class="w-5 h-5 text-green-500 mr-2" />
        Higher betting limits
      </li>
      <li class="flex items-center">
        <CheckCircleSolid class="w-5 h-5 text-green-500 mr-2" />
        Exclusive tournaments
      </li>
      <li class="flex items-center">
        <CheckCircleSolid class="w-5 h-5 text-green-500 mr-2" />
        Priority customer support
      </li>
    </ul>
  </Card>
</div>

<!-- Checkout Modal -->
<Modal bind:open={checkoutModal} size="md" autoclose={false}>
  <div class="text-center">
    <CreditCardSolid class="mx-auto mb-4 text-gray-400 w-12 h-12" />
    <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
      Complete your purchase
    </h3>
  </div>

  {#if selectedPkg}
    <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="flex justify-between items-center">
        <div>
          <h4 class="font-semibold">{selectedPkg.name}</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">{selectedPkg.credits} Credits</p>
        </div>
        <div class="text-xl font-bold">${selectedPkg.price}</div>
      </div>
    </div>
  {/if}

  {#if success}
    <Alert color="green" class="mb-4">
      <CheckCircleSolid slot="icon" class="w-4 h-4" />
      Payment successful! Credits have been added to your account.
    </Alert>
  {:else if error}
    <Alert color="red" class="mb-4">
      <ExclamationCircleOutline slot="icon" class="w-4 h-4" />
      {error}
    </Alert>
  {:else}
    <form on:submit|preventDefault={processPayment} class="space-y-4">
      <div>
        <Label for="email" class="mb-2">Email</Label>
        <Input type="email" id="email" placeholder="your@email.com" required />
      </div>
      
      <div>
        <Label for="payment-method" class="mb-2">Payment Method</Label>
        <Select id="payment-method" required>
          <option value="">Select payment method</option>
          <option value="card">Credit/Debit Card</option>
          <option value="paypal">PayPal</option>
          <option value="crypto">Cryptocurrency</option>
        </Select>
      </div>

      <div class="flex justify-center space-x-4 pt-4">
        <Button color="alternative" onclick={() => (checkoutModal = false)}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          color="primary"
          disabled={processing}
          class="min-w-[120px]"
        >
          {#if processing}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          {:else}
            Pay ${selectedPkg?.price}
          {/if}
        </Button>
      </div>
    </form>
  {/if}
</Modal>
