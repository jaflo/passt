<script>
	import { onDestroy } from 'svelte';
	import { socket, closeAndReload } from '../connectivity.js';

	let connected = socket.connected;
	let refreshTImeout;

	socket.on('joinedSuccessfully', () => {
		connected = true;
		clearTimeout(refreshTImeout);
	});

	socket.on('disconnect', () => {
		connected = false;
		refreshTImeout = setTimeout(closeAndReload, 5000);
	});

	onDestroy(() => {
		clearTimeout(refreshTImeout);
	});
</script>

{#if !connected}
	<div class="spinner" />
{/if}
