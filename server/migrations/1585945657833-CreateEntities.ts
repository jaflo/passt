import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEntities1585945657833 implements MigrationInterface {
	name = 'CreateEntities1585945657833';

	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "room" ("roomCode" character varying NOT NULL, "open" boolean NOT NULL DEFAULT false, "started" boolean NOT NULL DEFAULT false, "board" jsonb NOT NULL DEFAULT '[]', "availableCards" jsonb NOT NULL DEFAULT '[]', "lastActive" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ed1cf5b851e5b2893251111fd79" PRIMARY KEY ("roomCode"))`,
			undefined
		);
		await queryRunner.query(
			`CREATE TABLE "player" ("connectionId" character varying NOT NULL, "name" character varying NOT NULL, "points" integer NOT NULL DEFAULT 0, "lastActive" TIMESTAMP NOT NULL DEFAULT now(), "roomRoomCode" character varying, CONSTRAINT "PK_564f8521f0d5fd9ff86224cae9f" PRIMARY KEY ("connectionId"))`,
			undefined
		);
		await queryRunner.query(
			`ALTER TABLE "player" ADD CONSTRAINT "FK_00cadcbde9ab832c87dc54f1cc9" FOREIGN KEY ("roomRoomCode") REFERENCES "room"("roomCode") ON DELETE NO ACTION ON UPDATE NO ACTION`,
			undefined
		);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "player" DROP CONSTRAINT "FK_00cadcbde9ab832c87dc54f1cc9"`,
			undefined
		);
		await queryRunner.query(`DROP TABLE "player"`, undefined);
		await queryRunner.query(`DROP TABLE "room"`, undefined);
	}
}
