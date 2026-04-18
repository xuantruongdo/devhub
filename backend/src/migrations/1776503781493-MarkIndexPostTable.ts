import { MigrationInterface, QueryRunner } from "typeorm";

export class MarkIndexPostTable1776503781493 implements MigrationInterface {
    name = 'MarkIndexPostTable1776503781493'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_3b9070596923c21341d527f8a8" ON "post" ("visibility", "createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_fba5ccb4d382c7136e013a5875" ON "post" ("authorId", "createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fba5ccb4d382c7136e013a5875"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3b9070596923c21341d527f8a8"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
    }

}
