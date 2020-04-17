<script>
	export let redo = false;

	import { startRoom } from '../connectivity.js';

	const size = 60;
	const width = 6;
	const circumference = size * Math.PI;

	let allowed = !redo;

	if (!allowed) {
		setTimeout(() => (allowed = true), 5000);
	}

	function startGame() {
		if (!allowed) {
			return;
		}
		startRoom();
	}

	function handleKeydown(e) {
		if (['Enter', 'Space'].includes(e.code)) {
			startGame();
			e.preventDefault();
		}
	}
</script>

<style>
	.paused-wrapper {
		padding: 2em 0 4em 0;
		height: 100%;
		width: 100%;
		position: absolute;
	}

	.paused-wrapper.allowed {
		cursor: pointer;
	}

	@media only screen and (min-width: 800px) {
		.paused-wrapper {
			padding: 0;
		}
	}

	button {
		display: block;
		border: 0;
		background: none;
		margin: auto;
		position: relative;
		font-size: 0;
		cursor: inherit;
	}

	button .label {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		font-size: 16px;
		padding: 1em;
		text-transform: uppercase;
	}

	.arrow:after {
		content: '';
		display: block;
		width: 0;
		height: 0;
		border: 32px solid transparent;
		border-left: 56px solid var(--saturatedColor);
		border-right-width: 0;
	}

	.redo {
		animation: waiting-rotate 5s linear forwards;
	}

	@keyframes waiting-rotate {
		0% {
			transform: rotate(0);
		}
		80% {
			transform: rotate(360deg);
		}
		100% {
			transform: rotate(720deg);
		}
	}

	.redo .arrow {
		position: absolute;
		top: -4px;
		right: -25px;
		transform: scale(0.36) rotate(71deg);
		animation: waiting-show 5s linear forwards;
	}

	@keyframes waiting-show {
		0%,
		98% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	circle {
		stroke: var(--saturatedColor);
		animation: waiting-stroke 5s linear forwards;
	}

	@keyframes waiting-stroke {
		0% {
			stroke-dasharray: 0 0 0 0 0 999px;
		}
		80% {
			stroke-dasharray: 0 0 0 0 188px 999px;
		}
		90% {
			stroke-dasharray: 0 0 0 188px 188px 999px;
		}
		100% {
			stroke-dasharray: 0 16px 188px 188px 188px 999px;
		}
	}

	button.redo .label {
		opacity: 0;
		animation: waiting-fade-in 0.3s linear 5.3s forwards;
	}

	@keyframes waiting-fade-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>

<svelte:window on:keydown={handleKeydown} />

<div class="paused-wrapper center-contents" class:allowed on:click={startGame}>
	{#if redo}
		<button class="redo">
			<svg height={size} width={size}>
				<circle
					stroke-width={width}
					fill="none"
					r={(size - width) / 2}
					cx={size / 2}
					cy={size / 2} />
			</svg>
			<div class="arrow" />
			<span class="label">Restart</span>
		</button>
	{:else}
		<button class="arrow">
			<span class="label">Play</span>
		</button>
	{/if}
</div>
