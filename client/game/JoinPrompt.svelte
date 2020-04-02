<script>
	export let roomCode;

	import { fade } from "svelte/transition";
	import { socket } from "../connectivity.js";
	import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";

	const randomName = uniqueNamesGenerator({ dictionaries: [colors, animals], separator: " ", length: 2 });
	let joining = false;
	let playerName = randomName;

	function joinRoom() {
		socket.emit("joinRoom", {
			roomCode: roomCode,
			playerName: playerName || randomName
		});
		joining = true;
	}
</script>

<div class="center">
	{#if joining}
		<div in:fade={{ duration: 300 }}>
			<div class="spinner" />
		</div>
	{:else}
		<form on:submit|preventDefault|once={joinRoom}>
			<input type="text" bind:value={playerName} placeholder="???" />
			<button type="submit">&rarr;</button>
		</form>
	{/if}
</div>
