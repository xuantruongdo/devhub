import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationTable1775789989743 implements MigrationInterface {
    name = 'AddNotificationTable1775789989743'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('like_post', 'like_comment', 'comment', 'follow')`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" SERIAL NOT NULL, "recipientId" integer NOT NULL, "senderId" integer NOT NULL, "type" "public"."notification_type_enum" NOT NULL, "postId" integer, "commentId" integer, "isRead" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_74988dd03267155a640a6035e7" ON "notification" ("recipientId", "isRead") `);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_ab7cbe7a013ecac5da0a8f88884" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_c0af34102c13c654955a0c5078b" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_c0af34102c13c654955a0c5078b"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_ab7cbe7a013ecac5da0a8f88884"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_74988dd03267155a640a6035e7"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
    }

}
