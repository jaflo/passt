<script>
	export let cards = [];

	import { createEventDispatcher } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import TutorialBreakdown from './TutorialBreakdown.svelte';

	const dispatch = createEventDispatcher();

	function understood() {
		dispatch('understood');
	}
</script>

<style>
	.cover {
		background: var(--bgColor);
	}

	.explained {
		margin: 1em;
	}

	.tutorial-wrapper {
		background: var(--cardBgColor);
		color: var(--saturatedColor);
		border: 1px solid rgba(0, 0, 0, 0.1);
		padding: 1em;
		border-radius: 0.3em;
	}

	button {
		margin: 1em 0 0 auto;
		display: block;
		padding: 0.4em 1em;
	}
</style>

<div class="cover center-contents" transition:fade={{ duration: 200 }}>
	<div class="explained" transition:fly={{ y: 30, duration: 200 }}>
		<div class="tutorial-wrapper">
			<TutorialBreakdown {cards} breakdownDepth={4} resultScale={0.8} />
		</div>
		<button on:click={understood} in:fade={{ duration: 200, delay: 2000 }}>
			&rarr;
		</button>
	</div>
</div>
