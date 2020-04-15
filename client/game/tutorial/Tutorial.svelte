<script>
	import TutorialBreakdown from './TutorialBreakdown.svelte';
	import { createEventDispatcher } from 'svelte';
	import { generateSet } from '../shared.js';

	const dispatch = createEventDispatcher();

	const simple = [
		[{}, {}, {}],
		[{}, { shape: 'square' }, { shape: 'triangle' }],
		[{}, {}, { shape: 'triangle' }],
	];

	const samples = [
		generateSet('correct'),
		generateSet('correct'),
		generateSet('random'),
		generateSet('almost'),
		generateSet('almost'),
	];

	function confirm() {
		dispatch('complete');
	}
</script>

<style>
	.tutorial-wrapper {
		padding: 1em 0;
		min-height: 100vh;
		box-sizing: border-box;
	}

	.slides {
		margin-bottom: 1em;
		max-width: 800px;
		text-align: center;
	}

	.slide {
		margin: 1em;
		display: inline-block;
		background: var(--bgColor);
		color: var(--textColor);
		padding: 1em;
		border-radius: 0.4em;
		box-sizing: border-box;
	}

	.padded {
		margin-bottom: 0.8em;
	}

	.padded:last-child {
		margin-bottom: 0;
	}

	@media only screen and (max-width: 500px) {
		.slides {
			width: 100%;
		}

		.slide {
			flex-direction: column;
		}
	}
</style>

<div class="tutorial-wrapper center-contents">
	<div class="slides">
		{#each Array(samples.length + 1) as _, i}
			<div class="slide">
				{#if i == 0}
					{#each simple as cards}
						<div class="padded">
							<TutorialBreakdown {cards} />
						</div>
					{/each}
				{:else}
					<TutorialBreakdown
						cards={samples[i - 1]}
						breakdownDepth={4} />
				{/if}
			</div>
		{/each}
	</div>
	<button class="large" on:click={confirm}>&rarr;</button>
</div>
