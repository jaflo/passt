<script>
	export let cards = [];

	import Card from "./Card.svelte";
	import { createEventDispatcher } from "svelte";
	import { areCardsEqual, arrayContainsCard, isValidPlay } from "../shared.js";

	const dispatch = createEventDispatcher();

	let selection = [];

	function cardClicked(e) {
		const card = e.detail.card;
		if (arrayContainsCard(selection, card)) {
			selection = selection.filter(card => !areCardsEqual(card, e.detail.card));
		} else {
			selection = [...selection, card];
			if (selection.length == 3) {
				dispatch("play", {
					selection
				});
				// submit to server for check and broadcast
				console.log(isValidPlay(selection));
				setTimeout(() => (selection = []), 200); // after check
			}
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

<div class="center-wide board">
	{#each cards as card}
		<div class="card-wrapper">
			<Card {...card} selected={arrayContainsCard(selection, card)} on:click={cardClicked} />
		</div>
	{/each}
</div>
