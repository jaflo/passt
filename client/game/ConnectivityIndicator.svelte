<script>
	import { socket } from '../connectivity.js';

	let connected = socket.connected;

	socket.on('joinedSuccessfully', () => (connected = true));
	socket.on('disconnect', () => (connected = false));
</script>

{#if !connected}
	<div class="spinner" />
{/if}
