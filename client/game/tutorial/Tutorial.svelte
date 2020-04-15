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
		generateSet('almost'),
	];

	function confirm() {
		dispatch('complete');
	}
</script>

<style>
	.tutorial-wrapper {
		padding-bottom: 2em;
		min-height: 100vh;
		box-sizing: border-box;
		margin-bottom: env(safe-area-inset-bottom);
		text-align: center;
	}

	.explanation {
		margin: 0 1em;
	}

	.slides {
		margin: -1em 0 1em 0;
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
		width: 320px;
	}

	@media only screen and (max-width: 500px) {
		.slides {
			width: 100%;
		}

		.slide {
			flex-direction: column;
			margin: 0.5em;
		}
	}
</style>

<div class="tutorial-wrapper center-contents">
	<h2>Tutorial</h2>
	<div class="explanation">
		Form sets of three cards where the shape, fill, number, and color are
		all the same or different.
	</div>
	<h2>Examples</h2>
	<div class="slides">
		{#each samples as cards}
			<div class="slide">
				<TutorialBreakdown {cards} />
			</div>
		{/each}
	</div>
	<button class="large" on:click={confirm}>&rarr;</button>
</div>
