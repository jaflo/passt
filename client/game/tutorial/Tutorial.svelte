<script>
	export let text = 'Play';

	import TutorialBreakdown from './TutorialBreakdown.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { generateSet, randomElement } from '../shared.js';

	const dispatch = createEventDispatcher();

	const samples = [
		generateSet('correct'),
		generateSet('correct'),
		generateSet('random'),
		generateSet('almost'),
		generateSet('almost'),
		generateSet('almost'),
	];

	let loaded = [];

	function loadMore() {
		let added = [];
		for (let i = 0; i < 4; i++) {
			added.push(
				generateSet(
					randomElement(['correct', 'correct', 'almost', 'random'])
				)
			);
		}
		loaded = [...loaded, ...added];
	}

	function confirm() {
		dispatch('complete');
	}

	const observer = new IntersectionObserver(loadMore);

	onMount(async () => {
		observer.observe(document.querySelector('.placeholder.slide'));
	});
</script>

<style>
	.tutorial-wrapper {
		text-align: center;
		padding-bottom: 2em;
	}

	h2 {
		margin-top: 2em;
	}

	.slides {
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

	.placeholder {
		height: 200px;
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
	<!-- svelte-ignore a11y-autofocus -->
	<button class="large" on:click={confirm} autofocus>
		<span>{text}</span>
		&rarr;
	</button>
	<h2>Examples</h2>
	<div class="slides">
		{#each samples as cards}
			<div class="slide">
				<TutorialBreakdown {cards} />
			</div>
		{/each}
		{#each loaded as cards}
			<div class="slide">
				<TutorialBreakdown {cards} />
			</div>
		{/each}
		<div class="placeholder slide" />
		<div class="placeholder slide" />
	</div>
</div>
