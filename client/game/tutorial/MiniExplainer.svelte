<script>
	export let cards = [];

	import Alert from '../Alert.svelte';
	import TutorialBreakdown from './TutorialBreakdown.svelte';
	import {
		isValidPlay,
		cardStructure,
		orderedProperties,
	} from '../shared.js';
	import { simplifiedProperty, combinedCard } from './sharedTutorial.js';

	let explanations = [];

	orderedProperties.forEach(property => {
		const wrong = !isValidPlay(
			cards.map(card => simplifiedProperty(card, property))
		);
		if (wrong) {
			const values = cards.map(card => card[property]);
			const majority = values[0] == values[1] ? values[0] : values[2];
			explanations.push(
				`The ${property.replace('Style', '')}s are ${values.join(
					', '
				)}. All ${majority} or ${cardStructure[property].join(
					', '
				)} would be valid.`
			);
		}
	});
</script>

<style>
	.explanation {
		margin-top: 1em;
		text-align: left;
	}

	.explanation div {
		margin-top: 0.5em;
	}
</style>

<Alert on:dismiss continueText="Continue playing" timeout={2000}>
	<TutorialBreakdown {cards} resultScale={0.8} />
	{#if explanations.length > 0}
		<div class="explanation">
			{#each explanations as explanation}
				<div>{explanation}</div>
			{/each}
		</div>
	{/if}
</Alert>
