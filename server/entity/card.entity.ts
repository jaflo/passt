import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: Shape,
    nullable: false,
  })
  shape!: Shape;

  @Column({
    type: 'enum',
    enum: FillStyle,
    nullable: false,
  })
  fillStyle!: FillStyle;

  @Column({
    type: 'enum',
    enum: Color,
    nullable: false,
  })
  color!: Color;
}
