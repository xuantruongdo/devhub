import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChatSystemTable1775803834239 implements MigrationInterface {
    name = 'AddChatSystemTable1775803834239'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "conversation_participant" ("id" SERIAL NOT NULL, "conversationId" integer NOT NULL, "userId" integer NOT NULL, "lastReadMessageId" integer, "unreadCount" integer NOT NULL DEFAULT '0', "isMuted" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_326cbb9ee8891f8e29157bda911" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_497b032725751e1aad8a85832a" ON "conversation_participant" ("conversationId", "userId") `);
        await queryRunner.query(`CREATE TABLE "conversation" ("id" SERIAL NOT NULL, "isGroup" boolean NOT NULL DEFAULT false, "title" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."message_type_enum" AS ENUM('text', 'image', 'file')`);
        await queryRunner.query(`CREATE TABLE "message" ("id" SERIAL NOT NULL, "conversationId" integer NOT NULL, "senderId" integer NOT NULL, "type" "public"."message_type_enum" NOT NULL DEFAULT 'text', "content" text, "fileUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bc096b4e18b1f9508197cd9806" ON "message" ("senderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7cf4a4df1f2627f72bf6231635" ON "message" ("conversationId") `);
        await queryRunner.query(`ALTER TABLE "conversation_participant" ADD CONSTRAINT "FK_b1a75fd6cdb0ab0a82c5b01c34f" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_participant" ADD CONSTRAINT "FK_dd90174e375c888d7f431cf829e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f"`);
        await queryRunner.query(`ALTER TABLE "conversation_participant" DROP CONSTRAINT "FK_dd90174e375c888d7f431cf829e"`);
        await queryRunner.query(`ALTER TABLE "conversation_participant" DROP CONSTRAINT "FK_b1a75fd6cdb0ab0a82c5b01c34f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7cf4a4df1f2627f72bf6231635"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc096b4e18b1f9508197cd9806"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TYPE "public"."message_type_enum"`);
        await queryRunner.query(`DROP TABLE "conversation"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_497b032725751e1aad8a85832a"`);
        await queryRunner.query(`DROP TABLE "conversation_participant"`);
    }

}
