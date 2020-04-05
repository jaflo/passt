<script>
	import { fade } from 'svelte/transition';
	import { socket } from '../connectivity.js';

	let waiting = socket.connected;

	function createRoom() {
		socket.emit('createRoom', { open: false });
		waiting = true;
	}

	function popState() {
		waiting = false;
	}
</script>

<style>
	button {
		font-size: 8em;
		width: 1em;
		height: 1em;
		text-indent: -9em;
		overflow: hidden;
	}

	button:before,
	button:after {
		content: '';
		display: block;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 50%;
		border-left: 0.2em solid var(--saturatedColor);
		transform: translateX(-50%) scale(0.5);
	}

	button:after {
		transform: translateX(-50%) scale(0.5) rotate(90deg);
	}
</style>

<svelte:window on:pageshow={popState} />

<div class="cover">
	{#if waiting}
		<div in:fade={{ duration: 300, delay: 400 }} class="center">
			<div class="spinner" />
		</div>
	{:else}
		<button on:click={createRoom} class="center large">go</button>
	{/if}
</div>
