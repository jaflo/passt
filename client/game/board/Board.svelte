<script>
	export let cards = [];

	import Card from './Card.svelte';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { scale, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { socket } from '../../connectivity.js';
	import { areCardsEqual, arrayContainsCard } from '../shared.js';

	const keyboardMap = ['qwertyu', 'asdfghj', 'zxcvbnm'].map(line =>
		line.split('')
	);
	const NUM_CARDS_FOR_PLAY = 3;

	function getKey(i) {
		if (i >= keyboardMap.length * keyboardMap[0].length) {
			return '';
		} else {
			return keyboardMap[i % 3][parseInt(i / 3)].toUpperCase();
		}
	}

	let selection = [];
	let isSubmitting = false;
	let selectionDeselectClearSteps = 2;

	function attemptSelectionClear() {
		selectionDeselectClearSteps--;
		if (selectionDeselectClearSteps == 0) {
			selection = [];
			isSubmitting = false;
			selectionDeselectClearSteps = 2;
		}
	}

	function cardClicked(e) {
		if (isSubmitting || selection.length >= NUM_CARDS_FOR_PLAY) {
			return;
		}
		const card = e.detail.card;
		if (arrayContainsCard(selection, card)) {
			selection = selection.filter(
				card => !areCardsEqual(card, e.detail.card)
			);
		} else {
			selection = [...selection, card];
			if (selection.length == NUM_CARDS_FOR_PLAY) {
				isSubmitting = true;
				socket.emit('play', {
					cards: selection,
				});
				setTimeout(attemptSelectionClear, 300);
			}
		}
	}

	socket.on('movePlayed', attemptSelectionClear);

	function handleKeydown(e) {
		if (['Backspace', 'Escape', 'Delete'].includes(e.code)) {
			selection = [];
		}
	}
</script>

<style>
	.board {
		margin: auto;
		font-size: 0;
		width: 360px;
		padding: 12px 12px 0 0;
		text-align: center;
		box-sizing: border-box;
	}

	.card-wrapper {
		margin: 0 0 12px 12px;
		display: inline-block;
	}

	@media only screen and (min-width: 500px) {
		.board {
			width: 100%;
			height: 390px;
			display: inline-flex;
			flex-direction: column;
			flex-wrap: wrap;
			align-items: flex-start;
			align-content: center;
			padding: 20px 20px 0 0;
		}

		.card-wrapper {
			margin: 0 0 20px 20px;
		}
	}
</style>

<svelte:window on:keydown={handleKeydown} />
<div class="center-wide board">
	{#each cards as card, i (card.id)}
		<div animate:flip={{ duration: 200 }}>
			<div
				class="card-wrapper"
				in:fly={{ y: 30, opacity: 0, duration: 300, easing: cubicOut }}
				out:fly={{ y: -30, opacity: 0, duration: 300, easing: cubicOut }}>
				<Card
					{...card}
					selected={arrayContainsCard(selection, card)}
					on:click={cardClicked}
					letter={getKey(i)} />
			</div>
		</div>
	{/each}
</div>
