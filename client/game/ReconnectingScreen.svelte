<script>
	import { createEventDispatcher } from 'svelte';
	import { fade, fly } from 'svelte/transition';
</script>

<style>
	.cover {
		background: var(--bgColor);
		color: var(--textColor);
		position: absolute;
		opacity: 0.7;
	}

	.explained {
		font-size: 2em;
		animation: fade 2s ease-in-out infinite alternate;
	}

	@keyframes fade {
		to {
			opacity: 0.5;
		}
	}
</style>

<div class="cover center-contents" transition:fade={{ duration: 200 }}>
	<div class="explained" transition:fly={{ y: 30, duration: 200 }}>
		Reconnecting...
	</div>
</div>
