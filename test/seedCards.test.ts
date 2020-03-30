import "mocha";
import assert from "assert";
import { Card, FillStyle, Color, Shape } from "../server/db/card";
import { seedCards } from "../server/seedCards";

import "./testSetup.test";

describe("seedCards", () => {
  it("should add every combination of the card attributes provided", async () => {
    const shapes = [Shape.CIRCLE, Shape.SQUARE, Shape.TRIANGLE];
    const fills = [FillStyle.EMPTY, FillStyle.FILLED, FillStyle.LINED];
    const colors = [Color.BLUE, Color.GREEN, Color.RED];
    const numbers = [1, 2, 3];
    await seedCards(shapes, fills, colors, numbers);
    assert.equal(
      await Card.countDocuments({}),
      shapes.length * fills.length * colors.length * numbers.length
    );
  });

  it("should only add the cards that are not already present in the database", async () => {
    // Seed the database with preliminary data, simulating incomplete database (which shouldn't happen)
    const shapes = [Shape.CIRCLE];
    const fills = [FillStyle.EMPTY];
    const colors = [Color.BLUE];
    const numbers = [1];
    await seedCards(shapes, fills, colors, numbers);
    assert.equal(
      await Card.countDocuments({}),
      shapes.length * fills.length * colors.length * numbers.length
    );

    // Now try with all data
    const fullShapes = [Shape.CIRCLE, Shape.SQUARE, Shape.TRIANGLE];
    const fullFills = [FillStyle.EMPTY, FillStyle.FILLED, FillStyle.LINED];
    const fullColors = [Color.BLUE, Color.GREEN, Color.RED];
    const fullNumbers = [1, 2, 3];

    await seedCards(fullShapes, fullFills, fullColors, fullNumbers);
    const expectedCount =
      fullShapes.length *
      fullFills.length *
      fullColors.length *
      fullNumbers.length;
    const actualCount = await Card.countDocuments({});
    const cards = await Card.find({}).sort([
      ["shape"],
      ["fillStyle"],
      ["color"],
      ["number"],
    ]);
    for (let i = 0; i < cards.length; ++i) {
      for (let j = i + 1; j < cards.length; ++j) {
        if (
          cards[i].color === cards[j].color &&
          cards[i].shape === cards[j].shape &&
          cards[i].fillStyle === cards[j].fillStyle &&
          cards[i].number === cards[j].number
        ) {
          console.error(cards[i], cards[j]);
        }
      }
    }
    assert.equal(actualCount, expectedCount);
  });
});
