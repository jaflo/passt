import 'mocha';
import { createConnection, getConnection } from 'typeorm';

beforeEach(async () => {
  const connection = await createConnection();
  const queryRunner = connection.createQueryRunner();
  await queryRunner.createDatabase("passtTest", true);
});

afterEach(() => {
  const conn = getConnection();
  return conn.close();
});
