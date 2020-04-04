<script>
	export let cards = [];

	import Card from "./Card.svelte";
	import { socket } from "../../connectivity.js";
	import { areCardsEqual, arrayContainsCard, isValidPlay } from "../shared.js";

	const keyboardMap = ["qwertyu", "asdfghj", "zxcvbnm"].map(line => line.split(""));
	const NUM_CARDS_FOR_PLAY = 3;

	function getKey(i) {
		if (i >= keyboardMap.length * keyboardMap[0].length) {
			return "";
		} else {
			return keyboardMap[i % 3][parseInt(i / 3)].toUpperCase();
		}
	}

	let selection = [];
	let isSubmitting = false;

	function cardClicked(e) {
		if (isSubmitting || selection.length >= NUM_CARDS_FOR_PLAY) {
			return;
		}
		const card = e.detail.card;
		if (arrayContainsCard(selection, card)) {
			selection = selection.filter(card => !areCardsEqual(card, e.detail.card));
		} else {
			selection = [...selection, card];
			if (selection.length == NUM_CARDS_FOR_PLAY) {
				isSubmitting = true;
				socket.emit("play", selection);
				// submit to server for check and broadcast
				// console.log(isValidPlay(selection));
				setTimeout(() => {
					selection = [];
					isSubmitting = false;
				}, 200); // after check
			}
		}
	}

	function handleKeydown(e) {
		if (["Backspace", "Escape", "Delete"].includes(e.code)) {
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
	{#each cards as card, i}
		<div class="card-wrapper">
			<Card {...card} selected={arrayContainsCard(selection, card)} on:click={cardClicked} letter={getKey(i)} />
		</div>
	{/each}
</div>
