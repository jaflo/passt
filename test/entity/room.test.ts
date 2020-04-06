import '../testSetup.test';
import assert from 'assert';
import {
	Room,
	allCards,
	Card,
	Color,
	Shape,
	FillStyle,
} from '../../server/entity/room';

const DUMMY_BOARD: Card[] = [
	{
		color: Color.RED,
		shape: Shape.CIRCLE,
		fillStyle: FillStyle.EMPTY,
		number: 1,
	},
	{
		color: Color.BLUE,
		shape: Shape.SQUARE,
		fillStyle: FillStyle.FILLED,
		number: 2,
	},
	{
		color: Color.GREEN,
		shape: Shape.TRIANGLE,
		fillStyle: FillStyle.LINED,
		number: 3,
	},
];

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

	describe('cardsAreAllOnBoard', () => {
		it('should return true if all the provided cards are on the board', () => {
			const room = new Room();
			room.board = DUMMY_BOARD;

			assert.strictEqual(
				room.cardsAreAllOnBoard([DUMMY_BOARD[0], DUMMY_BOARD[1]]),
				true
			);
		});

		it('should return false if not all of the provided cards are on the board', () => {
			const room = new Room();
			room.board = DUMMY_BOARD;

			const cardNotOnBoard: Card = {
				color: Color.GREEN,
				shape: Shape.SQUARE,
				fillStyle: FillStyle.EMPTY,
				number: 1,
			};

			assert.strictEqual(
				room.cardsAreAllOnBoard([
					DUMMY_BOARD[0],
					DUMMY_BOARD[1],
					cardNotOnBoard,
				]),
				false
			);
		});
	});

	describe('removeCardsFromBoard', () => {
		it('should remove all of the provided cards from the board', () => {
			const room = new Room();
			room.board = DUMMY_BOARD;

			const cardsToRemove = [DUMMY_BOARD[0], DUMMY_BOARD[1]];
			room.removeCardsFromBoard(cardsToRemove);

			assert.strictEqual(room.board.length, 1);
		});

		it('should fail if any of the provided cards are not on the board', () => {
			const room = new Room();
			room.board = DUMMY_BOARD;

			const cardNotOnBoard: Card = {
				color: Color.GREEN,
				shape: Shape.SQUARE,
				fillStyle: FillStyle.EMPTY,
				number: 1,
			};
			const cardsToRemove = [DUMMY_BOARD[0], cardNotOnBoard];

			assert.throws(() => room.removeCardsFromBoard(cardsToRemove));
		});
	});
});
