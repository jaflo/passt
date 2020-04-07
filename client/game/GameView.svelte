<script>
	export let roomCode;

	import Board from './board/Board.svelte';
	import Sidebar from './Sidebar.svelte';
	import Ticker from './Ticker.svelte';
	import JoinPrompt from './JoinPrompt.svelte';
	import PauseScreen from './PauseScreen.svelte';
	import { socket } from '../connectivity.js';
	import { cardAsString, inPlaceReplace } from './shared.js';

	const MAX_TICKER_COUNT = 10; // limit to prevent too much memory used

	let plays = [];
	let cards = [];
	let players = [];
	let state = 'joining'; // joining, waiting, playing, ended

	function loadRoom(data) {
		cards = inPlaceReplace(
			cards,
			data.board.map(card => {
				return {
					shape: card.shape,
					fillStyle: card.fillStyle,
					color: card.color,
					number: card.number,
					id: cardAsString(card),
				};
			})
		);
		players = data.players || players;
		if (data.started) {
			state = 'playing';
		}
	}

	socket.on('joinedSuccessfully', function(data) {
		loadRoom(data);
		state = 'waiting';
		localStorage.setItem('oldConnectionId', socket.id);
	});

	socket.on('roomStarted', function(data) {
		loadRoom(data);
		state = 'playing';
		plays = [];
	});

	socket.on('gameOver', function() {
		state = 'ended';
	});

	socket.on('movePlayed', function(data) {
		loadRoom(data);
		plays = [
			{
				cards: data.cards,
				player: data.player.name,
				valid: data.updated,
				id: Math.random(),
			},
			...plays.slice(0, MAX_TICKER_COUNT),
		];
		players = players.map(player => {
			if (player.connectionId == data.player.connectionId) {
				return data.player;
			} else {
				return player;
			}
		});
	});

	socket.on('playerDisconnected', function(connectionId) {
		players.forEach(player => {
			if (player.connectionId == connectionId) {
				player.connected = false;
				return;
			}
		});
	});

	socket.on('playersRemoved', function(connectionId) {
		players = players.filter(player => player.connectionId != connectionId);
	});

	socket.on('newPlayer', function(player) {
		players = [
			{
				connectionId: player.connectionId,
				name: player.name,
				points: player.points,
				connected: player.connected,
			},
			...players,
		];
	});
</script>

<style>
	.game {
		display: flex;
		min-height: 100vh;
		flex-direction: column;
	}

	.ticker,
	.main {
		-webkit-user-select: none;
		user-select: none;
	}

	.ticker {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		overflow: hidden;
	}

	.main {
		margin: 3em 0 1em 0;
	}

	.sidebar {
		padding: 1em;
		background: var(--saturatedColor);
		color: var(--bgColor);
		flex: 1;
		box-sizing: border-box;
	}

	@media only screen and (min-width: 800px) {
		.game {
			flex-direction: row;
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			margin-top: 0;
		}

		.ticker {
			right: 260px;
		}

		.main {
			flex: 1;
			position: relative;
			margin-top: 3em;
		}

		.sidebar {
			flex: initial;
			width: 260px;
		}
	}
</style>

<div class="game">
	{#if state == 'joining'}
		<JoinPrompt {roomCode} />
	{:else}
		<div class="ticker">
			<Ticker {plays} />
		</div>
		<div class="main center-contents">
			{#if state == 'playing'}
				<Board {cards} />
			{:else}
				<PauseScreen redo={state == 'ended'} />
			{/if}
		</div>
		<div class="sidebar">
			<Sidebar {players} />
		</div>
	{/if}
</div>
