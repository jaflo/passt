<script>
	import HomeView from "./home/HomeView.svelte";
	import GameView from "./game/GameView.svelte";
	import { socket } from "./connectivity.js";

	let roomCode = new URLSearchParams(window.location.search).get("room") || "";

	socket.on("roomCreated", function(data) {
		const queryParams = new URLSearchParams();
		queryParams.set("room", data.roomCode);
		window.location.search = "?" + queryParams.toString();
	});
</script>

{#if roomCode == ''}
	<HomeView />
{:else}
	<GameView {roomCode} />
{/if}
