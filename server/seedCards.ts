import { Card, Shape, FillStyle, Color } from "./db/card";

const seedCards = async (
  shapes: Array<Shape>,
  fills: Array<FillStyle>,
  colors: Array<Color>,
  numbers: Array<number>
) => {
  let existingCards = 0;
  for (const number of numbers) {
    for (const shape of shapes) {
      for (const fillStyle of fills) {
        for (const color of colors) {
          try {
            const cardExists = await Card.exists({
              shape,
              fillStyle,
              color,
              number,
            });
            if (cardExists) {
              existingCards += 1;
              continue;
            }
            await Card.create({ shape, fillStyle, color, number });
          } catch (err) {
            if (!(err.code === 11000 && err.name === "MongoError")) {
              throw err;
            }
          }
        }
      }
    }
  }
  console.log(
    `Created ${
      shapes.length * fills.length * colors.length * numbers.length -
      existingCards
    } new cards.`
  );
};

export { seedCards };
