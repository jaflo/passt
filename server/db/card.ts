import { getModelForClass, prop, index } from "@typegoose/typegoose";

enum Shape {
  SQUARE = "square",
  CIRCLE = "circle",
  TRIANGLE = "triangle",
}

enum FillStyle {
  EMPTY = "empty",
  LINED = "lined",
  FILLED = "filled",
}

enum Color {
  RED = "red",
  GREEN = "green",
  BLUE = "blue",
}

/**
 * The card class, from which the Card schema is defined by Typegoose.
 */
@index({ shape: 1, fillStyle: 1, color: 1, number: 1 }, { unique: true })
class CardClass {
  @prop({ required: true, enum: Shape })
  public shape!: Shape;

  @prop({ required: true, enum: FillStyle })
  public fillStyle!: FillStyle;

  @prop({ required: true, enum: Color })
  public color!: Color;

  @prop({ required: true, max: 3, min: 1 })
  public number!: number;
}

const Card = getModelForClass(CardClass);
export { Card, CardClass, Shape, FillStyle, Color };
