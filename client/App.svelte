<script>
	import HomeView from './home/HomeView.svelte';
	import GameView from './game/GameView.svelte';
	import Tutorial from './game/tutorial/Tutorial.svelte';
	import { socket, closeAndReload } from './connectivity.js';
	import { roomCode } from './stores.js';

	let incompleteTutorial = !localStorage.getItem('tutorial complete');

	socket.on('roomCreated', data => {
		const queryParams = new URLSearchParams();
		queryParams.set('room', data.roomCode);
		window.location.search = '?' + queryParams.toString();
	});

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
</script>

<svelte:window on:storage={closeIfDuplicate} on:beforeunload={beforeunload} />

{#if roomCode == ''}
	<HomeView />
{:else if incompleteTutorial}
	<Tutorial on:complete={tutorialComplete} />
{:else}
	<GameView />
{/if}
