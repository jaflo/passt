<script>
	export let roomCode;

	import Board from "./board/Board.svelte";
	import PlayerList from "./players/PlayerList.svelte";
	import Card from "./board/Card.svelte";
	import JoinPrompt from "./JoinPrompt.svelte";
	import { randomCard, arrayContainsCard } from "./shared.js";
	import { socket } from "../connectivity.js";

	let cards = [];
	let players = [];
	let started = false;

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
	});

	function startGame() {
		socket.emit("startRoom");
	}

	let hasJoined = false;

	socket.on("joinedSuccessfully", function(data) {
		hasJoined = true;
		loadRoom(data);
	});
</script>

{#if !hasJoined}
	<JoinPrompt {roomCode} />
{:else}
	{#if !started}
		<button on:click={startGame}>Start</button>
	{/if}

	<Board {cards} />
	<PlayerList {players} />
{/if}
