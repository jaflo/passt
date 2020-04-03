import 'mocha';
import { createConnection, getConnection } from 'typeorm';
import { seedCards } from '../server/seedCards';

beforeEach(async () => {
  await createConnection();
});

afterEach(async () => {
  const conn = getConnection();
  await conn.close();
});

export const setupCardsForTest = async () => {
  await seedCards();
};
