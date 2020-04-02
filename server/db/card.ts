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

  public static isASet(...cards: CardClass[]) {
    const allSameOrAllDifferent = (elems: any[]): boolean => {
      const setRepresentation = new Set(elems);
      return (
        setRepresentation.size === 1 || setRepresentation.size === elems.length
      );
    };

    const colors = cards.map((c) => c.color);
    const fillStyles = cards.map((c) => c.fillStyle);
    const numbers = cards.map((c) => c.number);
    const shapes = cards.map((c) => c.shape);

    return [colors, fillStyles, numbers, shapes].every(allSameOrAllDifferent);
  }

  public static findSetIn(
    ...cards: CardClass[]
  ): [CardClass, CardClass, CardClass] | null {
    if (cards.length < 3) {
      return null;
    }
    for (let i = 0; i < cards.length; ++i) {
      for (let j = i + 1; j < cards.length; ++j) {
        for (let k = j + 1; k < cards.length; ++k) {
          if (Card.isASet(cards[i], cards[j], cards[k])) {
            return [cards[i], cards[j], cards[k]];
          }
        }
      }
    }
    return null;
  }
}

const Card = getModelForClass(CardClass);
export { Card, CardClass, Shape, FillStyle, Color };
