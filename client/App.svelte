<script>
	import HomeView from "./screens/HomeView.svelte";
	import JoinView from "./screens/JoinView.svelte";
	import GameView from "./game/GameView.svelte";
	import { socket } from "./connectivity.js";

	// can be in setup, tutorial, or playing

	let roomCode = new URLSearchParams(window.location.search).get("room") || "";

	socket.on("roomCreated", function(data) {
		roomCode = data.roomCode;
		const queryParams = new URLSearchParams();
		queryParams.set("room", data.roomCode);
		window.history.pushState({}, "Game", "?" + queryParams.toString());
	});
</script>

{#if roomCode == ''}
	<HomeView />
{:else}
	<GameView {roomCode} />
{/if}
