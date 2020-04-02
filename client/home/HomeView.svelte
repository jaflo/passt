<script>
	import { socket } from "../connectivity.js";

	let waitingOnCreate = false;

	function createRoom() {
		socket.emit("createRoom", { open: false });
		waitingOnCreate = true;
	}
</script>

{#if waitingOnCreate}
	Loading...
{:else}
	<button on:click={createRoom}>Create</button>
{/if}
