<script>
	export let timeout = 0;
	export let continueText = 'Continue';
	export let reverse = false;

	import { createEventDispatcher } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	let allowed = false;

	function dismiss() {
		if (allowed) {
			dispatch('dismiss');
		}
	}

	setTimeout(() => {
		allowed = true;
	}, timeout);

	function handleKeydown(e) {
		if (['Enter', 'Space'].includes(e.code)) {
			dismiss();
			e.preventDefault();
		}
	}
</script>

<style>
	.cover {
		background: var(--bgColor);
		position: absolute;
	}

	.content {
		margin: 1em;
		color: var(--textColor);
	}

	.alert-wrapper {
		background: var(--cardBgColor);
		border: 1px solid rgba(0, 0, 0, 0.1);
		padding: 1em;
		border-radius: 0.3em;
		width: 320px;
	}

	button {
		margin: 1em 0 0 auto;
		display: block;
		padding: 0.4em 1em;
		width: 100%;
	}

	button.ignore {
		cursor: inherit;
	}
</style>

<svelte:window on:keydown={handleKeydown} />

<div class="cover center-contents" transition:fade={{ duration: 200 }}>
	<div class="content" transition:fly={{ y: 30, duration: 200 }}>
		<div class="alert-wrapper">
			<slot />
		</div>
		<button
			on:click={dismiss}
			in:fade={{ duration: 200, delay: timeout }}
			class:ignore={!allowed}>
			{#if reverse}&larr; {continueText}{:else}{continueText} &rarr;{/if}
		</button>
	</div>
</div>
