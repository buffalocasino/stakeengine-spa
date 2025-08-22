<script lang="ts">
  export let symbol: string;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let gameId: string = '';
  
  // Symbol mapping for different games
  const symbolMappings: Record<string, Record<string, { image: string; emoji: string; alt: string }>> = {
    mythical_dragons: {
      'dragon': { image: '/images/games/mythical-dragons/symbols/00.png', emoji: '🐉', alt: 'Dragon' },
      'fire': { image: '/images/games/mythical-dragons/symbols/01.png', emoji: '🔥', alt: 'Fire' },
      'diamond': { image: '/images/games/mythical-dragons/symbols/02.png', emoji: '💎', alt: 'Diamond' },
      'crown': { image: '/images/games/mythical-dragons/symbols/03.png', emoji: '👑', alt: 'Crown' },
      'sword': { image: '/images/games/mythical-dragons/symbols/04.png', emoji: '⚔️', alt: 'Sword' },
      'castle': { image: '/images/games/mythical-dragons/symbols/05.png', emoji: '🏰', alt: 'Castle' },
      'star': { image: '/images/games/mythical-dragons/symbols/06.png', emoji: '🌟', alt: 'Wild Star' },
      'bonus': { image: '/images/games/mythical-dragons/symbols/07.png', emoji: '🎁', alt: 'Bonus' },
      'multiplier': { image: '/images/games/mythical-dragons/symbols/08.png', emoji: '✨', alt: 'Multiplier' },
      'scatter': { image: '/images/games/mythical-dragons/symbols/09.png', emoji: '💫', alt: 'Scatter' }
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-2xl',
    md: 'w-12 h-12 text-4xl',
    lg: 'w-16 h-16 text-5xl'
  };

  $: symbolData = symbolMappings[gameId]?.[symbol];
  $: useImage = symbolData && symbolData.image;
  $: displaySymbol = symbolData?.emoji || symbol;
  $: altText = symbolData?.alt || symbol;
  
  let imageLoaded = false;
  let imageError = false;

  function handleImageLoad() {
    imageLoaded = true;
  }

  function handleImageError() {
    imageError = true;
  }
</script>

<div class="flex items-center justify-center {sizeClasses[size]}">
  {#if useImage && !imageError}
    <img 
      src={symbolData.image} 
      alt={altText}
      class="w-full h-full object-contain"
      class:opacity-0={!imageLoaded}
      class:opacity-100={imageLoaded}
      on:load={handleImageLoad}
      on:error={handleImageError}
    />
    {#if !imageLoaded}
      <span class="absolute">{displaySymbol}</span>
    {/if}
  {:else}
    <span>{displaySymbol}</span>
  {/if}
</div>
