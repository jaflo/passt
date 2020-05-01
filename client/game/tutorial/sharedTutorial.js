export function simplifiedProperty(card, property) {
	let isolated = {};
	isolated[property] = card[property];
	if (property != 'fillStyle') {
		isolated['fillStyle'] = 'filled';
	}
	return combinedCard(isolated);
}

const defaultCard = {
	shape: 'circle',
	fillStyle: 'empty',
	color: '#2e282a', // var(--textColor)
	number: 1,
};

export function combinedCard(card) {
	return { ...defaultCard, ...card };
}
