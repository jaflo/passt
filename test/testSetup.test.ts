import { MongoMemoryServer } from 'mongodb-memory-server';
import 'mocha';
import mongoose from 'mongoose';

const OPTIONS: mongoose.ConnectionOptions = { useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true, autoIndex: true }
let mongoServer: MongoMemoryServer | undefined;

beforeEach(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri, OPTIONS);
});

afterEach(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});
