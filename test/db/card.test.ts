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
});
