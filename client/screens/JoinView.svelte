<script>
	export let roomCode;

	import { socket } from "../connectivity.js";

	let playerName = "";

	function join() {
		socket.emit("joinRoom", {
			roomCode: roomCode,
			playerName: playerName
		});
	}
</script>

<input type="text" bind:value={playerName} placeholder="Name" />
<button on:click={join}>join</button>
