<script>
	export let cards = [];
	export let disabled = false;

	import Card from './Card.svelte';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { scale, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import socket from '../../socket.js';
	import { playCards } from '../../connectivity.js';
	import {
		areCardsEqual,
		arrayContainsCard,
		justCard,
		isValidPlay,
	} from '../shared.js';

	const dispatch = createEventDispatcher();
	const keyboardMap = ['qwertyu', 'asdfghj', 'zxcvbnm'].map(line =>
		line.split('')
	);
	const NUM_CARDS_FOR_PLAY = 3;
	const EXPLAIN_MISPLAY = 5;

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
	let incorrectStreak = EXPLAIN_MISPLAY - 2; // allow two  misplays before explaining
	let hoverable = false;

	function attemptSelectionClear() {
		selectionDeselectClearSteps--;
		if (selectionDeselectClearSteps == 0) {
			selection = [];
			isSubmitting = false;
			selectionDeselectClearSteps = 2;
		}
	}

	function cardClicked(e) {
		if (
			isSubmitting ||
			selection.length >= NUM_CARDS_FOR_PLAY ||
			disabled
		) {
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
				if (isValidPlay(selection)) {
					incorrectStreak = 0;
				} else {
					incorrectStreak++;
					if (incorrectStreak > EXPLAIN_MISPLAY) {
						dispatch('misplay', {
							count: incorrectStreak,
							cards: selection,
						});
					}
				}
				playCards(selection);
				setTimeout(attemptSelectionClear, 300);
			}
		}
	}

	function movePlayed(data) {
		if (data.player.connectionId == socket.id) {
			attemptSelectionClear();
		} else if (data.updated) {
			selection = selection.filter(
				card => !arrayContainsCard(data.cards, card)
			);
		}
	}
	socket.on('movePlayed', movePlayed);

	function exception(data) {
		if (isSubmitting && data.includes('Error')) {
			attemptSelectionClear();
		}
	}
	socket.on('exception', exception);

	function handleKeydown(e) {
		if (['Backspace', 'Escape', 'Delete'].includes(e.code)) {
			selection = [];
			e.preventDefault();
		}
		doesNotSupportHover();
	}

	function supportsHover() {
		hoverable = true;
	}

	function doesNotSupportHover() {
		hoverable = false;
	}

	function cardDelay(i) {
		const dist = Math.sqrt(
			Math.pow(parseInt(i / 3), 2) + Math.pow((i % 3) - 3, 2)
		);
		return dist * 50;
	}

	onDestroy(() => {
		socket.off('movePlayed', movePlayed);
		socket.off('exception', exception);
	});
</script>

<style>
	.board {
		display: inline-flex;
		flex-wrap: wrap;
		margin: auto;
		font-size: 0;
		width: 360px;
		padding: 12px 12px 0 0;
		box-sizing: border-box;
		color: var(--textColor);
	}

	.card-wrapper {
		margin: 0 0 12px 12px;
	}

	@media only screen and (min-width: 500px) {
		.board {
			flex-direction: column;
			align-content: center;
			width: 100%;
			height: 390px;
			padding: 20px 20px 0 0;
		}

		.card-wrapper {
			margin: 0 0 20px 20px;
		}
	}
</style>

<svelte:window
	on:keydown={handleKeydown}
	on:mousemove={supportsHover}
	on:touchstart={doesNotSupportHover} />

<div class="board">
	{#each cards as card, i (card.id)}
		<div class="card-wrapper" animate:flip={{ duration: 200 }}>
			<div
				in:fly={{ y: 30, duration: 300, delay: cardDelay(i) }}
				out:fly={{ y: -30, duration: 300, delay: cardDelay(i) }}>
				<Card
					{...justCard(card)}
					{hoverable}
					selected={arrayContainsCard(selection, card)}
					on:click={cardClicked}
					letter={getKey(i)} />
			</div>
		</div>
	{/each}
</div>
