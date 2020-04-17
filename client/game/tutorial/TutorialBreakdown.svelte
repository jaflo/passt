<script>
	export let cards;
	export let resultScale = 1;

	import CardSymbol from '../board/CardSymbol.svelte';
	import TutorialEquality from './TutorialEquality.svelte';
	import { areCardsEqual, isValidPlay } from '../shared.js';

	const properties = ['shape', 'fillStyle', 'number', 'color']; // order matters so not pulled from shared.js

	for (const i of [1, 2, 1]) {
		for (const property of properties) {
			// A != B != A
			if (
				cards[0][property] == cards[2][property] &&
				cards[0][property] != cards[1][property]
			) {
				const flip = cards[0];
				cards[0] = cards[i];
				cards[i] = flip;
			}
		}
	}

	const defaultCard = {
		shape: 'circle',
		fillStyle: 'empty',
		color: '#2e282a', // var(--textColor)
		number: 1,
	};

	function combinedCard(card) {
		return { ...defaultCard, ...card };
	}

	function simplifiedProperty(card, property) {
		let isolated = {};
		isolated[property] = card[property];
		if (property != 'fillStyle') {
			isolated['fillStyle'] = 'filled';
		}
		return combinedCard(isolated);
	}
</script>

<style>
	table {
		text-align: center;
		border-spacing: 0;
		border: 0;
		width: 100%;
		box-sizing: border-box;
	}

	.equality {
		font-size: 1.5em;
		width: 1em;
	}

	.combined {
		position: relative;
		width: 60px;
		height: 60px;
	}

	.property {
		position: relative;
		height: 32px;
	}

	.symbol {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 80px;
		height: 80px;
		transform: scale(0.4) translate(-50%, -50%);
		transform-origin: top left;
	}

	.result {
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
</style>

<table>
	<tbody>
		{#each properties as property, i}
			<tr>
				{#each cards as card, i}
					<td class="property">
						{#if property == 'number'}
							{card[property] || 1}
						{:else}
							<div class="symbol">
								<CardSymbol
									{...simplifiedProperty(card, property)} />
							</div>
						{/if}
					</td>
					<td class="equality">
						{#if i < cards.length - 1}
							<TutorialEquality
								equal={card[property] == cards[i + 1][property]} />
						{/if}
					</td>
				{/each}
				<td class="result">
					{#if !isValidPlay(cards.map(card =>
							simplifiedProperty(card, property)
						))}
						no
					{/if}
				</td>
			</tr>
		{/each}
		<tr class="main">
			{#each cards as card, i}
				<td class="combined" style="transform:scale({resultScale})">
					<CardSymbol {...combinedCard(card)} />
				</td>
				<td />
			{/each}
			<td class="result">{isValidPlay(cards) ? 'yes' : 'no'}</td>
		</tr>
	</tbody>
</table>
