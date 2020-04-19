<script>
	import Tutorial from '../game/tutorial/Tutorial.svelte';
	import socket from '../socket.js';
	import { requestRoomCreation } from '../connectivity.js';

	let waiting = socket.connected;

	function createRoom() {
		requestRoomCreation();
		waiting = true;
	}

	function popState() {
		waiting = false;
	}
</script>

<svelte:window on:pageshow={popState} />

<Tutorial on:complete={createRoom} text="Create new" loading={waiting} />
