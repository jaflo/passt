<script>
	import { socket } from '../connectivity.js';

	function startGame() {
		socket.emit('startRoom');
	}

	function handleKeydown(e) {
		if (['Enter', 'Space'].includes(e.code)) {
			startGame();
		}
	}
</script>

<style>
	.play-wrapper {
		cursor: pointer;
		padding: 3em 0;
		height: 100%;
	}

	@media only screen and (min-width: 800px) {
		.play-wrapper {
			padding: 0;
		}
	}

	.play {
		display: block;
		border: 0;
		background: none;
		margin: auto;
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

<svelte:window on:keydown={handleKeydown} />

<div class="play-wrapper center-contents" on:click={startGame}>
	<button class="play" />
</div>
