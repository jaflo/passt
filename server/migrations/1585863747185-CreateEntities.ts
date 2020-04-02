import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEntities1585863747185 implements MigrationInterface {
  name = 'CreateEntities1585863747185';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card" ADD "number" integer NOT NULL`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "UQ_0bc43d25eaa18fdcd14051757a5" UNIQUE ("shape", "fillStyle", "color", "number")`,
      undefined
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card" DROP CONSTRAINT "UQ_0bc43d25eaa18fdcd14051757a5"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "card" DROP COLUMN "number"`,
      undefined
    );
  }
}
