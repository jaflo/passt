<script>
	export let roomCode;

	import { socket } from "../connectivity.js";
	import { createEventDispatcher } from "svelte";

	let joining = false;
	let playerName = "";

	const dispatch = createEventDispatcher();

	function joinRoom(e) {
		socket.emit("joinRoom", {
			roomCode: roomCode,
			playerName: playerName
		});
		joining = true;
	}
</script>

{roomCode}
{#if joining}
	Joining...
{:else}
	<form on:submit|preventDefault|once={joinRoom}>
		<input type="text" bind:value={playerName} placeholder="Name" />
		<button type="submit">join</button>
	</form>
{/if}
