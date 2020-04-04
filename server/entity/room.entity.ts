import {
  Entity,
  Column,
  UpdateDateColumn,
  OneToMany,
  BaseEntity,
  PrimaryColumn,
} from 'typeorm';
import { Player } from './player.entity';

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
    type => Player,
    player => player.room,
    { eager: true }
  )
  players!: Player[];

  @Column({ type: 'jsonb', default: [] })
  board!: Card[];

  @Column({ type: 'jsonb', default: [] })
  availableCards!: Card[];

  @UpdateDateColumn({
    nullable: false,
  })
  lastActive!: Date;
}
