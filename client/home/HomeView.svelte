<script>
	import { fade } from "svelte/transition";
	import { socket } from "../connectivity.js";

	let waiting = socket.connected;

	function createRoom() {
		socket.emit("createRoom", { open: false });
		waiting = true;
	}
</script>

{#if waiting}
	<div in:fade={{ duration: 300 }} class="center">
		<div class="spinner" />
	</div>
{:else}
	<button on:click={createRoom} class="center">go</button>
{/if}
