<script>
	import NoLanding from '../NoLanding.svelte';
	import Tutorial from '../game/tutorial/Tutorial.svelte';
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

<svelte:window on:pageshow={popState} />

{#if waiting}
	<NoLanding />
	<div class="cover center-contents" in:fade={{ duration: 300, delay: 400 }}>
		<div class="spinner" />
	</div>
{:else}
	<div out:fade={{ duration: 300 }}>
		<Tutorial on:complete={createRoom} text="Create new" />
	</div>
{/if}
