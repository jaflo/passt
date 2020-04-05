<script>
	export let roomCode;

	import Board from './board/Board.svelte';
	import PlayerList from './PlayerList.svelte';
	import Ticker from './Ticker.svelte';
	import JoinPrompt from './JoinPrompt.svelte';
	import PauseScreen from './PauseScreen.svelte';
	import { socket } from '../connectivity.js';
	import { randomCard, isValidPlay } from './shared.js';

	const MAX_TICKER_COUNT = 10; // limit to prevent too much memory used

	let plays = [];
	let cards = [];
	let players = [];
	let started = false;
	let hasJoined = false;

	function loadRoom(data) {
		cards = data.board.map(card => {
			return {
				shape: card.shape,
				fillStyle: card.fillStyle,
				color: card.color,
				number: card.number,
			};
		});
		players = data.players;
		started = data.started;
	}

	socket.on('roomStarted', function(data) {
		started = true;
		loadRoom(data);
	});

	socket.on('joinedSuccessfully', function(data) {
		hasJoined = true;
		loadRoom(data);
	});

	setInterval(() => {
		const cards = [randomCard(), randomCard(), randomCard()];
		plays = [
			{
				cards: cards,
				player: 'test',
				valid: isValidPlay(cards),
				id: Math.random(),
			},
			...plays.slice(0, MAX_TICKER_COUNT),
		];
	}, 2000);
</script>

<style>
	.game {
		display: flex;
		min-height: 100vh;
		flex-direction: column;
	}

	.game.joined {
		margin-top: 3em;
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
		margin: 1em 0;
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

<div class="game" class:joined={hasJoined}>
	{#if !hasJoined}
		<JoinPrompt {roomCode} />
	{:else}
		<div class="ticker">
			<Ticker {plays} />
		</div>
		<div class="main">
			{#if started}
				<Board {cards} />
			{:else}
				<PauseScreen />
			{/if}
		</div>
		<div class="sidebar">
			<PlayerList {players} />
		</div>
	{/if}
</div>
