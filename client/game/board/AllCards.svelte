<script>
	import Card from './Card.svelte';
</script>

{#each ['square', 'circle', 'triangle'] as shape}
	{#each ['empty', 'lined', 'filled'] as fillStyle}
		{#each ['red', 'green', 'blue'] as color}
			{#each [1, 2, 3] as number}
				<Card {shape} {fillStyle} {color} {number} />
			{/each}
		{/each}
	{/each}
{/each}
