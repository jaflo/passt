import "mocha";
import assert from "assert";
import { Card, FillStyle, Color, Shape } from "../../server/db/card";

import "../testSetup.test";

describe("Card", () => {
  it("should be unique in the database", async () => {
    const indexes = await Card.collection.getIndexes();
    await Card.create({
      fillStyle: FillStyle.EMPTY,
      color: Color.BLUE,
      shape: Shape.CIRCLE,
      number: 1,
    });
    try {
      await Card.create({
        fillStyle: FillStyle.EMPTY,
        color: Color.BLUE,
        shape: Shape.CIRCLE,
        number: 1,
      });
    } catch (err) {
      assert.equal(err.name, "MongoError");
      assert.equal(err.code, 11000);
    } finally {
      const count = await Card.countDocuments({});
      assert.equal(count, 1);
    }
  });

  describe("isASet", () => {
    it("should be true when the cards form a set", async () => {
      const cards = [
        await Card.create({
          fillStyle: FillStyle.EMPTY,
          color: Color.BLUE,
          shape: Shape.CIRCLE,
          number: 1,
        }),
        await Card.create({
          fillStyle: FillStyle.EMPTY,
          color: Color.BLUE,
          shape: Shape.CIRCLE,
          number: 2,
        }),
        await Card.create({
          fillStyle: FillStyle.EMPTY,
          color: Color.BLUE,
          shape: Shape.CIRCLE,
          number: 3,
        }),
      ];
      assert.equal(Card.isASet(...cards), true);
    });
    it("should be false when the cards don't form a set", async () => {
      const cards = [
        await Card.create({
          fillStyle: FillStyle.EMPTY,
          color: Color.BLUE,
          shape: Shape.CIRCLE,
          number: 1,
        }),
        await Card.create({
          fillStyle: FillStyle.LINED,
          color: Color.BLUE,
          shape: Shape.CIRCLE,
          number: 1,
        }),
        await Card.create({
          fillStyle: FillStyle.EMPTY,
          color: Color.BLUE,
          shape: Shape.CIRCLE,
          number: 3,
        }),
      ];
      assert.equal(Card.isASet(...cards), false);
    });
  });

  describe("containsASet", () => {
    it("should be true when the cards contain a set", async () => {
      const cards = [
        await Card.create({
          fillStyle: FillStyle.EMPTY,
          color: Color.RED,
          shape: Shape.TRIANGLE,
          number: 2,
        }),
        await Card.create({
          fillStyle: FillStyle.EMPTY,
          color: Color.RED,
          shape: Shape.TRIANGLE,
          number: 3,
        }),
        await Card.create({
          fillStyle: FillStyle.FILLED,
          color: Color.BLUE,
          shape: Shape.CIRCLE,
          number: 2,
        }),
        await Card.create({
          fillStyle: FillStyle.LINED,
          color: Color.GREEN,
          shape: Shape.SQUARE,
          number: 2,
        }),
      ];
      assert.equal(Card.containsASet(...cards), true);
    });

    it("should be false when the cards don't contain a set", async () => {
      const cards = [
        await Card.create({
          fillStyle: FillStyle.EMPTY,
          color: Color.RED,
          shape: Shape.TRIANGLE,
          number: 1,
        }),
        await Card.create({
          fillStyle: FillStyle.EMPTY,
          color: Color.RED,
          shape: Shape.TRIANGLE,
          number: 2,
        }),
        await Card.create({
          fillStyle: FillStyle.LINED,
          color: Color.RED,
          shape: Shape.TRIANGLE,
          number: 3,
        }),
        await Card.create({
          fillStyle: FillStyle.EMPTY,
          color: Color.GREEN,
          shape: Shape.CIRCLE,
          number: 1,
        }),
      ];
      assert.equal(Card.containsASet(...cards), false);
    });
  });
});
