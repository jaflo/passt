import "mocha";
import mongoose from "mongoose";

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
