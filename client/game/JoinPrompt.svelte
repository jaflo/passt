<script>
	import { fade } from 'svelte/transition';
	import socket from '../socket.js';
	import { requestJoinRoom, closeAndReload } from '../connectivity.js';
	import { roomCode, playerName } from '../stores.js';
	import {
		uniqueNamesGenerator,
		colors,
		animals,
	} from 'unique-names-generator';

	const randomName = uniqueNamesGenerator({
		dictionaries: [colors, animals],
		separator: ' ',
		length: 2,
	});
	let joining = false;
	let unavailable = false;
	let sessionPlayerName = playerName;

	function joinRoom() {
		if (sessionPlayerName) {
			localStorage.setItem('name', sessionPlayerName);
		} else {
			localStorage.removeItem('name');
		}
		attemptJoin();
		joining = true;
	}

	function attemptJoin() {
		requestJoinRoom(sessionPlayerName || randomName);
	}

	socket.on('exception', data => {
		if (data.includes('Could not find any entity of type "Player"')) {
			closeAndReload();
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
	{#if unavailable}
		<div class="blink error">?</div>
		<!-- svelte-ignore a11y-autofocus -->
		<button type="button" class="large back" on:click={back} autofocus>
			&larr;
			<span>Back</span>
		</button>
	{:else}
		<form on:submit|preventDefault={joinRoom}>
			<!-- svelte-ignore a11y-autofocus -->
			<input
				type="text"
				bind:value={sessionPlayerName}
				placeholder={randomName}
				autofocus />
			<button type="submit" class="large" class:loading={joining}>
				<span>Join</span>
				&rarr;
			</button>
		</form>
	{/if}
</div>
