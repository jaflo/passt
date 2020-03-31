<script>
	import Card from "./Card.svelte";
	import { createEventDispatcher } from "svelte";
	import { areCardsEqual } from "../shared.js";

	const dispatch = createEventDispatcher();

	let selection = [];

	function selectionChange(e) {
		if (e.detail.selected) {
			selection = [...selection, e.detail.card];
			if (selection.length == 3) {
				dispatch("play", {
					selection
				});
			}
		} else {
			selection = selection.filter(card => !areCardsEqual(card, e.detail.card));
		}
	}
</script>

{#each ['square', 'circle', 'triangle'] as shape}
	{#each ['empty', 'lined', 'solid'] as fillStyle}
		{#each ['red', 'green', 'blue'] as color}
			{#each [1, 2, 3] as number}
				<Card {shape} {fillStyle} {color} {number} on:click={selectionChange} />
			{/each}
		{/each}
	{/each}
{/each}
