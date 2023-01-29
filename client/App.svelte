<script>
	import { onDestroy } from 'svelte';
	import HomeView from './home/HomeView.svelte';
	import GameView from './game/GameView.svelte';
	import Tutorial from './game/tutorial/Tutorial.svelte';
	import socket from './socket.js';
	import { closeAndReload } from './connectivity.js';
	import { roomCode } from './stores.js';
	import Deprecation from './Deprecation.svelte';

	let incompleteTutorial = !localStorage.getItem('tutorial complete');

	function roomCreated(data) {
		const queryParams = new URLSearchParams();
		queryParams.set('room', data.roomCode);
		window.location.search = '?' + queryParams.toString();
	}
	socket.on('roomCreated', roomCreated);

	function tutorialComplete() {
		localStorage.setItem('tutorial complete', 'yeah');
		incompleteTutorial = false;
	}

	function closeIfDuplicate(e) {
		if (e.key == 'new tab ' + roomCode) {
			const newTabConnectionId = localStorage.getItem(
				'new tab ' + roomCode
			);
			if (newTabConnectionId && newTabConnectionId != socket.id) {
				closeAndReload();
			}
		}
	}

	function beforeunload() {
		socket.close();
	}

	onDestroy(() => {
		socket.off('roomCreated', roomCreated);
	});
</script>

<svelte:window on:storage={closeIfDuplicate} on:beforeunload={beforeunload} />

<Deprecation />

{#if roomCode == ''}
	<HomeView />
{:else if incompleteTutorial}
	<Tutorial on:complete={tutorialComplete} />
{:else}
	<GameView />
{/if}
