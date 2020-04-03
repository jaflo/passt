import { Card } from './entity/card.entity';

export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,
    temporaryValue: T,
    randomIndex: number;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/**
 * Compares the attributes of the provided cards, and determines if a set exists between them.
 * @param cards The cards that may or may not make a set
 */
export const isASet = (...cards: Card[]) => {
  const allSameOrAllDifferent = <T>(elems: T[]): boolean => {
    const setRepresentation = new Set(elems);
    return (
      setRepresentation.size === 1 || setRepresentation.size === elems.length
    );
  };

  const colors = cards.map(c => c.color);
  const fillStyles = cards.map(c => c.fillStyle);
  const numbers = cards.map(c => c.number);
  const shapes = cards.map(c => c.shape);

  return [colors, fillStyles, numbers, shapes].every(allSameOrAllDifferent);
};

/**
 * Determines whether a set exists within the provided group of {@link Cards}s.
 * @param cards The cards to look for a set in.
 */
export const findSetIn = (...cards: Card[]): [Card, Card, Card] | null => {
  const numCards = cards.length;
  if (numCards < 3) {
    return null;
  }
  for (let i = 0; i < numCards; ++i) {
    for (let j = i + 1; j < numCards; ++j) {
      for (let k = j + 1; k < numCards; ++k) {
        if (isASet(cards[i], cards[j], cards[k])) {
          return [cards[i], cards[j], cards[k]];
        }
      }
    }
  }
  return null;
};
