<script>
	export let text = 'Play';
	export let loading = false;

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
		margin: 2em 0 0 0;
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

	.sticky {
		position: sticky;
		top: 0;
		width: 100%;
		z-index: 3;
		box-sizing: border-box;
		padding: 2em 1em 6em 1em;
		margin: -2em 0 -7em 0;
		background: linear-gradient(
			to bottom,
			rgba(34, 85, 96, 1) 0%,
			rgba(34, 85, 96, 0.987) 8.1%,
			rgba(34, 85, 96, 0.951) 15.5%,
			rgba(34, 85, 96, 0.896) 22.5%,
			rgba(34, 85, 96, 0.825) 29%,
			rgba(34, 85, 96, 0.741) 35.3%,
			rgba(34, 85, 96, 0.648) 41.2%,
			rgba(34, 85, 96, 0.55) 47.1%,
			rgba(34, 85, 96, 0.45) 52.9%,
			rgba(34, 85, 96, 0.352) 58.8%,
			rgba(34, 85, 96, 0.259) 64.7%,
			rgba(34, 85, 96, 0.175) 71%,
			rgba(34, 85, 96, 0.104) 77.5%,
			rgba(34, 85, 96, 0.049) 84.5%,
			rgba(34, 85, 96, 0.013) 91.9%,
			rgba(34, 85, 96, 0) 100%
		);
	}

	h2,
	main {
		position: relative;
		z-index: 5;
	}
</style>

<div class="tutorial-wrapper center-contents">
	<div class="sticky">
		<!-- svelte-ignore a11y-autofocus -->
		<button class="large" on:click={confirm} autofocus class:loading>
			<span>{text}</span>
			&rarr;
		</button>
	</div>
	<h2>Examples</h2>
	<main>
		Groups of cards are valid if each of the properties shape, fill, number,
		and color are all the same or all unique across the three cards. Further
		information is available once you start playing.
	</main>
	<div class="slides">
		{#each samples as cards}
			<div class="slide">
				<TutorialBreakdown {cards} resultScale={0.8} />
			</div>
		{/each}
		{#each loaded as cards}
			<div class="slide">
				<TutorialBreakdown {cards} resultScale={0.8} />
			</div>
		{/each}
		<div class="placeholder slide" />
		<div class="placeholder slide" />
	</div>
</div>
