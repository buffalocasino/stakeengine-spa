<script lang="ts">
  import { onMount } from "svelte";
  import { 
    Button, Card, Input, Label, Alert, Spinner, Carousel,
    Badge, Avatar, Timeline, TimelineItem, Tabs, TabItem, Rating,
    Toast, Breadcrumb, BreadcrumbItem, Progressbar
  } from "flowbite-svelte";
  import { 
    PlaySolid, CogSolid, FireSolid, StarSolid, ClockSolid,
    UsersGroupSolid, HomeSolid, CartSolid
  } from "flowbite-svelte-icons";
  import { mathApi, type GameConfig, type SpinResult } from "$lib/api/mathApi";

  let gameConfig: GameConfig | null = null;
  let betAmount = 1.0;
  let balance = 1000.0;
  let lastSpin: SpinResult | null = null;
  let loading = false;
  let error: string | null = null;
  let apiConnected = false;
  let activeTab = 'featured';

  // Featured games data for carousel
  const featuredGames = [
    {
      id: 'mythical-dragons',
      name: 'Mythical Dragons',
      emoji: '🐉',
      description: 'Legendary wins await in the dragon\'s lair',
      rtp: '96%',
      volatility: 'High',
      jackpot: '$50,000',
      players: 1247,
      gradient: 'from-purple-900/80 to-blue-900/80',
      borderColor: 'border-purple-500/50'
    },
    {
      id: 'phoenix-rising',
      name: 'Phoenix Rising',
      emoji: '🔥',
      description: 'Rise from the ashes with fiery wins',
      rtp: '97%',
      volatility: 'Medium',
      jackpot: '$25,000',
      players: 892,
      gradient: 'from-orange-900/80 to-red-900/80',
      borderColor: 'border-orange-500/50'
    },
    {
      id: 'treasure-quest',
      name: 'Treasure Quest',
      emoji: '💎',
      description: 'Embark on an adventure for hidden treasures',
      rtp: '95%',
      volatility: 'Medium',
      jackpot: '$75,000',
      players: 2156,
      gradient: 'from-emerald-900/80 to-teal-900/80',
      borderColor: 'border-emerald-500/50'
    },
    {
      id: 'royal-crown',
      name: 'Royal Crown',
      emoji: '👑',
      description: 'Rule the kingdom with royal rewards',
      rtp: '98%',
      volatility: 'Low',
      jackpot: '$100,000',
      players: 3421,
      gradient: 'from-yellow-900/80 to-amber-900/80',
      borderColor: 'border-yellow-500/50'
    }
  ];

  // Recent winners data
  const recentWinners = [
    { name: 'DragonSlayer99', game: 'Mythical Dragons', amount: 2847.50, time: '2 min ago' },
    { name: 'LuckyPhoenix', game: 'Phoenix Rising', amount: 1250.00, time: '5 min ago' },
    { name: 'TreasureHunter', game: 'Treasure Quest', amount: 5420.75, time: '8 min ago' },
    { name: 'RoyalFlush', game: 'Royal Crown', amount: 892.25, time: '12 min ago' }
  ];

  // Game categories
  const gameCategories = [
    { name: 'Slots', count: 24, icon: '🎰' },
    { name: 'Table Games', count: 12, icon: '🃏' },
    { name: 'Live Casino', count: 8, icon: '🎲' },
    { name: 'Jackpots', count: 6, icon: '💰' }
  ];

  onMount(async () => {
    // Check API connection and load default config
    try {
      await mathApi.healthCheck();
      apiConnected = true;
      gameConfig = await mathApi.getDefaultConfig();
    } catch (e) {
      error = `Math API not available: ${e instanceof Error ? e.message : 'Unknown error'}. Make sure the Python backend is running on port 8000.`;
      apiConnected = false;
    }
  });

  async function spin() {
    if (!gameConfig || betAmount > balance) return;
    
    loading = true;
    error = null;
    
    try {
      const result = await mathApi.spin({
        bet_amount: betAmount,
        game_config: gameConfig
      });
      
      lastSpin = result;
      balance -= betAmount;
      balance += result.total_win;
    } catch (e) {
      error = `Spin failed: ${e instanceof Error ? e.message : 'Unknown error'}`;
    } finally {
      loading = false;
    }
  }

  async function runSimulation() {
    if (!gameConfig) return;
    
    loading = true;
    error = null;
    
    try {
      const result = await mathApi.simulate({
        game_config: gameConfig,
        num_spins: 1000,
        bet_amount: betAmount
      });
      
      alert(`Simulation Results:\n` +
            `Spins: ${result.total_spins}\n` +
            `Total Bet: $${result.total_bet?.toFixed(2) || '0.00'}\n` +
            `Total Win: $${result.total_win?.toFixed(2) || '0.00'}\n` +
            `Actual RTP: ${(result.actual_rtp * 100)?.toFixed(2) || '0.00'}%\n` +
            `Hit Frequency: ${(result.hit_frequency * 100)?.toFixed(2) || '0.00'}%`);
    } catch (e) {
      error = `Simulation failed: ${e instanceof Error ? e.message : 'Unknown error'}`;
    } finally {
      loading = false;
    }
  }
</script>

<div class="max-w-7xl mx-auto">
  <!-- Breadcrumb -->
  <Breadcrumb class="mb-6">
    <BreadcrumbItem href="/" home>
      <HomeSolid class="w-4 h-4 mr-2" />
      Home
    </BreadcrumbItem>
    <BreadcrumbItem>
      <PlaySolid class="w-4 h-4 mr-2" />
      Games
    </BreadcrumbItem>
  </Breadcrumb>

  <!-- Hero Section -->
  <div class="text-center mb-8">
    <h1 class="text-5xl font-bold text-white mb-4">🎰 BuffaloCasino Games</h1>
    <p class="text-xl text-gray-300 mb-6">Experience the thrill of premium casino gaming</p>
    <div class="flex justify-center space-x-8 text-center">
      <div>
        <div class="text-3xl font-bold text-green-400">50+</div>
        <div class="text-gray-400 text-sm">Games</div>
      </div>
      <div>
        <div class="text-3xl font-bold text-blue-400">$2.5M+</div>
        <div class="text-gray-400 text-sm">Jackpots</div>
      </div>
      <div>
        <div class="text-3xl font-bold text-purple-400">98%</div>
        <div class="text-gray-400 text-sm">Max RTP</div>
      </div>
      <div>
        <div class="text-3xl font-bold text-yellow-400">24/7</div>
        <div class="text-gray-400 text-sm">Support</div>
      </div>
    </div>
  </div>
  
  {#if error}
    <Alert color="red" class="mb-6">
      <span class="font-medium">Connection Error!</span> {error}
    </Alert>
  {/if}

  <!-- Featured Games Carousel -->
  <div class="mb-12">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold text-white flex items-center">
        <FireSolid class="w-8 h-8 mr-3 text-orange-500" />
        Featured Games
      </h2>
      <Badge color="red" class="animate-pulse">
        <FireSolid class="w-3 h-3 mr-1" />
        Hot
      </Badge>
    </div>
    
    <!-- Featured Games Grid (Simplified) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each featuredGames as game}
        <Card class="p-6 bg-gradient-to-br {game.gradient} border-2 {game.borderColor} hover:border-opacity-100 transition-all duration-500 transform hover:scale-105">
          <div class="text-center">
            <div class="text-6xl mb-4">{game.emoji}</div>
            <h3 class="text-xl font-bold text-white mb-2">{game.name}</h3>
            <p class="text-gray-300 text-sm mb-4">{game.description}</p>
            
            <div class="grid grid-cols-2 gap-2 mb-4 text-xs">
              <div class="bg-black/30 rounded p-2">
                <div class="text-green-400 font-bold">{game.rtp}</div>
                <div class="text-gray-400">RTP</div>
              </div>
              <div class="bg-black/30 rounded p-2">
                <div class="text-yellow-400 font-bold">{game.volatility}</div>
                <div class="text-gray-400">Volatility</div>
              </div>
            </div>
            
            <div class="mb-4">
              <div class="text-purple-400 font-bold text-lg">{game.jackpot}</div>
              <div class="text-gray-400 text-xs">Max Win</div>
            </div>
            
            <Button 
              href={game.id === 'mythical-dragons' ? '/games/mythical-dragons' : '#'} 
              class="w-full" 
              color="primary"
              size="sm"
              disabled={game.id !== 'mythical-dragons'}
            >
              {#if game.id === 'mythical-dragons'}
                <PlaySolid class="mr-2 w-4 h-4" />
                Play Now
              {:else}
                Coming Soon
              {/if}
            </Button>
          </div>
        </Card>
      {/each}
    </div>
  </div>

  <!-- Game Categories -->
  <div class="mb-12">
    <h2 class="text-3xl font-bold text-white mb-6 flex items-center">
      <CartSolid class="w-8 h-8 mr-3 text-blue-500" />
      Game Categories
    </h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      {#each gameCategories as category}
        <Card class="p-6 text-center hover:bg-gray-800/50 transition-all duration-300 cursor-pointer">
          <div class="text-5xl mb-4">{category.icon}</div>
          <h3 class="text-xl font-bold text-white mb-2">{category.name}</h3>
          <Badge color="blue">{category.count} Games</Badge>
        </Card>
      {/each}
    </div>
  </div>

  <!-- Recent Winners & Live Activity -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
    <!-- Recent Winners -->
    <Card class="p-6">
      <h3 class="text-2xl font-bold text-white mb-6 flex items-center">
        <StarSolid class="w-6 h-6 mr-3 text-yellow-500" />
        Recent Winners
      </h3>
      <Timeline>
        {#each recentWinners as winner}
          <TimelineItem title={winner.name} date={winner.time}>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <Avatar size="sm" class="bg-gradient-to-r from-purple-500 to-blue-500">
                  {winner.name.charAt(0)}
                </Avatar>
                <div>
                  <div class="font-semibold text-white">{winner.name}</div>
                  <div class="text-sm text-gray-400">{winner.game}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold text-green-400">${winner.amount?.toFixed(2) || '0.00'}</div>
                <div class="text-xs text-gray-500">{winner.time}</div>
              </div>
            </div>
          </TimelineItem>
        {/each}
      </Timeline>
    </Card>

    <!-- Live Statistics -->
    <Card class="p-6">
      <h3 class="text-2xl font-bold text-white mb-6 flex items-center">
        <UsersGroupSolid class="w-6 h-6 mr-3 text-green-500" />
        Live Statistics
      </h3>
      <div class="space-y-6">
        <div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-300">Players Online</span>
            <span class="text-white font-bold">2,847</span>
          </div>
          <Progressbar progress={85} color="green" />
        </div>
        
        <div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-300">Games Active</span>
            <span class="text-white font-bold">1,234</span>
          </div>
          <Progressbar progress={62} color="blue" />
        </div>
        
        <div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-300">Jackpot Pool</span>
            <span class="text-white font-bold">$2,547,892</span>
          </div>
          <Progressbar progress={78} color="purple" />
        </div>
        
        <div class="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-lg p-4 border border-yellow-500/30">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-yellow-400 font-bold text-lg">Biggest Win Today</div>
              <div class="text-gray-300">Royal Crown - DragonMaster</div>
            </div>
            <div class="text-2xl font-bold text-yellow-400">$47,892</div>
          </div>
        </div>
      </div>
    </Card>
  </div>

  <!-- Game Testing Area -->
  <Tabs class="mb-8">
    <TabItem open value="featured" title="🎮 Play Games">
      <div class="text-center py-8">
        <h3 class="text-2xl font-bold text-white mb-4">Ready to Play?</h3>
        <p class="text-gray-400 mb-6">Choose from our featured games above or explore all categories</p>
        <Button href="/games/mythical-dragons" size="lg" color="primary">
          <PlaySolid class="mr-2 w-5 h-5" />
          Start with Mythical Dragons
        </Button>
      </div>
    </TabItem>
    
    <TabItem value="testing" title="🔧 Game Testing">
      <div class="mb-6">
        <h3 class="text-2xl font-bold text-white mb-4">Math Engine Testing</h3>
        <p class="text-gray-400 mb-4">Test the game mechanics and math engine below</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Game Controls -->
        <div class="lg:col-span-1">
          <Card class="p-6">
            <h2 class="text-xl font-semibold text-white mb-4">Test Controls</h2>
            
            <div class="space-y-4">
              <div>
                <Label for="balance" class="mb-2">Balance</Label>
                <div class="text-2xl font-bold text-green-400">${balance?.toFixed(2) || '0.00'}</div>
              </div>
              
              <div>
                <Label for="bet" class="mb-2">Bet Amount</Label>
                <Input
                  id="bet"
                  type="number"
                  bind:value={betAmount}
                  min="0.1"
                  max={balance}
                  step="0.1"
                  disabled={loading || !apiConnected}
                />
              </div>
              
              <div class="space-y-2">
                <Button
                  onclick={spin}
                  disabled={loading || !apiConnected || betAmount > balance}
                  class="w-full"
                  color="primary"
                >
                  {#if loading}
                    <Spinner class="mr-3" size="4" />
                    Spinning...
                  {:else}
                    <PlaySolid class="mr-2 w-4 h-4" />
                    Spin (${betAmount?.toFixed(2) || '0.00'})
                  {/if}
                </Button>
                
                <Button
                  onclick={runSimulation}
                  disabled={loading || !apiConnected}
                  class="w-full"
                  color="alternative"
                >
                  <CogSolid class="mr-2 w-4 h-4" />
                  Run Simulation
                </Button>
              </div>
            </div>
          </Card>
          
          <!-- Game Config -->
          {#if gameConfig}
            <Card class="p-6 mt-6">
              <h3 class="text-lg font-semibold text-white mb-4">Game Configuration</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-400">Game:</span>
                  <span class="text-white">{gameConfig.game_name}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">RTP:</span>
                  <span class="text-white">{(gameConfig.rtp * 100)?.toFixed(2) || '0.00'}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">House Edge:</span>
              <span class="text-white">{(gameConfig.house_edge * 100)?.toFixed(2) || '0.00'}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Max Bet:</span>
              <span class="text-white">${gameConfig.max_bet}</span>
            </div>
          </div>
        </Card>
      {/if}
    </div>
    
    <!-- Game Board -->
    <div class="lg:col-span-2">
      <Card class="p-6">
        <h2 class="text-xl font-semibold text-white mb-4">Slot Machine</h2>
        
        {#if lastSpin}
          <!-- Slot Reels -->
          <div class="grid grid-cols-5 gap-2 mb-6">
            {#each lastSpin.board as reel, reelIndex}
              <div class="space-y-2">
                {#each reel as symbol, symbolIndex}
                  <div class="bg-gray-800 border-2 border-primary-500/30 rounded-lg p-4 text-center">
                    <span class="text-2xl font-bold text-primary-400">{symbol}</span>
                  </div>
                {/each}
              </div>
            {/each}
          </div>
          
          <!-- Win Information -->
          {#if lastSpin.total_win > 0}
            <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
              <h3 class="text-lg font-semibold text-green-400 mb-2">🎉 You Won!</h3>
              <div class="text-2xl font-bold text-green-400 mb-2">
                ${lastSpin.total_win?.toFixed(2) || '0.00'}
              </div>
              
              {#if lastSpin.wins.length > 0}
                <div class="space-y-1">
                  {#each lastSpin.wins as win}
                    <div class="text-sm text-green-300">
                      {win.symbol} x{win.kind} = ${win.win?.toFixed(2) || '0.00'}
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {:else}
            <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
              <div class="text-red-400">No win this time. Try again!</div>
            </div>
          {/if}
        {:else}
          <!-- Empty Board -->
          <div class="grid grid-cols-5 gap-2 mb-6">
            {#each Array(5) as _, reelIndex}
              <div class="space-y-2">
                {#each Array(3) as _, symbolIndex}
                  <div class="bg-gray-800 border-2 border-gray-600 rounded-lg p-4 text-center">
                    <span class="text-2xl text-gray-500">?</span>
                  </div>
                {/each}
              </div>
            {/each}
          </div>
          
          <div class="text-center text-gray-400">
            {#if !apiConnected}
              <p>Math API not connected. Start the Python backend to play!</p>
            {:else}
              <p>Click "Spin" to start playing!</p>
            {/if}
          </div>
        {/if}
      </Card>
    </div>
  </div>
    </TabItem>
  </Tabs>
</div>
