<script>
	export let roomCode;

	import { fade } from 'svelte/transition';
	import { socket } from '../connectivity.js';
	import {
		uniqueNamesGenerator,
		adjectives,
		colors,
		animals,
	} from 'unique-names-generator';

	const defaultName =
		localStorage.getItem('name') ||
		uniqueNamesGenerator({
			dictionaries: [colors, animals],
			separator: ' ',
			length: 2,
		});
	let joining = false;
	let playerName = defaultName;

	function joinRoom() {
		if (playerName) {
			localStorage.setItem('name', playerName);
		} else {
			localStorage.removeItem('name');
		}
		socket.emit('joinRoom', {
			roomCode: roomCode,
			playerName: playerName || defaultName,
		});
		joining = true;
	}
</script>

<style>
	.join-wrapper {
		text-align: center;
		display: flex;
		align-items: center;
	}

	form {
		width: 100%;
	}

	input,
	button {
		box-sizing: border-box;
	}

	input {
		font-size: 4em;
		text-align: center;
		background: none;
		border: 0;
		width: 100%;
	}

	button {
		font-size: 2em;
		color: var(--saturatedColor);
		padding: 0.4em 1em;
	}
</style>

<div class="cover join-wrapper" out:fade={{ duration: 200 }}>
	{#if joining}
		<div in:fade={{ duration: 300, delay: 200 }} class="center">
			<div class="spinner" />
		</div>
	{:else}
		<form on:submit|preventDefault|once={joinRoom}>
			<!-- svelte-ignore a11y-autofocus -->
			<input
				type="text"
				bind:value={playerName}
				placeholder="???"
				autofocus />
			<button type="submit" class="large">&rarr;</button>
		</form>
	{/if}
</div>
