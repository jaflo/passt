<script>
	export let plays = [];

	import CardSymbol from './board/CardSymbol.svelte';
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
</script>

<style>
	.ticker {
		padding: 1em;
		display: flex;
		flex-wrap: nowrap;
		opacity: 0.9;
	}

	.play {
		display: flex;
		align-content: center;
		align-items: center;
	}

	.card {
		position: relative;
		width: 24px;
		height: 24px;
		display: inline-block;
		margin-right: 0.5em;
	}

	.symbol {
		position: absolute;
		top: 0;
		left: 0;
		width: 80px;
		height: 80px;
		transform: scale(0.3);
		transform-origin: top left;
	}

	.player {
		margin: 0 2em 0 0.5em;
		opacity: 0.6;
	}

	.player.highlight {
		font-weight: bold;
	}
</style>

<div class="ticker">
	{#each plays as play (play.id)}
		<div
			class="play"
			animate:flip={{ duration: 400 }}
			in:slide={{ delay: 300, duration: 300 }}>
			{#each play.cards as card}
				<div class="card">
					<div class="symbol">
						<CardSymbol {...card} />
					</div>
				</div>
			{/each}
			<div class="player" class:highlight={play.valid}>{play.player}</div>
		</div>
	{/each}
</div>
