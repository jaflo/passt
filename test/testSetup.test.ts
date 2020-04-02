import 'mocha';
import { createConnection, getConnection } from 'typeorm';
import { Shape, FillStyle, Color, Card } from '../server/entity/card.entity';
import { seedCards } from '../server/seedCards';

beforeEach(async () => {
  const connection = await createConnection();
  const queryRunner = connection.createQueryRunner();
  await queryRunner.createDatabase('passtTest', true);
});

afterEach(async () => {
  const conn = getConnection();
  await conn.close();
});

export const setupCardsForTest = async () => {
  await seedCards();
};
