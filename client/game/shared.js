const cardStructure = {
	shape: ['square', 'circle', 'triangle'],
	fillStyle: ['empty', 'lined', 'filled'],
	color: ['red', 'green', 'blue'],
	number: [1, 2, 3],
};

export function areCardsEqual(a, b) {
	for (const property of Object.keys(cardStructure)) {
		if (a[property] !== b[property]) {
			return false;
		}
	}
	return true;
}

export function arrayContainsCard(list, card) {
	for (const current of list) {
		if (areCardsEqual(current, card)) {
			return true;
		}
	}
	return false;
}

function randomElement(list) {
	return list[Math.floor(Math.random() * list.length)];
}

export function randomCard() {
	let card = {};
	for (const property of Object.keys(cardStructure)) {
		card[property] = randomElement(cardStructure[property]);
	}
	return card;
}

export function generateSet(type) {
	// type is one of correct (default), random, almost
	if (type == 'random') {
		return [randomCard(), randomCard(), randomCard()];
	}
	let cards = [randomCard(), {}, {}];
	for (const property of Object.keys(cardStructure)) {
		if (Math.random() < 0.5) {
			cards[2][property] = cards[1][property] = cards[0][property];
		} else {
			const used = cardStructure[property].indexOf(cards[0][property]);
			const otherA = (used + 1) % 3;
			const otherB = (used + 2) % 3;
			cards[1][property] = cardStructure[property][otherA];
			cards[2][property] = cardStructure[property][otherB];
		}
	}
	if (type == 'almost') {
		for (let i = 0; i < Math.random() * 2; i++) {
			const wrongProp = randomElement(Object.keys(cardStructure));
			const wrongCard = randomElement(cards);
			const used = cardStructure[wrongProp].indexOf(wrongCard[wrongProp]);
			const wrongChoice = parseInt(used + Math.random() + 1) % 3;
			wrongCard[wrongProp] = cardStructure[wrongProp][wrongChoice];
		}
	}
	if (
		areCardsEqual(cards[0], cards[1]) ||
		areCardsEqual(cards[1], cards[2]) ||
		areCardsEqual(cards[0], cards[2])
	) {
		// has duplicated, try again
		return generateSet(type);
	} else {
		return cards;
	}
}

export function isValidPlay(cards) {
	if (cards.length != 3) return false;

	const [a, b, c] = cards;
	for (const property of Object.keys(cardStructure)) {
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
			return false;
		}
	}
	return true;
}

export function cardAsString(card) {
	let result = '';
	Object.keys(cardStructure).forEach(property => {
		result += card[property];
	});
	return result;
}

export function inPlaceReplace(before, after) {
	let final = [];
	before.forEach(card => {
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
	final = final.map(card => card || after.pop());
	// remove any placeholders that weren't filled
	final = final.filter(card => !!card);
	// add any remaining elements
	final = [...final, ...after];
	return final;
}

export function justCard(card) {
	let filtered = {};
	for (const property of Object.keys(cardStructure)) {
		filtered[property] = card[property];
	}
	return filtered;
}

export function hasModifierKey(e) {
	for (const modifier of ['Alt', 'Control', 'Meta', 'Shift']) {
		if (e.getModifierState(modifier)) {
			return true;
		}
	}
	return false;
}
