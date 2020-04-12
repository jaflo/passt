<script>
	export let roomCode;

	import { createEventDispatcher } from 'svelte';
	import Board from './board/Board.svelte';
	import Sidebar from './Sidebar.svelte';
	import Ticker from './Ticker.svelte';
	import JoinPrompt from './JoinPrompt.svelte';
	import PauseScreen from './PauseScreen.svelte';
	import MiniExplainer from './tutorial/MiniExplainer.svelte';
	import { socket } from '../connectivity.js';
	import { cardAsString, inPlaceReplace } from './shared.js';

	const dispatch = createEventDispatcher();

	const MAX_TICKER_COUNT = 10; // limit to prevent too much memory used
	const EXPLAIN_MISPLAY = 5;
	const REDO_TUTORIAL = 10;

	let plays = [];
	let cards = [];
	let players = [];
	let state = 'joining'; // joining, waiting, playing, ended
	let playerName;

	let incorrectPlay = false;
	let correctPlay = false;
	let explainCards = [];

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

	socket.on('joinedSuccessfully', data => {
		loadRoom(data);
		if (data.started) {
			if (data.board.length > 0) {
				state = 'playing';
			} else {
				state = 'ended';
			}
		} else {
			state = 'waiting';
		}
		localStorage.setItem('old connection id', socket.id);
		localStorage.removeItem('new tab ' + roomCode);
	});

	socket.on('reconnect', () => {
		if (state == 'joining') return;
		socket.emit('joinRoom', {
			roomCode,
			playerName,
			oldConnectionId: localStorage.getItem('old connection id'),
		});
	});

	socket.on('roomStarted', data => {
		loadRoom(data);
		state = 'playing';
		plays = [];
	});

	socket.on('gameOver', () => {
		state = 'ended';
	});

	socket.on('movePlayed', data => {
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
		if (data.player.connectionId == socket.id) {
			if (data.updated) {
				correctPlay = true;
			} else {
				incorrectPlay = true;
			}
		}
	});

	socket.on('playerDisconnected', connectionId => {
		players.forEach(player => {
			if (player.connectionId == connectionId) {
				player.connected = false;
				return;
			}
		});
		players = players;
	});

	socket.on('playersRemoved', data => {
		const removedPlayers = data.removedPlayers;
		players = players.filter(
			player => !removedPlayers.includes(player.connectionId)
		);
	});

	socket.on('newPlayer', player => {
		players = [
			{
				connectionId: player.connectionId,
				name: player.name,
				points: player.points,
				connected: player.connected,
			},
			...players.filter(
				// remove old player if needed
				oldPlayer => oldPlayer.connectionId != player.oldConnectionId
			),
		];
	});

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

	function claimedName(e) {
		playerName = e.detail.playerName;
	}

	function judgeMisplay(e) {
		if (e.detail.count > REDO_TUTORIAL) {
			dispatch('excessiveMisplays');
		} else if (e.detail.count > EXPLAIN_MISPLAY) {
			explainCards = e.detail.cards;
		}
	}
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
		background: var(--bgColor);
		color: var(--textColor);
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
		min-height: 200px;
		position: relative;
	}

	.shakeable {
		will-change: transform;
	}

	.shake {
		animation: shake 0.3s linear forwards;
	}

	@keyframes shake {
		8%,
		41% {
			transform: translateX(-2em);
		}
		25%,
		58% {
			transform: translateX(2em);
		}
		75% {
			transform: translateX(-1em);
		}
		92% {
			transform: translateX(1em);
		}
		0%,
		100% {
			transform: translateX(0);
		}
	}

	.sidebar {
		padding: 1em;
		background: var(--saturatedColor);
		color: var(--bgColor);
		flex: 1;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		z-index: 2;
	}

	.sidebar.highlight {
		animation: highlight-sidebar 5s linear forwards;
	}

	@keyframes highlight-sidebar {
		0% {
			box-shadow: 0 0 0 0 var(--saturatedColor);
		}
		5%,
		20% {
			box-shadow: 0 0 0 100vmax var(--saturatedColor);
		}
		100% {
			box-shadow: 0 0 0 100vmax transparent;
		}
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
			margin: 3em 0 0 0;
		}

		.sidebar {
			flex: initial;
			width: 260px;
		}
	}

	.overlay {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(255, 255, 255, 0.3);
		opacity: 0;
		pointer-events: none;
	}

	.overlay.flash {
		animation: flash 0.3s linear forwards;
	}

	@keyframes flash {
		0% {
			opacity: 0;
		}
		20% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
</style>

<svelte:window on:storage={closeIfDuplicate} />

<div class="game">
	{#if state == 'joining'}
		<JoinPrompt {roomCode} on:claimedName={claimedName} />
	{:else}
		<div class="ticker">
			<Ticker {plays} />
		</div>
		<div class="main center-contents">
			{#if state == 'playing'}
				{#if explainCards.length > 0}
					<MiniExplainer
						cards={explainCards}
						on:understood={() => {
							explainCards = [];
						}} />
				{/if}
				<div
					class="shakeable"
					class:shake={incorrectPlay}
					on:animationend={() => (incorrectPlay = false)}>
					<Board
						{cards}
						on:misplay={judgeMisplay}
						disabled={explainCards.length > 0} />
				</div>
			{:else}
				<PauseScreen redo={state == 'ended'} />
			{/if}
		</div>
		<div class="sidebar" class:highlight={state == 'ended'}>
			<Sidebar {players} {roomCode} />
		</div>
		<div
			class="overlay"
			class:flash={correctPlay}
			on:animationend={() => (correctPlay = false)} />
	{/if}
</div>
