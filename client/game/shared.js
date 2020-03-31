export function areCardsEqual(a, b) {
	["shape", "fillStyle", "color", "number"].forEach(property => {
		if (a[property] !== b[property]) {
			return false;
		}
	});
	return true;
}
