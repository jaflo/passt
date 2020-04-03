<script>
	export let roomCode;

	import { fade } from "svelte/transition";
	import { socket } from "../connectivity.js";
	import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";

	const defaultName =
		localStorage.getItem("name") ||
		uniqueNamesGenerator({ dictionaries: [colors, animals], separator: " ", length: 2 });
	let joining = false;
	let playerName = defaultName;

	function joinRoom() {
		if (playerName) {
			localStorage.setItem("name", playerName);
		} else {
			localStorage.removeItem("name");
		}
		socket.emit("joinRoom", {
			roomCode: roomCode,
			playerName: playerName || defaultName
		});
		joining = true;
	}
</script>

<style>
	.join-wrapper {
		width: 100%;
		text-align: center;
	}
</style>

<div class="center join-wrapper">
	{#if joining}
		<div in:fade={{ duration: 300, delay: 200 }}>
			<div class="spinner" />
		</div>
	{:else}
		<form on:submit|preventDefault|once={joinRoom}>
			<!-- svelte-ignore a11y-autofocus -->
			<input type="text" bind:value={playerName} placeholder="???" autofocus />
			<button type="submit">&rarr;</button>
		</form>
	{/if}
</div>
