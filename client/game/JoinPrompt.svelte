<script>
	export let roomCode;

	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { socket } from '../connectivity.js';
	import {
		uniqueNamesGenerator,
		adjectives,
		colors,
		animals,
	} from 'unique-names-generator';

	const dispatch = createEventDispatcher();

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
		attemptJoin();
		joining = true;
	}

	function attemptJoin() {
		const claimedPlayerName = playerName || randomName;
		dispatch('claimedName', { playerName: claimedPlayerName });
		socket.emit('joinRoom', {
			roomCode,
			playerName: claimedPlayerName,
			oldConnectionId: localStorage.getItem('old connection id'),
		});
	}

	socket.on('exception', data => {
		if (data.includes('Could not find any entity of type "Player"')) {
			window.location = window.location;
		} else if (data.includes('EntityNotFound')) {
			unavailable = true;
			joining = false;
		} else if (data.includes('already in')) {
			localStorage.setItem('new tab ' + roomCode, socket.id);
			setTimeout(attemptJoin, 100);
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

	.error {
		padding: 0.4em 0;
		margin-bottom: 0.5em;
	}

	form {
		width: 100%;
	}

	input,
	button {
		box-sizing: border-box;
	}

	input,
	.error {
		font-size: 4em;
		text-align: center;
		background: none;
		border: 0;
		width: 100%;
	}
</style>

<div class="cover join-wrapper center-contents" out:fade={{ duration: 200 }}>
	{#if joining}
		<div in:fade={{ duration: 300, delay: 400 }}>
			<div class="spinner" />
		</div>
	{:else if unavailable}
		<div class="blink error">?</div>
		<!-- svelte-ignore a11y-autofocus -->
		<button type="button" class="large" on:click={back} autofocus>
			<span>Back</span>
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
			<button type="submit" class="large">
				<span>Join</span>
				&rarr;
			</button>
		</form>
	{/if}
</div>
