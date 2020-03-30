import "mocha";
import mongoose from "mongoose";
import { seedCards } from "../server/seedCards";
import { Shape, FillStyle, Color } from "../server/db/card";

const OPTIONS: mongoose.ConnectionOptions = {
  useUnifiedTopology: true,
  useCreateIndex: true,
  useNewUrlParser: true,
  autoIndex: true,
  useFindAndModify: false,
};

beforeEach(async () => {
  const uri = process.env.TEST_MONGODB_URI;
  if (!uri) {
    throw new Error("Please set the TEST_MONGODB_URI environment variable.");
  }
  await mongoose.connect(uri, OPTIONS);
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

export const seedCardsForTest = async () => {
  const shapes = [Shape.CIRCLE, Shape.SQUARE, Shape.TRIANGLE];
  const fills = [FillStyle.EMPTY, FillStyle.FILLED, FillStyle.LINED];
  const colors = [Color.BLUE, Color.GREEN, Color.RED];
  const numbers = [1, 2, 3];
  await seedCards(shapes, fills, colors, numbers);
};
