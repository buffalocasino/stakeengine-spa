<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { sineOut, backIn, linear } from 'svelte/easing';
  import GameSymbol from './GameSymbol.svelte';

  export let symbols: string[][] = [];
  export let gameId: string = '';
  export let spinning: boolean = false;
  export let onSpinComplete: () => void = () => {};
  
  // Slot machine configuration
  const REEL_COUNT = 5;
  const SYMBOL_HEIGHT = 120;
  const VISIBLE_SYMBOLS = 3;
  const SPIN_DURATION = 2000;
  const REEL_DELAY = 200;
  
  // Animation states
  let reelStates: Array<{
    symbols: string[];
    position: number;
    spinning: boolean;
    targetPosition: number;
  }> = [];
  
  // Tweened positions for smooth animations
  let reelPositions = Array(REEL_COUNT).fill(0).map(() => tweened(0, {
    duration: SPIN_DURATION,
    easing: sineOut
  }));
  
  // Individual reactive position values
  $: reel0Position = reelPositions[0];
  $: reel1Position = reelPositions[1];
  $: reel2Position = reelPositions[2];
  $: reel3Position = reelPositions[3];
  $: reel4Position = reelPositions[4];
  
  // Padding symbols for continuous spinning effect
  const paddingSymbols = ['dragon', 'fire', 'diamond', 'crown', 'sword', 'castle', 'star'];
  
  onMount(() => {
    if (symbols.length > 0) {
      initializeReels();
    }
  });
  
  function initializeReels() {
    reelStates = Array(REEL_COUNT).fill(0).map((_, reelIndex) => ({
      symbols: symbols[reelIndex] || ['dragon', 'fire', 'diamond'],
      position: 0,
      spinning: false,
      targetPosition: 0
    }));
  }
  
  function createSpinningReel(reelIndex: number): string[] {
    const targetSymbols = symbols[reelIndex] || ['dragon', 'fire', 'diamond'];
    const paddingCount = 10 + Math.floor(Math.random() * 5); // Random padding for variety
    
    // Create padding symbols
    const padding = Array(paddingCount).fill(0).map(() => 
      paddingSymbols[Math.floor(Math.random() * paddingSymbols.length)]
    );
    
    return [...padding, ...targetSymbols];
  }
  
  async function startSpin() {
    if (!spinning || !reelStates.length) return;
    
    // Create spinning reels with padding
    const spinningReels = Array(REEL_COUNT).fill(0).map((_, reelIndex) => 
      createSpinningReel(reelIndex)
    );
    
    // Update reel states safely
    reelStates = reelStates.map((state, reelIndex) => ({
      ...state,
      symbols: spinningReels[reelIndex] || state.symbols,
      spinning: true,
      targetPosition: (spinningReels[reelIndex]?.length || state.symbols.length) - VISIBLE_SYMBOLS
    }));
    
    // Start spinning animations with staggered delays
    const spinPromises = reelStates.map(async (state, reelIndex) => {
      // Delay each reel
      await new Promise(resolve => setTimeout(resolve, reelIndex * REEL_DELAY));
      
      // Fast spin phase
      await reelPositions[reelIndex].set(-state.symbols.length * SYMBOL_HEIGHT + (VISIBLE_SYMBOLS * SYMBOL_HEIGHT), {
        duration: SPIN_DURATION - (reelIndex * 100),
        easing: linear
      });
      
      // Bounce back to final position
      await reelPositions[reelIndex].set(-state.targetPosition * SYMBOL_HEIGHT, {
        duration: 300,
        easing: sineOut
      });
      
      // Mark reel as stopped
      reelStates[reelIndex].spinning = false;
    });
    
    // Wait for all reels to finish
    await Promise.all(spinPromises);
    
    // Reset to final symbols
    reelStates = reelStates.map((state, reelIndex) => ({
      ...state,
      symbols: symbols[reelIndex] || ['dragon', 'fire', 'diamond'],
      spinning: false
    }));
    
    // Reset positions
    reelPositions.forEach(position => position.set(0, { duration: 0 }));
    
    onSpinComplete();
  }
  
  // Watch for spinning changes
  $: {
    if (spinning && symbols.length > 0) {
      startSpin();
    }
  }
  
  // Update reels when symbols change
  $: {
    if (symbols.length > 0 && !spinning) {
      initializeReels();
    }
  }
</script>

<div class="slot-machine">
  <div class="reels-container">
    {#each Array(REEL_COUNT) as _, reelIndex}
      <div class="reel" style="height: {VISIBLE_SYMBOLS * SYMBOL_HEIGHT}px;">
        <div 
          class="reel-strip" 
          style="transform: translateY({reelIndex === 0 ? $reel0Position : reelIndex === 1 ? $reel1Position : reelIndex === 2 ? $reel2Position : reelIndex === 3 ? $reel3Position : $reel4Position}px); height: {(reelStates[reelIndex]?.symbols.length || VISIBLE_SYMBOLS) * SYMBOL_HEIGHT}px;"
        >
          {#if reelStates[reelIndex]?.symbols}
            {#each reelStates[reelIndex].symbols as symbol, symbolIndex}
              <div 
                class="symbol-slot"
                style="height: {SYMBOL_HEIGHT}px;"
              >
                <GameSymbol {symbol} {gameId} size="lg" />
              </div>
            {/each}
          {:else}
            {#each Array(VISIBLE_SYMBOLS) as _, symbolIndex}
              <div 
                class="symbol-slot"
                style="height: {SYMBOL_HEIGHT}px;"
              >
                <GameSymbol symbol="dragon" {gameId} size="lg" />
              </div>
            {/each}
          {/if}
        </div>
        
        <!-- Reel overlay for visual effects -->
        <div class="reel-overlay" class:spinning={reelStates[reelIndex]?.spinning}>
          <div class="reel-glow"></div>
        </div>
      </div>
    {/each}
  </div>
  
  <!-- Paylines overlay -->
  <div class="paylines">
    {#each Array(9) as _, lineIndex}
      <div class="payline payline-{lineIndex}"></div>
    {/each}
  </div>
</div>

<style>
  .slot-machine {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(30, 20, 60, 0.9));
    border-radius: 16px;
    padding: 20px;
    border: 2px solid rgba(147, 51, 234, 0.5);
    box-shadow: 
      0 0 30px rgba(147, 51, 234, 0.3),
      inset 0 0 20px rgba(0, 0, 0, 0.5);
  }
  
  .reels-container {
    display: flex;
    gap: 8px;
    position: relative;
  }
  
  .reel {
    position: relative;
    width: 100px;
    overflow: hidden;
    border-radius: 12px;
    border: 2px solid rgba(147, 51, 234, 0.6);
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.9), rgba(20, 10, 40, 0.9));
    box-shadow: 
      inset 0 0 15px rgba(0, 0, 0, 0.8),
      0 0 10px rgba(147, 51, 234, 0.2);
  }
  
  .reel-strip {
    position: relative;
    width: 100%;
    transition: filter 0.3s ease;
  }
  
  .symbol-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid rgba(147, 51, 234, 0.2);
    background: radial-gradient(circle at center, rgba(147, 51, 234, 0.1), transparent);
  }
  
  .reel-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    border-radius: 10px;
    transition: all 0.3s ease;
  }
  
  .reel-overlay.spinning {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 20%,
      transparent 80%,
      rgba(255, 255, 255, 0.1) 100%
    );
    animation: spinning-glow 0.5s ease-in-out infinite alternate;
  }
  
  .reel-glow {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 14px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .reel-overlay.spinning .reel-glow {
    opacity: 1;
    background: linear-gradient(45deg, 
      rgba(147, 51, 234, 0.4),
      rgba(59, 130, 246, 0.4),
      rgba(147, 51, 234, 0.4)
    );
    animation: reel-glow 1s ease-in-out infinite;
  }
  
  .paylines {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }
  
  .payline {
    position: absolute;
    height: 2px;
    background: rgba(255, 215, 0, 0.6);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 1px;
    box-shadow: 0 0 4px rgba(255, 215, 0, 0.8);
  }
  
  /* Payline positions for 5x3 grid */
  .payline-0 { top: 50%; left: 20px; right: 20px; } /* Middle */
  .payline-1 { top: 25%; left: 20px; right: 20px; } /* Top */
  .payline-2 { top: 75%; left: 20px; right: 20px; } /* Bottom */
  
  @keyframes spinning-glow {
    0% { filter: brightness(1) contrast(1); }
    100% { filter: brightness(1.2) contrast(1.1); }
  }
  
  @keyframes reel-glow {
    0%, 100% { 
      background: linear-gradient(45deg, 
        rgba(147, 51, 234, 0.4),
        rgba(59, 130, 246, 0.4),
        rgba(147, 51, 234, 0.4)
      );
    }
    50% { 
      background: linear-gradient(45deg, 
        rgba(59, 130, 246, 0.6),
        rgba(147, 51, 234, 0.6),
        rgba(59, 130, 246, 0.6)
      );
    }
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .slot-machine {
      padding: 15px;
    }
    
    .reel {
      width: 80px;
    }
    
    .reels-container {
      gap: 6px;
    }
  }
  
  @media (max-width: 480px) {
    .reel {
      width: 60px;
    }
    
    .reels-container {
      gap: 4px;
    }
  }
</style>
