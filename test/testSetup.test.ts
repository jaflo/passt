import 'mocha';
import { createConnection, getConnection } from 'typeorm';

beforeEach(() => {
  return createConnection({
    type: 'postgres',
    database: ':memory:',
    dropSchema: true,
  });
});

afterEach(() => {
  const conn = getConnection();
  return conn.close();
});
