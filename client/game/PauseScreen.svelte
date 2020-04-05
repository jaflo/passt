<script>
	import { socket } from '../connectivity.js';

	function startGame() {
		socket.emit('startRoom');
	}
</script>

<style>
	.play {
		display: block;
		border: 0;
		background: none;
		margin: 3em auto;
	}

	@media only screen and (min-width: 800px) {
		.play {
			margin: 0 auto;
		}
	}

	.play:after {
		content: '';
		display: block;
		width: 0;
		height: 0;
		border: 2em solid transparent;
		border-left: 3.5em solid var(--saturatedColor);
		border-right-width: 0;
	}
</style>

<button on:click={startGame} class="center-wide play" />
