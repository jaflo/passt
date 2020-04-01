<script>
	import Board from "./board/Board.svelte";
	import PlayerList from "./players/PlayerList.svelte";

	import Card from "./board/Card.svelte";

	const sampleCard = {
		shape: "triangle",
		fillStyle: "lined",
		color: "red",
		number: 1
	};
</script>

<Board />
<PlayerList />
