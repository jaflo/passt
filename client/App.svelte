<script>
	import HomeView from "./screens/HomeView.svelte";
	import JoinView from "./screens/JoinView.svelte";
	import GameView from "./game/GameView.svelte";
	import { socket } from "./connectivity.js";

	// can be in setup, tutorial, or playing

	let roomCode = "";
	let parts = window.location.href.split("?");
	if (parts.length == 2) {
		roomCode = parts[1];
	}

	socket.on("roomCreated", function(data) {
		roomCode = data.roomCode;
		window.history.pushState({}, "Game", "?" + data.roomCode);
	});
</script>

{#if roomCode == ''}
	<HomeView />
{:else}
	<GameView {roomCode} />
{/if}
