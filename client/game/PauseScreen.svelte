<script>
	import { socket } from "../connectivity.js";

	function startGame() {
		socket.emit("startRoom");
	}
</script>

<style>
	.play {
		display: block;
		border: 0;
		background: none;
		margin: 1em auto;
	}

	.play:after {
		content: "";
		display: block;
		width: 0;
		height: 0;
		border: 2em solid transparent;
		border-left: 3.5em solid var(--saturatedColor);
		border-right-width: 0;
	}
</style>

<button on:click={startGame} class="center-wide play" />
