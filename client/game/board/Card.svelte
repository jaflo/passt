<script>
	export let shape, fillStyle, color, number;
	export let letter = '';
	export let selected = false;
	export let hoverable = false;

	import CardSymbol from './CardSymbol.svelte';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { arrayContainsCard, hasModifierKey } from '../shared.js';

	const dispatch = createEventDispatcher();
	let humanReadable =
		number +
		' ' +
		color +
		' ' +
		fillStyle +
		' ' +
		shape +
		(number == 1 ? '' : 's');

	function click() {
		dispatch('click', {
			card: {
				shape,
				fillStyle,
				color,
				number,
			},
		});
	}

	function handleKeydown(e) {
		if (e.code == 'Key' + letter && !hasModifierKey(e)) {
			click();
			e.preventDefault();
		}
	}
</script>

<style>
	.card {
		font-size: 16px;
		width: 100px;
		height: 100px;
		display: inline-block;
		border: 1px solid rgba(0, 0, 0, 0.1);
		position: relative;
		cursor: pointer;
		border-radius: 0.3em;
		transition: all 0.2s ease-in-out;
		background: var(--cardBgColor);
	}

	.card.hoverable:hover {
		box-shadow: 0 1em 2em rgba(0, 0, 0, 0.1);
		transform: translateY(-0.2em);
		border-color: rgba(0, 0, 0, 0.2);
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

	@media only screen and (max-width: 500px) {
		.letter {
			display: none;
		}
	}

	.selection-border {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		border-radius: 0.3em;
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

<svelte:window on:keydown={handleKeydown} />

<div class="card" class:hoverable aria-label={humanReadable} on:click={click}>
	<CardSymbol {shape} {fillStyle} {color} {number} />
	<div class="letter">{letter}</div>
	{#if selected}
		<div in:fade={{ duration: 100 }} out:fade={{ duration: 200 }}>
			<div class="selection-border" />
		</div>
	{/if}
</div>
