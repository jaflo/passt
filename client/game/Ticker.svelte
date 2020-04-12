<script>
	export let plays = [];

	import CardSymbol from './board/CardSymbol.svelte';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
</script>

<style>
	.ticker {
		padding: 1em;
		opacity: 0.9;
		white-space: nowrap;
	}

	.play {
		display: inline-flex;
		align-content: center;
		align-items: center;
	}

	.invalid.play {
		opacity: 0.4;
	}

	.card {
		position: relative;
		width: 24px;
		height: 24px;
		display: inline-block;
		margin-right: 0.2em;
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
		margin: 0 1.2em 0 0.2em;
		opacity: 0.6;
		white-space: nowrap;
		max-width: 10em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.placeholder {
		text-align: center;
		opacity: 0.3;
	}
</style>

<div class="ticker">
	{#each plays as play (play.id)}
		<div
			class="play"
			class:invalid={!play.valid}
			animate:flip={{ duration: 400 }}
			in:fade={{ delay: 300, duration: 300 }}>
			{#each play.cards as card}
				<div class="card">
					<div class="symbol">
						<CardSymbol {...card} />
					</div>
				</div>
			{/each}
			<div class="player">{play.player}</div>
		</div>
	{:else}
		<div class="placeholder" out:fade={{ duration: 300 }}>
			&bull; &bull; &bull;
		</div>
	{/each}
</div>
