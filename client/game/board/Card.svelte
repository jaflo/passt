<script>
	export let shape, fillStyle, color, number;
	export let letter = "A";
	export let selected = false;

	import CardShape from "./CardShape.svelte";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();
	const countToSize = [50, 30, 30];
	$: humanReadable = number + " " + color + " " + fillStyle + " " + shape + (number == 1 ? "" : "s");

	function click() {
		selected = !selected;

		dispatch("click", {
			selected,
			card: {
				shape,
				fillStyle,
				color,
				number
			}
		});
	}
</script>

<style>
	.card {
		width: 100px;
		height: 100px;
		display: inline-block;
		border: 1px solid rgba(0, 0, 0, 0.1);
		margin: 1em;
		position: relative;
		cursor: pointer;
		border-radius: 0.3em;
		transition: all 0.2s ease-in-out;
		background: rgba(255, 255, 255, 0.3);
	}

	.card:hover {
		box-shadow: 0 1em 2em rgba(0, 0, 0, 0.1);
		transform: translateY(-0.2em);
		border-color: rgba(0, 0, 0, 0.2);
	}

	.shape {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.card.count-2 .shape:nth-child(1) {
		transform: translate(0%, -90%) rotate(180deg);
	}
	.card.count-2 .shape:nth-child(2) {
		transform: translate(-100%, -10%);
	}

	.card.count-3 .shape:nth-child(1) {
		transform: translate(-50%, -100%);
	}
	.card.count-3 .shape:nth-child(2) {
		transform: translate(-110%, 0%);
	}
	.card.count-3 .shape:nth-child(3) {
		transform: translate(10%, 0%);
	}

	.letter {
		position: absolute;
		top: 0;
		left: 0;
		padding: 0.5em;
		opacity: 0.5;
		min-width: 1em;
		text-align: center;
	}

	.selection-border {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		border-radius: 0.3em;
	}

	.selected .selection-border {
		animation: glow ease-in-out 1s infinite alternate;
	}

	@keyframes glow {
		from {
			box-shadow: 0 0 0 0.3em #0cce6b, 0 0.2em 1em #0cce6b;
		}
		to {
			box-shadow: 0 0 0 0.3em #05668d, 0 0 0 #05668d;
		}
	}
</style>

<div class="card count-{number}" class:selected title={humanReadable} on:click={click}>
	{#each Array(number) as _}
		<div class="shape">
			<CardShape {shape} {fillStyle} {color} size={countToSize[number - 1]} />
		</div>
	{/each}
	<div class="letter">{letter}</div>
	<div class="selection-border" />
</div>
