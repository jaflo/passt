import { Color, Shape, FillStyle, Card } from './entity/card.entity';

export const seedCards = async () => {
  const colors = [Color.BLUE, Color.GREEN, Color.RED];
  const shapes = [Shape.CIRCLE, Shape.SQUARE, Shape.TRIANGLE];
  const fillStyles = [FillStyle.EMPTY, FillStyle.LINED, FillStyle.FILLED];
  const numbers = [1, 2, 3];

  for (const color of colors) {
    for (const shape of shapes) {
      for (const fillStyle of fillStyles) {
        for (const num of numbers) {
          const card = new Card();
          card.color = color;
          card.shape = shape;
          card.fillStyle = fillStyle;
          card.number = num;
          try {
            await card.save();
          } catch (err) {
            if (err.name === 'QueryFailedError' && err.code === '23505') {
              continue;
            }
            throw err;
          }
        }
      }
    }
  }
};
