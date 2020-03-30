import { Card, Shape, FillStyle, Color } from './db/card';

const seedCards = async () => {
    const shapes = [Shape.CIRCLE, Shape.SQUARE, Shape.TRIANGLE];
    const fills = [FillStyle.EMPTY, FillStyle.LINED, FillStyle.FILLED];
    const colors = [Color.BLUE, Color.GREEN, Color.RED];
    const numbers = [1, 2, 3];
    let alreadyExisting = 0;
    for (const number of numbers) {
        for (const shape of shapes) {
            for (const fillStyle of fills) {
                for (const color of colors) {
                    try {
                        await Card.create({ shape, fillStyle, color, number });
                    } catch (err) {
                        if (!(err.code === 11000 && err.name === 'MongoError')) {
                            throw err;
                        }
                        alreadyExisting += 1;
                    }
                }
            }
        }
    }
    console.log(`Created ${(numbers.length * shapes.length * fills.length * colors.length) - alreadyExisting} new cards.`);
}

export { seedCards };