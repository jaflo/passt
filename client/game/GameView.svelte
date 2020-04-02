<script>
	export let roomCode;

	import Board from "./board/Board.svelte";
	import PlayerList from "./PlayerList.svelte";
	import Card from "./board/Card.svelte";
	import JoinPrompt from "./JoinPrompt.svelte";
	import PauseScreen from "./PauseScreen.svelte";
	import { randomCard, arrayContainsCard } from "./shared.js";
	import { socket } from "../connectivity.js";

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
				number: card.number
			};
		});
		players = data.players;
		started = data.started;
	}

	socket.on("roomStarted", function(data) {
		loadRoom(data);
		started = true;
	});

	socket.on("joinedSuccessfully", function(data) {
		hasJoined = true;
		loadRoom(data);
	});
</script>

<style>
	.game {
		display: flex;
		min-height: 100vh;
		flex-direction: column;
	}

	.main {
		margin: 1em 0;
	}

	.sidebar {
		padding: 1em;
		background: #225560;
		color: #eff0d1;
		flex: 1;
	}

	@media only screen and (min-width: 800px) {
		.game {
			flex-direction: row;
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
		}

		.main {
			flex: 1;
			position: relative;
		}

		.sidebar {
			flex: initial;
			width: 260px;
		}
	}
</style>

<div class="game">
	{#if !hasJoined}
		<JoinPrompt {roomCode} />
	{:else}
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
