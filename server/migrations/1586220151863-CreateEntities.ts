import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEntities1586220151863 implements MigrationInterface {
	name = 'CreateEntities1586220151863';

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "room" ("roomCode" character varying NOT NULL, "open" boolean NOT NULL DEFAULT false, "started" boolean NOT NULL DEFAULT false, "board" jsonb NOT NULL DEFAULT '[]', "availableCards" jsonb NOT NULL DEFAULT '[]', "lastActive" TIMESTAMP NOT NULL DEFAULT NOW(), CONSTRAINT "PK_ed1cf5b851e5b2893251111fd79" PRIMARY KEY ("roomCode"))`,
			undefined
		);
		await queryRunner.query(
			`CREATE TABLE "player" ("id" SERIAL NOT NULL, "connectionId" character varying NOT NULL, "name" character varying NOT NULL, "points" integer NOT NULL DEFAULT 0, "lastActive" TIMESTAMP NOT NULL DEFAULT NOW(), "connected" boolean NOT NULL DEFAULT true, "roomCode" character varying, CONSTRAINT "UQ_564f8521f0d5fd9ff86224cae9f" UNIQUE ("connectionId"), CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`,
			undefined
		);
		await queryRunner.query(
			`ALTER TABLE "player" ADD CONSTRAINT "FK_b22f09b2159cafa5131f535ed29" FOREIGN KEY ("roomCode") REFERENCES "room"("roomCode") ON DELETE NO ACTION ON UPDATE NO ACTION`,
			undefined
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "player" DROP CONSTRAINT "FK_b22f09b2159cafa5131f535ed29"`,
			undefined
		);
		await queryRunner.query(`DROP TABLE "player"`, undefined);
		await queryRunner.query(`DROP TABLE "room"`, undefined);
	}
}
