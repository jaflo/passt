<script>
	import HomeView from './home/HomeView.svelte';
	import GameView from './game/GameView.svelte';
	import Tutorial from './game/tutorial/Tutorial.svelte';
	import { socket } from './connectivity.js';

	let roomCode =
		new URLSearchParams(window.location.search).get('room') || '';

	let incompleteTutorial = !localStorage.getItem('tutorial complete');

	socket.on('roomCreated', data => {
		const queryParams = new URLSearchParams();
		queryParams.set('room', data.roomCode);
		window.location.search = '?' + queryParams.toString();
	});

	socket.on('exception', console.error);

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
				socket.close();
				window.location = window.location;
			}
		}
	}
</script>

<svelte:window on:storage={closeIfDuplicate} />

{#if roomCode == ''}
	<HomeView />
{:else if incompleteTutorial}
	<Tutorial on:complete={tutorialComplete} />
{:else}
	<GameView {roomCode} />
{/if}
