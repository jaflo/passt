import { MongoMemoryServer } from 'mongodb-memory-server';
import 'mocha';
import assert from 'assert';
import mongoose from 'mongoose';
import { Card, FillStyle, Color, Shape } from '../../server/db/card';

const OPTIONS: mongoose.ConnectionOptions = { useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true }
let mongoServer: MongoMemoryServer | undefined;

before(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri, OPTIONS);
});

after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

describe('Card', () => {
    it('should be unique in the database', async () => {
        await Card.create({ fillStyle: FillStyle.EMPTY, color: Color.BLUE, shape: Shape.CIRCLE, number: 1 });
        try {
            await Card.create({ fillStyle: FillStyle.EMPTY, color: Color.BLUE, shape: Shape.CIRCLE, number: 1 });
        } catch (err) {
            assert.equal(err.name, 'MongoError');
            assert.equal(err.code, 11000);
        } finally {
            const count = await Card.countDocuments({});
            assert.equal(count, 1);
        }
    });
});