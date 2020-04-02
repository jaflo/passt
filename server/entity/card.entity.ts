import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Unique,
} from 'typeorm';
import { Min, Max } from 'class-validator';

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
@Unique(['shape', 'fillStyle', 'color', 'number'])
export class Card extends BaseEntity {
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

  @Column({
    type: 'int',
    nullable: false,
  })
  @Min(1)
  @Max(3)
  number!: number;
}
