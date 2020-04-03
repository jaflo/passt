<script>
	import { fade } from "svelte/transition";
	import { socket } from "../connectivity.js";

	let waiting = socket.connected;

	function createRoom() {
		socket.emit("createRoom", { open: false });
		waiting = true;
	}

	function popState() {
		waiting = false;
	}
</script>

<style>
	.cover {
		background: #225560;
		color: #eff0d1;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	button {
		font-size: 20vmin;
		border: 0;
		background: #eff0d1;
		width: 1em;
		height: 1em;
		border-radius: 9em;
		border: 0;
		transition: 0.1s ease-in-out;
		overflow: hidden;
	}

	button:hover {
		transform: translate(-50%, -50%) scale(1.1);
	}

	button:before,
	button:after {
		content: "";
		display: block;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 50%;
		border-left: 0.2em solid #225560;
		transform: translateX(-50%) scale(0.5);
	}

	button:after {
		transform: translateX(-50%) scale(0.5) rotate(90deg);
	}

	button span {
		text-indent: -9em;
	}
</style>

<svelte:window on:pageshow={popState} />

<div class="cover">
	{#if waiting}
		<div in:fade={{ duration: 300, delay: 400 }} class="center">
			<div class="spinner" />
		</div>
	{:else}
		<button on:click={createRoom} class="center">
			<span>go</span>
		</button>
	{/if}
</div>
