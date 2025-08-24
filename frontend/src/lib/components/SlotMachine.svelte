<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { sineOut, backIn, linear } from 'svelte/easing';
  import GameSymbol from './GameSymbol.svelte';

  export let symbols: string[][] = [];
  export let gameId: string = '';
  export let spinning: boolean = false;
  export let onSpinComplete: () => void = () => {};
  
  // Base design values for gameboard UI positioning
  const BASE_W = 1536;
  const BASE_H = 1024;
  const REEL_AREA_LEFT = 293;    // Left edge of reel area
  const REEL_AREA_RIGHT = 1212;  // Right edge of reel area
  const REEL_AREA_TOP = 293;     // Top of reel area
  const REEL_AREA_BOTTOM = 727;  // Bottom of reel area
  const REEL_AREA_W = 910;       // Width: 910px for reels container
  const REEL_AREA_H = 385;       // Height: 385px for reels container
  const REEL_AREA_X = REEL_AREA_LEFT;                    // Left position: 293px
  const REEL_AREA_Y = REEL_AREA_TOP;                     // Top position: 293px
  
  // Calculate positioning for 5 reels of 160px width
  const FRAME_WIDTH = 160;   // Exact width of each reel frame
  const FRAME_HEIGHT = 385;  // Exact height of each reel frame
  const TOTAL_REEL_WIDTH = 5 * FRAME_WIDTH;  // 800px total for 5 reels
  const AVAILABLE_GAP_SPACE = REEL_AREA_W - TOTAL_REEL_WIDTH;  // 910 - 800 = 110px
  const GAP_X = AVAILABLE_GAP_SPACE / 4;  // Distribute remaining space across 4 gaps = 27.5px
  const COL_W = FRAME_WIDTH; // Use exact frame width
  const ROW_H = FRAME_HEIGHT / 3;  // 3 visible rows
  
  // Frame display size (scaled to your UI)
  export let frameDisplaySize = BASE_W; 
  
  // Calculate scale and CSS variables
  $: scaleX = frameDisplaySize / BASE_W;
  $: scaleY = (frameDisplaySize * BASE_H / BASE_W) / BASE_H;
  $: scale = Math.min(scaleX, scaleY);
  $: cssVars = {
    '--frame-width': `${frameDisplaySize}px`,
    '--frame-height': `${frameDisplaySize * BASE_H / BASE_W}px`,
    '--reel-left': `${REEL_AREA_X * scale}px`,
    '--reel-top': `${REEL_AREA_Y * scale}px`,
    '--reel-w': `${REEL_AREA_W * scale}px`,
    '--reel-h': `${REEL_AREA_H * scale}px`,
    '--col-w': `${COL_W * scale}px`,
    '--row-h': `${ROW_H * scale}px`,
    '--gap-x': `${GAP_X * scale}px`,
    '--scale': scale,
  };
  
  // Slot machine configuration
  const REEL_COUNT = 5;
  const VISIBLE_SYMBOLS = 3;
  const SPIN_DURATION = 2000;
  const REEL_DELAY = 200;
  
  // Dynamic symbol height based on scale
  $: SYMBOL_HEIGHT = ROW_H * scale;
  
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

<div class="slot-machine" style={`--frame-width: ${cssVars['--frame-width']}; --frame-height: ${cssVars['--frame-height']};`}>
  <div class="reels-container" style={`left: ${cssVars['--reel-left']}; top: ${cssVars['--reel-top']};`}>
    {#each Array(REEL_COUNT) as _, reelIndex}
      <div 
        class="reel" 
        style={`width: ${reelIndex < 3 ? '180px' : '195px'}; height: ${VISIBLE_SYMBOLS * SYMBOL_HEIGHT}px;`}
      >
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
                <GameSymbol {symbol} {gameId} size="lg" style="width: 100%; height: 100%;" />
              </div>
            {/each}
          {:else}
            {#each Array(VISIBLE_SYMBOLS) as _, symbolIndex}
              <div 
                class="symbol-slot"
                style="height: {SYMBOL_HEIGHT}px;"
              >
                <GameSymbol symbol="dragon" {gameId} size="lg" style="width: 100%; height: 100%;" />
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
    width: var(--frame-width);
    height: var(--frame-height);
    background-image: url('/images/games/mythical-dragons/ui/gameboard_ui.webp');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 16px;
    border: 2px solid rgba(147, 51, 234, 0.5);
    box-shadow: 
      0 0 30px rgba(147, 51, 234, 0.3),
      inset 0 0 20px rgba(0, 0, 0, 0.5);
  }
  
  .reels-container {
    display: flex;
    gap: var(--gap-x);
    position: absolute;
  }
  
  .reel {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    background: transparent;
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
    width: 100%;
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
  
  .slot-machine .symbol-slot :global(*) {
    width: 160px !important;
    height: 128px !important;
    max-width: 160px !important;
    max-height: 128px !important;
    min-width: 160px !important;
    min-height: 128px !important;
  }
  
  .slot-machine .symbol-slot :global(img) {
    width: 160px !important;
    height: 128px !important;
    max-width: 160px !important;
    max-height: 128px !important;
    min-width: 160px !important;
    min-height: 128px !important;
    object-fit: contain !important;
  }
  
  .slot-machine .symbol-slot :global(.w-16),
  .slot-machine .symbol-slot :global(.h-16),
  .slot-machine .symbol-slot :global(.w-full),
  .slot-machine .symbol-slot :global(.h-full) {
    width: 160px !important;
    height: 128px !important;
  }
</style>