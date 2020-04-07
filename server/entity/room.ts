import { Entity, Column, OneToMany, BaseEntity, PrimaryColumn } from 'typeorm';
import { Player } from './player';
import { findSetIn } from '../shared';

export enum Shape {
	SQUARE = 'square',
	CIRCLE = 'circle',
	TRIANGLE = 'triangle',
}

export enum FillStyle {
	EMPTY = 'empty',
	LINED = 'lined',
	FILLED = 'filled',
}

export enum Color {
	RED = 'red',
	GREEN = 'green',
	BLUE = 'blue',
}

export interface Card {
	shape: Shape;
	fillStyle: FillStyle;
	color: Color;
	number: number;
}

export const cardsAreEqual = (a: Card, b: Card) =>
	a.color === b.color &&
	a.fillStyle === b.fillStyle &&
	a.number === b.number &&
	a.shape === b.shape;

export const allCards = (
	shapes = [Shape.CIRCLE, Shape.SQUARE, Shape.TRIANGLE],
	colors = [Color.BLUE, Color.GREEN, Color.RED],
	fillStyles = [FillStyle.EMPTY, FillStyle.FILLED, FillStyle.LINED],
	numbers = [1, 2, 3]
) => {
	const allCards: Card[] = [];
	for (const shape of shapes) {
		for (const color of colors) {
			for (const fillStyle of fillStyles) {
				for (const num of numbers) {
					allCards.push({ shape, fillStyle, color, number: num });
				}
			}
		}
	}
	return allCards;
};

@Entity()
export class Room extends BaseEntity {
	@PrimaryColumn({ type: 'varchar' })
	roomCode!: string;

	@Column({ type: 'boolean', nullable: false, default: false })
	open!: boolean;

	@Column({ type: 'boolean', nullable: false, default: false })
	started!: boolean;

	@OneToMany(
		() => Player,
		player => player.room,
		{ eager: true }
	)
	players!: Player[];

	@Column({ type: 'jsonb', default: [] })
	board!: Card[];

	@Column({ type: 'jsonb', default: [] })
	availableCards!: Card[];

	@Column({
		default: () => 'NOW()',
	})
	lastActive!: Date;

	/**
	 * Takes up to "numCardsToDraw" from "availableCards" and places them on "board". Does not save.
	 * @param numCardsToDraw The number of cards to move from "availableCards" to "board"
	 */
	placeCardsOnBoard(numCardsToDraw: number): void {
		const { availableCards } = this;
		numCardsToDraw = Math.min(numCardsToDraw, availableCards.length);
		const drawnCards = availableCards.splice(0, numCardsToDraw);

		this.board.push(...drawnCards);
		this.availableCards = availableCards;
	}

	/**
	 * Checks to see if the provided cards are on the board
	 * @param providedCards The cards to look for on the board
	 */
	cardsAreAllOnBoard(providedCards: Card[]): boolean {
		return providedCards
			.map(providedCard =>
				this.board.find(boardCard =>
					cardsAreEqual(providedCard, boardCard)
				)
			)
			.every(match => match !== undefined);
	}

	/**
	 * Removes all of the provided cards from the board. If a provided card isn't on the board, skips that card.
	 * @param providedCards The cards to remove from the board
	 */
	removeCardsFromBoard(providedCards: Card[]): void {
		if (!this.cardsAreAllOnBoard(providedCards)) {
			throw new Error('Not all of the provided cards are on the board!');
		}
		this.board = this.board.filter(
			boardCard =>
				providedCards.find(providedCard =>
					cardsAreEqual(providedCard, boardCard)
				) === undefined
		);
	}

	/**
	 * If no sets can be created from any of the cards that are in play now (or could be in play by drawing).
	 */
	cantPlayAnotherMove(): boolean {
		return findSetIn(...this.board.concat(this.availableCards)) === null;
	}
}
