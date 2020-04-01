<script>
	import Board from "./board/Board.svelte";
	import PlayerList from "./players/PlayerList.svelte";
	import Card from "./board/Card.svelte";

	import { randomCard, arrayContainsCard } from "./shared.js";
	import { socket } from "../connectivity.js";

	let cards = [];
	let players = [];

	socket.on("roomStarted", function(data) {
		cards = data.board.map(card => {
			return {
				shape: card.shape,
				fillStyle: card.fillStyle,
				color: card.color,
				number: card.number
			};
		});
		players = data.players;
	});
</script>

<Board {cards} />
<PlayerList {players} />
