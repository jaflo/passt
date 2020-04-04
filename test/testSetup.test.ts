import 'mocha';
import { createConnection, getConnection } from 'typeorm';

beforeEach(async () => {
  await createConnection();
});

afterEach(async () => {
  const conn = getConnection();
  await conn.close();
});
