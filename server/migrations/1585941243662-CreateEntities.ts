import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateEntities1585941243662 implements MigrationInterface {
    name = 'CreateEntities1585941243662'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "card_shape_enum" AS ENUM('square', 'circle', 'triangle')`, undefined);
        await queryRunner.query(`CREATE TYPE "card_fillstyle_enum" AS ENUM('empty', 'lined', 'filled')`, undefined);
        await queryRunner.query(`CREATE TYPE "card_color_enum" AS ENUM('red', 'green', 'blue')`, undefined);
        await queryRunner.query(`CREATE TABLE "card" ("id" SERIAL NOT NULL, "shape" "card_shape_enum" NOT NULL, "fillStyle" "card_fillstyle_enum" NOT NULL, "color" "card_color_enum" NOT NULL, "number" integer NOT NULL, CONSTRAINT "UQ_0bc43d25eaa18fdcd14051757a5" UNIQUE ("shape", "fillStyle", "color", "number"), CONSTRAINT "PK_9451069b6f1199730791a7f4ae4" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "room" ("roomCode" character varying NOT NULL, "open" boolean NOT NULL DEFAULT false, "started" boolean NOT NULL DEFAULT false, "lastActive" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ed1cf5b851e5b2893251111fd79" PRIMARY KEY ("roomCode"))`, undefined);
        await queryRunner.query(`CREATE TABLE "player" ("connectionId" character varying NOT NULL, "name" character varying NOT NULL, "points" integer NOT NULL DEFAULT 0, "lastActive" TIMESTAMP NOT NULL DEFAULT now(), "roomRoomCode" character varying, CONSTRAINT "PK_564f8521f0d5fd9ff86224cae9f" PRIMARY KEY ("connectionId"))`, undefined);
        await queryRunner.query(`CREATE TABLE "room_board_card" ("roomRoomCode" character varying NOT NULL, "cardId" integer NOT NULL, CONSTRAINT "PK_486ff6ecee1825f98430d0952e3" PRIMARY KEY ("roomRoomCode", "cardId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_ef33b42c39a4bfed2fdf0ffc27" ON "room_board_card" ("roomRoomCode") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_2d01410d303891237544d6fa99" ON "room_board_card" ("cardId") `, undefined);
        await queryRunner.query(`CREATE TABLE "room_available_cards_card" ("roomRoomCode" character varying NOT NULL, "cardId" integer NOT NULL, CONSTRAINT "PK_9d38186a0cdd86ed1aace9c1510" PRIMARY KEY ("roomRoomCode", "cardId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_bb7654d582128e6562cc06f232" ON "room_available_cards_card" ("roomRoomCode") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_c9e3b9cbda974cfc676909c890" ON "room_available_cards_card" ("cardId") `, undefined);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_00cadcbde9ab832c87dc54f1cc9" FOREIGN KEY ("roomRoomCode") REFERENCES "room"("roomCode") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "room_board_card" ADD CONSTRAINT "FK_ef33b42c39a4bfed2fdf0ffc275" FOREIGN KEY ("roomRoomCode") REFERENCES "room"("roomCode") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "room_board_card" ADD CONSTRAINT "FK_2d01410d303891237544d6fa99a" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "room_available_cards_card" ADD CONSTRAINT "FK_bb7654d582128e6562cc06f2326" FOREIGN KEY ("roomRoomCode") REFERENCES "room"("roomCode") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "room_available_cards_card" ADD CONSTRAINT "FK_c9e3b9cbda974cfc676909c890c" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room_available_cards_card" DROP CONSTRAINT "FK_c9e3b9cbda974cfc676909c890c"`, undefined);
        await queryRunner.query(`ALTER TABLE "room_available_cards_card" DROP CONSTRAINT "FK_bb7654d582128e6562cc06f2326"`, undefined);
        await queryRunner.query(`ALTER TABLE "room_board_card" DROP CONSTRAINT "FK_2d01410d303891237544d6fa99a"`, undefined);
        await queryRunner.query(`ALTER TABLE "room_board_card" DROP CONSTRAINT "FK_ef33b42c39a4bfed2fdf0ffc275"`, undefined);
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_00cadcbde9ab832c87dc54f1cc9"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_c9e3b9cbda974cfc676909c890"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_bb7654d582128e6562cc06f232"`, undefined);
        await queryRunner.query(`DROP TABLE "room_available_cards_card"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_2d01410d303891237544d6fa99"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_ef33b42c39a4bfed2fdf0ffc27"`, undefined);
        await queryRunner.query(`DROP TABLE "room_board_card"`, undefined);
        await queryRunner.query(`DROP TABLE "player"`, undefined);
        await queryRunner.query(`DROP TABLE "room"`, undefined);
        await queryRunner.query(`DROP TABLE "card"`, undefined);
        await queryRunner.query(`DROP TYPE "card_color_enum"`, undefined);
        await queryRunner.query(`DROP TYPE "card_fillstyle_enum"`, undefined);
        await queryRunner.query(`DROP TYPE "card_shape_enum"`, undefined);
    }

}
