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

	const randomName = uniqueNamesGenerator({
		dictionaries: [colors, animals],
		separator: ' ',
		length: 2,
	});
	let playerName = localStorage.getItem('name') || '';
	let joining = false;
	let unavailable = false;

	function joinRoom() {
		if (playerName) {
			localStorage.setItem('name', playerName);
		} else {
			localStorage.removeItem('name');
		}
		socket.emit('joinRoom', {
			roomCode: roomCode,
			playerName: playerName || randomName,
			oldConnectionId: localStorage.getItem('oldConnectionId'),
		});
		joining = true;
	}

	socket.on('exception', data => {
		if (data.includes('does not exist') || data.includes('already in')) {
			unavailable = true;
			joining = false;
		}
	});

	function back() {
		window.location = window.location.pathname;
	}
</script>

<style>
	.join-wrapper {
		text-align: center;
	}

	form {
		width: 100%;
	}

	input,
	button {
		box-sizing: border-box;
	}

	input,
	.blink {
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
		margin: 0;
	}

	.blink {
		animation: blink 1s steps(2, start) infinite;
		padding: 0.4em 0;
		margin-bottom: 0.5em;
	}

	@keyframes blink {
		to {
			visibility: hidden;
		}
	}
</style>

<div class="cover join-wrapper center-contents" out:fade={{ duration: 200 }}>
	{#if joining}
		<div in:fade={{ duration: 300, delay: 400 }}>
			<div class="spinner" />
		</div>
	{:else if unavailable}
		<div class="blink">?</div>
		<!-- svelte-ignore a11y-autofocus -->
		<button type="button" class="large" on:click={back} autofocus>
			&larr;
		</button>
	{:else}
		<form on:submit|preventDefault|once={joinRoom}>
			<!-- svelte-ignore a11y-autofocus -->
			<input
				type="text"
				bind:value={playerName}
				placeholder={randomName}
				autofocus />
			<button type="submit" class="large">&rarr;</button>
		</form>
	{/if}
</div>
