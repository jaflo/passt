import '../testSetup.test';
import assert from 'assert';
import { Room, allCards } from '../../server/entity/room';

describe('Room', () => {
	let room: Room;
	describe('placeCardsOnBoard', () => {
		beforeEach(() => {
			room = new Room();
			room.roomCode = 'gobbledy';
			room.board = [];
			room.availableCards = allCards().slice(0, 5);
		});
		it('should place the provided number of cards on the board if possible', () => {
			const numCardsToDraw = 3;

			room.placeCardsOnBoard(numCardsToDraw);

			assert.strictEqual(room.board.length, numCardsToDraw);
		});

		it('should place the remaining available cards on the board if cannot take the provided number of cards', () => {
			const numCardsToDraw = Infinity;
			const oldAvailableCardsLength = room.availableCards.length;

			room.placeCardsOnBoard(numCardsToDraw);

			assert.strictEqual(room.board.length, oldAvailableCardsLength);
		});
	});
});
