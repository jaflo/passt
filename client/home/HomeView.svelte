<script>
	import Tutorial from '../game/tutorial/Tutorial.svelte';
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

<Tutorial on:complete={createRoom} text="Create new" loading={waiting} />
