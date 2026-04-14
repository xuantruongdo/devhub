import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTypeMessage1776075846161 implements MigrationInterface {
    name = 'UpdateTypeMessage1776075846161'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" ADD "callDuration" integer`);
        await queryRunner.query(`ALTER TABLE "message" ADD "callStatus" character varying`);
        await queryRunner.query(`ALTER TYPE "public"."message_type_enum" RENAME TO "message_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."message_type_enum" AS ENUM('text', 'image', 'file', 'call')`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "type" TYPE "public"."message_type_enum" USING "type"::"text"::"public"."message_type_enum"`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "type" SET DEFAULT 'text'`);
        await queryRunner.query(`DROP TYPE "public"."message_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."message_type_enum_old" AS ENUM('text', 'image', 'file')`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "type" TYPE "public"."message_type_enum_old" USING "type"::"text"::"public"."message_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "type" SET DEFAULT 'text'`);
        await queryRunner.query(`DROP TYPE "public"."message_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."message_type_enum_old" RENAME TO "message_type_enum"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "callStatus"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "callDuration"`);
    }

}
