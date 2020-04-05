const cardStructure = {
	shape: ['square', 'circle', 'triangle'],
	fillStyle: ['empty', 'lined', 'filled'],
	color: ['red', 'green', 'blue'],
	number: [1, 2, 3],
};

export function areCardsEqual(a, b) {
	let isSame = true;
	Object.keys(cardStructure).forEach((property) => {
		if (a[property] !== b[property]) {
			isSame = false;
			return;
		}
	});
	return isSame;
}

export function arrayContainsCard(list, card) {
	let doesContain = false;
	list.forEach((current) => {
		if (areCardsEqual(current, card)) {
			doesContain = true;
			return;
		}
	});
	return doesContain;
}

function randomElement(list) {
	return list[Math.floor(Math.random() * list.length)];
}

export function randomCard() {
	let card = {};
	Object.keys(cardStructure).forEach((property) => {
		card[property] = randomElement(cardStructure[property]);
	});
	return card;
}

export function isValidPlay(cards) {
	if (cards.length != 3) return false;

	let isValid = true;
	const [a, b, c] = cards;
	Object.keys(cardStructure).forEach((property) => {
		// written this way for easier understanding
		if (a[property] === b[property] && b[property] === c[property]) {
			// a = b = c, we good
		} else if (
			a[property] !== b[property] &&
			b[property] !== c[property] &&
			a[property] !== c[property]
		) {
			// a != b != c, we good
		} else {
			isValid = false;
			return;
		}
	});
	return isValid;
}

export function cardAsString(card) {
	let result = '';
	Object.keys(cardStructure).forEach((property) => {
		result += card[property];
	});
	return result;
}

export function inPlaceReplace(before, after) {
	let final = [];
	before.forEach((card) => {
		// is the card still there?
		let index = -1;
		after.forEach((current, i) => {
			if (areCardsEqual(current, card)) {
				index = i;
				return;
			}
		});
		if (index > -1) {
			// keep the card
			final.push(card);
			// we used it, so remove from after
			after.splice(index, 1);
		} else {
			// put in a placeholder to replace later
			final.push(null);
		}
	});
	// replace all placeholders with new elements
	final = final.map((card) => card || after.pop());
	// add any remaining elements
	final = [...final, ...after];
	return final;
}
